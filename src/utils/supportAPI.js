import supabase from "./supabase.js";

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

export const supportAPI = {
    /**
     * 处理通用错误并返回标准化的错误响应
     * @param {Error|Object} err - 发生的错误对象或错误信息字符串
     * @param {string} defaultMessage - 默认错误消息
     * @returns {Object} - 标准化的错误响应对象
     */
    _handleError(err, defaultMessage) {
        console.error(defaultMessage, err)
        return {
            success: false,
            data: null,
            error: err?.message || defaultMessage
        }
    },

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
                bucket: 'Ticket',
                filePath: filePath,
                fileType: processedFile.type,
                fileName: processedFile.name,
                fileSize: processedFile.size
            });
            
            const { data, error } = await supabase
                .storage
                .from('Ticket')
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
                .from('Ticket')
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
     * 发送支持工单
     * @param {Object} ticketData - 工单数据对象，包含工单内容、用户ID等信息
     * @returns {Promise<Object>} - 包含工单发送结果的Promise对象
     */
    async createTicket(ticketData) {
        try {
            //验证必要字段
            if(!ticketData.user_id) {
                return this._handleError(new Error('缺少用户ID'),'用户未登录');
            }

            if (!ticketData.description && (!ticketData.attachments || ticketData.attachments.length === 0)) {
                return this._handleError(new Error('消息内容为空'), '请输入消息内容或添加图片');
            }

            console.log('开始创建工单', {
                userId: ticketData.user_id,
                hasContent: !!ticketData.description,
                hasAttachments: !!ticketData.attachments && ticketData.attachments.length > 0
            });

            let imageUrls = [];

            if(ticketData.attachments && Array.isArray(ticketData.attachments) && ticketData.attachments.length > 0) {
                console.log('开始上传附件，共', ticketData.attachments.length, '个文件');
                
                for (const attachment of ticketData.attachments) {
                    if (attachment instanceof File) {
                        const uploadResult = await this.uploadImage(attachment, ticketData.user_id);
                        if (!uploadResult.success) {
                            console.error('附件上传失败，返回错误:', uploadResult.error);
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
                        imageUrls.push(uploadResult.data);
                        console.log('附件上传成功，URL:', uploadResult.data);
                    }
                }
            }

            console.log('准备插入数据库记录');
            // 构建插入数据对象
            const insertData = {
                user_name: ticketData.user_id,
                feedback_msg: ticketData.description || '',
                feedback_image: imageUrls.length > 0 ? imageUrls.join(',') : null, // 用逗号分隔多个图片URL
                status: '待处理', // 默认状态为待处理
                created_at: new Date().toISOString()
            };
            
            // 如果提供了type字段，添加到插入数据中
            if (ticketData.type) {
                insertData.type = ticketData.type;
            }
            
            const { data, error } = await supabase
                .from('support_post')
                .insert([insertData])
                .select(`
                    *,
                    normal_user (user_name)
                `)
                .single();
            
            if (error) {
                console.error('数据库插入失败:', error);
                if(imageUrls && imageUrls.length > 0) {
                    try {
                        const fileNames = imageUrls.map(url => url.split('/').pop());
                        console.log('尝试删除上传的图片:', fileNames);
                        await supabase.storage.from('Ticket').remove(fileNames);
                    } catch (deleteError) {
                        console.error('删除失败的上传图片时出错:', deleteError);
                    }
                }
                const dbError = {
                    message: '创建工单失败',
                    code: error.code || 'DATABASE_ERROR',
                    details: error.details || error.message || ''
                };
                return {
                    success: false,
                    data: null,
                    error: dbError
                };
            }

            console.log('工单创建成功:', data.id);
            return {
                success: true,
                data,
                error: null
            };
        } catch(err) {
            console.error('创建工单时发生异常', err);
            const exceptionError = {
                message: '创建工单时发生错误',
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
     * 获取工单列表
     * @param {Object} options - 查询选项
     * @param {number} options.limit - 返回数量限制
     * @param {number} options.offset - 偏移量
     * @returns {Promise<{success: boolean, data: Array|null, error: string|null}>} 操作结果
     */
    async getTickets(options = { limit: 20, offset: 0 }) {
        try {
            const { data, error } = await supabase
                .from('support_post')
                .select(`
                    *,
                    normal_user (user_name)
                `)
                .order('created_at', { ascending: false })
                .limit(options.limit)
                .range(options.offset, options.offset + options.limit - 1);

            if (error) {
                return this._handleError(error, '获取工单列表失败');
            }

            return {
                success: true,
                data,
                error: null
            };
        } catch (err) {
            return this._handleError(err, '获取工单列表时发生错误');
        }
    },

    /**
     * 获取当前用户的所有请求
     * @param {string} userId - 用户ID
     * @returns {Promise<{success: boolean, data: Array|null, error: string|null}>} 操作结果
     */
    async getUserTickets(userId) {
        try {
            const { data, error } = await supabase
                .from('support_post')
                .select(`
                    *,
                    normal_user (user_name)
                `)
                .eq('user_name', userId)
                .order('created_at', { ascending: false });

            if (error) {
                return this._handleError(error, '获取用户请求列表失败');
            }

            return {
                success: true,
                data,
                error: null
            };
        } catch (err) {
            return this._handleError(err, '获取用户请求列表时发生错误');
        }
    },

    /**
     * 根据ID获取工单详情
     * @param {string} ticketId - 工单ID
     * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>} 操作结果
     */
    async getTicketById(ticketId) {
        try {
            const { data, error } = await supabase
                .from('support_post')
                .select(`
                    *,
                    normal_user (user_name)
                `)
                .eq('id', ticketId)
                .single();

            if (error) {
                return this._handleError(error, '获取工单详情失败');
            }

            return {
                success: true,
                data,
                error: null
            };
        } catch (err) {
            return this._handleError(err, '获取工单详情时发生错误');
        }
    },

    /**
     * 更新工单
     * @param {string} ticketId - 工单ID
     * @param {Object} updateData - 更新数据
     * @param {string} updateData.status - 工单状态
     * @param {string} updateData.feedback_msg - 工单内容（可选）
     * @param {string|null} updateData.feedback_image - 图片URL（可选）
     * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>} 操作结果
     */
    async updateTicket(ticketId, updateData) {
        try {
            const { data, error } = await supabase
                .from('support_post')
                .update(updateData)
                .eq('id', ticketId)
                .select(`
                    *,
                    normal_user (user_name)
                `)
                .single();

            if (error) {
                return this._handleError(error, '更新工单失败');
            }

            return {
                success: true,
                data,
                error: null
            };
        } catch (err) {
            return this._handleError(err, '更新工单时发生错误');
        }
    },

    /**
     * 删除工单
     * @param {string} ticketId - 工单ID
     * @returns {Promise<{success: boolean, error: string|null}>} 操作结果
     */
    async deleteTicket(ticketId) {
        try {
            // 先获取工单信息以检查是否有图片需要删除
            const { data: ticket, error: getError } = await supabase
                .from('support_post')
                .select('feedback_image')
                .eq('id', ticketId)
                .single();

            if (getError) {
                return this._handleError(getError, '获取工单信息失败');
            }

            // 如果有图片，尝试删除
            if (ticket && ticket.feedback_image) {
                try {
                    const fileName = ticket.feedback_image.split('/').pop();
                    console.log('尝试删除工单图片:', fileName);
                    await supabase.storage.from('Ticket').remove([fileName]);
                } catch (deleteError) {
                    console.error('删除工单图片时出错:', deleteError);
                    // 图片删除失败不影响工单删除
                }
            }

            // 再删除工单
            const { error } = await supabase
                .from('support_post')
                .delete()
                .eq('id', ticketId);

            if (error) {
                return this._handleError(error, '删除工单失败');
            }

            return {
                success: true,
                error: null
            };
        } catch (err) {
            return this._handleError(err, '删除工单时发生错误');
        }
    },

}
