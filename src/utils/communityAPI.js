// 导入共享的Supabase客户端实例
import supabase from './supabase.js'

/**
 * 压缩图片至适合展示框的大小
 * @param {File} file - 原始图片文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<File>} - 压缩后的新File对象
 */
async function compressImageForDisplay(file, options = {}) {
  const {
    maxWidth = 700,   // 目标最大宽度（2倍于显示尺寸）
    maxHeight = 700,  // 目标最大高度
    quality = 0.82,   // JPEG质量 (0.8-0.85在质量和体积间取得平衡)
    outputType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // 1. 计算等比缩放后的尺寸
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      // 2. 设置Canvas尺寸并绘制
      canvas.width = width;
      canvas.height = height;
      
      // 可选：使用高质量缩放算法
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // 3. 转换为Blob并生成新File
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas转换失败'));
            return;
          }
          // 生成新文件名
          const newFileName = file.name.replace(
            /(\.[\w\d_-]+)$/i,
            `_compressed${Date.now()}$1`
          );
          const compressedFile = new File([blob], newFileName, {
            type: outputType,
            lastModified: Date.now()
          });
          
          console.log('压缩完成:', {
            原始大小: `${(file.size / 1024).toFixed(2)}KB`,
            压缩后: `${(blob.size / 1024).toFixed(2)}KB`,
            尺寸: `${width}×${height}px`
          });
          
          resolve(compressedFile);
        },
        outputType,
        quality // 应用质量参数
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 社区聊天相关的API集合
 * 提供消息和评论的查询、增加、删除、修改功能
 */
export const communityAPI = {
  /**
   * 处理通用错误并返回标准化的错误响应
   * @param {Error|Object} err - 错误对象
   * @param {string} defaultMessage - 默认错误消息
   * @returns {Object} 标准化的错误响应
   */
  _handleError(err, defaultMessage) {
    console.error(defaultMessage, err)
    return {
      success: false,
      data: null,
      error: err?.message || defaultMessage
    }
  },

  // ---------------- 消息相关API ----------------

  /**
   * 上传图片到Supabase Storage
   * @param {File} file - 要上传的图片文件
   * @param {string} userId - 用户ID，用于生成唯一的文件名
   * @returns {Promise<{success: boolean, data: string|null, error: string|null}>} 操作结果，成功时返回图片URL
   */
  async uploadImage(file, userId) {
    try {
      // 添加文件验证
      if (!file || !(file instanceof File)) {
        return this._handleError(new Error('无效的文件对象'), '请选择有效的图片文件');
      }
      
      // 验证文件类型
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        return this._handleError(new Error('不支持的文件类型'), `只支持以下图片格式: jpg, jpeg, png, gif, webp, svg`);
      }
      
      // 验证文件大小（限制为15MB）
      const maxSize = 15 * 1024 * 1024; // 15MB
      if (file.size > maxSize) {
        return this._handleError(new Error('文件过大'), '图片大小不能超过15MB');
      }
      
      // 压缩图片
      let processedFile = file;
      try {
        // 对于SVG图片，跳过压缩（Canvas不支持SVG）
        if (file.type !== 'image/svg+xml') {
          processedFile = await compressImageForDisplay(file);
        }
      } catch (compressionError) {
        console.error('图片压缩失败，使用原始图片:', compressionError);
        // 压缩失败时使用原始图片继续上传
      }
      
      // 生成唯一的文件名，直接上传到根目录
      // 使用用户ID的哈希值代替用户名，避免中文字符问题
      const userIdHash = userId.toString().split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      const timestamp = Date.now();
      const extension = processedFile.name.split('.').pop().toLowerCase();
      const fileName = `${userIdHash}_${timestamp}.${extension}`;
      const filePath = fileName; // 直接使用文件名，上传到根目录
      
      console.log('准备上传图片:', { fileName, filePath, size: processedFile.size, type: processedFile.type });
      
      // 上传文件到Supabase Storage的images桶
      console.log('开始Supabase上传操作:', {
        bucket: 'images',
        filePath: filePath,
        fileType: processedFile.type,
        fileName: processedFile.name,
        fileSize: processedFile.size
      });
      
      const { data, error } = await supabase
        .storage
        .from('images')
        .upload(filePath, processedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: processedFile.type // 明确指定content-type
        });
      
      if (error) {
        console.error('Supabase上传错误详情:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        // 处理特定的Supabase错误
        if (error.code === '401' || error.code === '403') {
          return this._handleError(error, `没有上传权限: ${error.message}`);
        } else if (error.code === '413') {
          return this._handleError(error, '文件大小超过Supabase限制');
        } else if (error.code === '500') {
          return this._handleError(error, 'Supabase服务器错误，请稍后重试');
        } else {
          return this._handleError(error, `图片上传失败: ${error.message}`);
        }
      }
      
      console.log('Supabase上传成功:', data);
      
      console.log('上传成功，正在获取公开URL');
      
      // 获取公开访问URL
      const { data: urlData, error: urlError } = await supabase
        .storage
        .from('images')
        .getPublicUrl(filePath);
      
      if (urlError) {
        console.error('获取URL错误:', urlError);
        return this._handleError(urlError, '获取图片URL失败');
      }
      
      console.log('图片上传成功:', { publicUrl: urlData.publicUrl });
      
      return {
        success: true,
        data: urlData.publicUrl,
        error: null
      };
    } catch (err) {
      console.error('图片上传异常:', err);
      return this._handleError(err, '图片上传时发生错误');
    }
  },

  /**
   * 发布新消息
   * @param {Object} postData - 消息数据
   * @param {string} postData.user_id - 用户ID
   * @param {string} postData.content - 消息内容
   * @param {File|null} postData.image - 图片文件（可选）
   * @returns {Promise<{success: boolean, data: Object|null, error: string|Object|null}>} 操作结果
   */
  async createPost(postData) {
    try {
      // 验证必要字段
      if (!postData.user_id) {
        return this._handleError(new Error('缺少用户ID'), '用户未登录');
      }
      
      // 内容或图片至少需要一个
      if (!postData.content && !postData.image) {
        return this._handleError(new Error('消息内容为空'), '请输入消息内容或添加图片');
      }
      
      console.log('开始创建帖子:', {
        userId: postData.user_id,
        hasContent: !!postData.content,
        hasImage: !!postData.image
      });
      
      let imageUrl = null;
      
      // 如果提供了图片文件，则上传图片
      if (postData.image && postData.image instanceof File) {
        console.log('开始上传图片');
        const uploadResult = await this.uploadImage(postData.image, postData.user_id);
        if (!uploadResult.success) {
          console.error('图片上传失败，返回错误:', uploadResult.error);
          // 增强错误对象，添加错误代码和详细信息
          const enhancedError = {
            message: uploadResult.error,
            code: 'IMAGE_UPLOAD_FAILED',
            details: uploadResult.error
          };
          return {
            success: false,
            data: null,
            error: enhancedError
          };
        }
        imageUrl = uploadResult.data;
        console.log('图片上传成功，URL:', imageUrl);
      }
      
      // 插入帖子数据到数据库，并获取关联的用户数据
      console.log('准备插入数据库记录');
      const { data, error } = await supabase
        .from('community_post')
        .insert([{
          user_id: postData.user_id,
          content: postData.content || '',
          image_url: imageUrl,
          created_at: new Date().toISOString()
        }])
        .select(`
          *, 
          normal_user (user_name, user_image)
        `)
        .single();

      if (error) {
        console.error('数据库插入失败:', error);
        // 如果数据库插入失败，尝试删除已上传的图片
        if (imageUrl) {
          try {
            const fileName = imageUrl.split('/').pop();
            console.log('尝试删除上传的图片:', fileName);
            await supabase.storage.from('images').remove([`PostImage/${fileName}`]);
          } catch (deleteError) {
            console.error('删除失败的上传图片时出错:', deleteError);
          }
        }
        // 增强数据库错误
        const dbError = {
          message: '发布消息失败',
          code: error.code || 'DATABASE_ERROR',
          details: error.details || error.message || ''
        };
        return {
          success: false,
          data: null,
          error: dbError
        };
      }

      console.log('帖子创建成功:', data.id);
      return {
        success: true,
        data,
        error: null
      };
    } catch (err) {
      console.error('创建帖子时发生异常:', err);
      // 增强捕获的异常
      const exceptionError = {
        message: '发布消息时发生错误',
        code: 'UNEXPECTED_ERROR',
        details: err.message || ''
      };
      return {
        success: false,
        data: null,
        error: exceptionError
      };
    }
  },

  /**
   * 获取消息列表
   * @param {Object} options - 查询选项
   * @param {number} options.limit - 返回数量限制
   * @param {number} options.offset - 偏移量
   * @returns {Promise<{success: boolean, data: Array|null, error: string|null}>} 操作结果
   */
  async getPosts(options = { limit: 20, offset: 0 }) {
    try {
      const { data, error } = await supabase
        .from('community_post')
        .select(`
          *, 
          normal_user (user_name, user_image)
        `)
        .order('created_at', { ascending: false })
        .limit(options.limit)
        .range(options.offset, options.offset + options.limit - 1)

      if (error) {
        return this._handleError(error, '获取消息列表失败')
      }

      return {
        success: true,
        data,
        error: null
      }
    } catch (err) {
      return this._handleError(err, '获取消息列表时发生错误')
    }
  },

  /**
   * 根据ID获取消息详情
   * @param {string} postId - 消息ID
   * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>} 操作结果
   */
  async getPostById(postId) {
    try {
      const { data, error } = await supabase
        .from('community_post')
        .select(`
          *, 
          normal_user (user_name, user_image)
        `)
        .eq('id', postId)
        .single()

      if (error) {
        return this._handleError(error, '获取消息详情失败')
      }

      return {
        success: true,
        data,
        error: null
      }
    } catch (err) {
      return this._handleError(err, '获取消息详情时发生错误')
    }
  },

  /**
   * 更新消息
   * @param {string} postId - 消息ID
   * @param {Object} updateData - 更新数据
   * @param {string} updateData.content - 消息内容（可选）
   * @param {string|null} updateData.image_url - 图片URL（可选）
   * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>} 操作结果
   */
  async updatePost(postId, updateData) {
    try {
      const { data, error } = await supabase
        .from('community_post')
        .update(updateData)
        .eq('id', postId)
        .select(`
          *, 
          normal_user (user_name, user_image)
        `)
        .single()

      if (error) {
        return this._handleError(error, '更新消息失败')
      }

      return {
        success: true,
        data,
        error: null
      }
    } catch (err) {
      return this._handleError(err, '更新消息时发生错误')
    }
  },

  /**
   * 删除消息
   * @param {string} postId - 消息ID
   * @returns {Promise<{success: boolean, error: string|null}>} 操作结果
   */
  async deletePost(postId) {
    try {
      // 先删除相关评论
      await supabase
        .from('community_comment')
        .delete()
        .eq('post_id', postId)

      // 再删除消息
      const { error } = await supabase
        .from('community_post')
        .delete()
        .eq('id', postId)

      if (error) {
        return this._handleError(error, '删除消息失败')
      }

      return {
        success: true,
        error: null
      }
    } catch (err) {
      return this._handleError(err, '删除消息时发生错误')
    }
  },

  // ---------------- 评论相关API ----------------

  /**
   * 发布新评论（仅支持文字）
   * @param {Object} commentData - 评论数据
   * @param {string} commentData.post_id - 消息ID
   * @param {string} commentData.user_id - 用户ID
   * @param {string} commentData.content - 评论内容
   * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>} 操作结果
   */
  async createComment(commentData) {
    try {
      // 确保不包含图片字段
      if (commentData.image_url) {
        return {
          success: false,
          data: null,
          error: '评论不支持图片'
        }
      }

      const { data, error } = await supabase
        .from('community_comment')
        .insert([{
          post_id: commentData.post_id,
          user_id: commentData.user_id,
          content: commentData.content,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        return this._handleError(error, '发布评论失败')
      }

      return {
        success: true,
        data,
        error: null
      }
    } catch (err) {
      return this._handleError(err, '发布评论时发生错误')
    }
  },

  /**
   * 根据消息ID获取评论列表
   * @param {string} postId - 消息ID
   * @returns {Promise<{success: boolean, data: Array|null, error: string|null}>} 操作结果
   */
  async getCommentsByPostId(postId) {
    try {
      const { data, error } = await supabase
        .from('community_comment')
        .select(`
          *, 
          normal_user (user_name, user_image)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) {
        return this._handleError(error, '获取评论列表失败')
      }

      return {
        success: true,
        data,
        error: null
      }
    } catch (err) {
      return this._handleError(err, '获取评论列表时发生错误')
    }
  },

  /**
   * 更新评论
   * @param {string} commentId - 评论ID
   * @param {Object} updateData - 更新数据
   * @param {string} updateData.content - 评论内容
   * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>} 操作结果
   */
  async updateComment(commentId, updateData) {
    try {
      // 确保不包含图片字段
      if (updateData.image_url) {
        return {
          success: false,
          data: null,
          error: '评论不支持图片'
        }
      }

      const { data, error } = await supabase
        .from('community_comment')
        .update({ content: updateData.content })
        .eq('id', commentId)
        .select()
        .single()

      if (error) {
        return this._handleError(error, '更新评论失败')
      }

      return {
        success: true,
        data,
        error: null
      }
    } catch (err) {
      return this._handleError(err, '更新评论时发生错误')
    }
  },

  /**
   * 删除评论
   * @param {string} commentId - 评论ID
   * @returns {Promise<{success: boolean, error: string|null}>} 操作结果
   */
  async deleteComment(commentId) {
    try {
      const { error } = await supabase
        .from('community_comment')
        .delete()
        .eq('id', commentId)

      if (error) {
        return this._handleError(error, '删除评论失败')
      }

      return {
        success: true,
        error: null
      }
    } catch (err) {
      return this._handleError(err, '删除评论时发生错误')
    }
  },

  // ---------------- 点赞相关API ----------------

  /**
   * 切换帖子点赞状态
   * @param {string} postId - 帖子ID
   * @param {string} userId - 用户ID
   * @returns {Promise<{success: boolean, data: {liked: boolean, likes: number}, error: string|null}>} 操作结果
   */
  async toggleLike(postId, userId) {
    try {
      // 1. 从本地存储获取用户点赞状态
      const likedPosts = JSON.parse(localStorage.getItem(`liked_posts_${userId}`) || '[]');
      const isLiked = likedPosts.includes(postId);
      
      // 2. 获取当前帖子点赞数量
      const { data: post, error: getError } = await supabase
        .from('community_post')
        .select('id, like')
        .eq('id', postId)
        .single();

      if (getError) {
        return this._handleError(getError, '获取帖子信息失败')
      }

      if (!post) {
        return this._handleError(new Error('帖子不存在'), '帖子不存在')
      }

      // 3. 计算新的点赞数量
      const currentLikes = post.like || 0;
      let newLikes;
      let newLiked = false;
      let updatedLikedPosts;

      if (isLiked) {
        // 取消点赞，点赞数减1
        newLikes = Math.max(0, currentLikes - 1);
        updatedLikedPosts = likedPosts.filter(id => id !== postId);
      } else {
        // 添加点赞，点赞数加1
        newLikes = currentLikes + 1;
        newLiked = true;
        updatedLikedPosts = [...likedPosts, postId];
      }

      // 4. 更新本地存储
      localStorage.setItem(`liked_posts_${userId}`, JSON.stringify(updatedLikedPosts));

      // 5. 更新服务器点赞数量
      const { error: updateError } = await supabase
        .from('community_post')
        .update({ like: newLikes })
        .eq('id', postId);

      if (updateError) {
        return this._handleError(updateError, '更新点赞数量失败')
      }

      return {
        success: true,
        data: {
          liked: newLiked,
          likes: newLikes
        },
        error: null
      }
    } catch (err) {
      return this._handleError(err, '切换点赞状态时发生错误')
    }
  },

  /**
   * 获取帖子的点赞状态
   * @param {string} postId - 帖子ID
   * @param {string} userId - 用户ID
   * @returns {Promise<{success: boolean, data: {liked: boolean, likes: number}, error: string|null}>} 操作结果
   */
  async getLikeStatus(postId, userId) {
    try {
      // 1. 从本地存储获取点赞状态
      const likedPosts = JSON.parse(localStorage.getItem(`liked_posts_${userId}`) || '[]');
      const isLiked = likedPosts.includes(postId);
      
      // 2. 获取当前帖子点赞数量
      const { data: post, error: getError } = await supabase
        .from('community_post')
        .select('id, like')
        .eq('id', postId)
        .single();

      if (getError) {
        return this._handleError(getError, '获取帖子信息失败')
      }

      return {
        success: true,
        data: {
          liked: isLiked,
          likes: post.like || 0
        },
        error: null
      }
    } catch (err) {
      return this._handleError(err, '获取点赞状态时发生错误')
    }
  }
}