// 导入共享的Supabase客户端实例
import supabase from './supabase.js'

/**
 * 压缩图片至适合头像的大小，并裁剪为1:1正方形
 * @param {File} file - 原始图片文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<File>} - 压缩后的新File对象
 */
async function compressImageForAvatar(file, options = {}) {
  const {
    targetSize = 300,   // 目标正方形尺寸（宽高相同）
    quality = 0.82,     // JPEG质量 (0.8-0.85在质量和体积间取得平衡)
    outputType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // 1. 设置Canvas为正方形
      canvas.width = targetSize;
      canvas.height = targetSize;
      
      // 2. 计算图片缩放比例，确保图片至少一个维度达到目标尺寸
      const scale = Math.max(targetSize / img.width, targetSize / img.height);
      const scaledWidth = Math.floor(img.width * scale);
      const scaledHeight = Math.floor(img.height * scale);
      
      // 3. 计算裁剪区域，居中裁剪为1:1正方形
      const offsetX = Math.floor((scaledWidth - targetSize) / 2);
      const offsetY = Math.floor((scaledHeight - targetSize) / 2);
      
      // 4. 使用高质量缩放算法
      ctx.imageSmoothingQuality = 'high';
      
      // 5. 绘制裁剪后的图片到Canvas
      // 参数说明：(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight)
      ctx.drawImage(
        img, 
        0, 0, img.width, img.height,  // 原始图片区域
        -offsetX, -offsetY, scaledWidth, scaledHeight  // 缩放并居中裁剪
      );

      // 6. 转换为Blob并生成新File
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
          
          console.log('头像压缩完成:', {
            原始大小: `${(file.size / 1024).toFixed(2)}KB`,
            压缩后: `${(blob.size / 1024).toFixed(2)}KB`,
            尺寸: `${targetSize}×${targetSize}px`
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
 * normal_user表的API集合
 * 提供查询、增加、删除、修改功能
 */
export const normalUserAPI = {
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

  /**
   * 上传头像到Supabase Storage
   * @param {File} file - 要上传的头像文件
   * @param {string} userId - 用户ID，用于生成唯一的文件名
   * @returns {Promise<{success: boolean, data: string|null, error: string|null}>} 操作结果，成功时返回头像URL
   */
  async uploadAvatar(file, userId) {
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
          processedFile = await compressImageForAvatar(file);
        }
      } catch (compressionError) {
        console.error('头像压缩失败，使用原始图片:', compressionError);
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
      
      console.log('准备上传头像:', { fileName, filePath, size: processedFile.size, type: processedFile.type });
      
      // 上传文件到Supabase Storage的UserAvatar桶
      console.log('开始Supabase上传操作:', {
        bucket: 'UserAvatar',
        filePath: filePath,
        fileType: processedFile.type,
        fileName: processedFile.name,
        fileSize: processedFile.size
      });
      
      const { data, error } = await supabase
        .storage
        .from('UserAvatar')
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
          return this._handleError(error, `头像上传失败: ${error.message}`);
        }
      }
      
      console.log('Supabase上传成功:', data);
      
      console.log('上传成功，正在获取公开URL');
      
      // 获取公开访问URL
      const { data: urlData, error: urlError } = await supabase
        .storage
        .from('UserAvatar')
        .getPublicUrl(filePath);
      
      if (urlError) {
        console.error('获取URL错误:', urlError);
        return this._handleError(urlError, '获取头像URL失败');
      }
      
      console.log('头像上传成功:', { publicUrl: urlData.publicUrl });
      
      return {
        success: true,
        data: urlData.publicUrl,
        error: null
      };
    } catch (err) {
      console.error('头像上传异常:', err);
      return this._handleError(err, '头像上传时发生错误');
    }
  },

  /**
   * 统计normal_user表中的用户数量
   * @returns {Promise<number>} 用户数量
   */
  async getCount() {
    const { count, error } = await supabase
    .from('normal_user')
    .select('*', { count: 'exact', head: true})

    if (error) {
      console.error('统计用户数量失败:', error)
      return 
    }
    
    return count
  },

  /**
   * 获取最近7天的用户增长数据
   * @returns {Promise<{success: boolean, data: Array|null, error: string|null}>} 最近7天的用户增长数据
   */
  async getUserGrowthData() {
    try {
      // 获取当前日期和7天前的日期
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6); // 包括今天在内的7天
      
      // 格式化日期为YYYY-MM-DD格式
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };
      
      const { data, error } = await supabase
        .from('normal_user')
        .select('created_at')
        .gte('created_at', formatDate(startDate))
        .lte('created_at', formatDate(endDate) + 'T23:59:59.999Z');
      
      if (error) {
        return this._handleError(error, '获取用户增长数据失败');
      }
      
      // 初始化7天数据数组
      const growthDataArray = [];
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      
      // 初始化每天的用户数为0
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i); // 使用新的日期对象，避免修改startDate
        const dateKey = formatDate(currentDate);
        const dayName = dayNames[currentDate.getDay()];
        
        growthDataArray.push({
          date: dateKey,
          day: dayName,
          count: 0
        });
      }
      
      // 统计每天的用户数
      data.forEach(user => {
        const userDate = formatDate(new Date(user.created_at));
        const dataItem = growthDataArray.find(item => item.date === userDate);
        if (dataItem) {
          dataItem.count++;
        }
      });
      
      return {
        success: true,
        data: growthDataArray,
        error: null
      };
    } catch (err) {
      return this._handleError(err, '获取用户增长数据时发生错误');
    }
  },

  /**
   * 检查用户名是否已存在
   * @param {string} userName - 要检查的用户名
   * @param {string} [excludeName=null] - 要排除的用户名（用于更新操作）
   * @returns {Promise<{exists: boolean, error: string|null}>} 检查结果
   */
  async _checkUserNameExists(userName, excludeName = null) {
    try {
      let query = supabase
        .from('normal_user')
        .select('id')
        .eq('user_name', userName)
        .limit(1)

      // 如果提供了排除的用户名，并且与要检查的用户名不同，则添加不等于条件
      if (excludeName && userName !== excludeName) {
        query = query.neq('user_name', excludeName)
      }

      const { data, error } = await query
      
      if (error) {
        console.error('检查用户名是否存在失败:', error)
        return { exists: false, error: error.message }
      }

      return { exists: data && data.length > 0, error: null }
    } catch (err) {
      console.error('检查用户名时发生错误:', err)
      return { exists: false, error: '检查用户名时发生错误' }
    }
  },

  /**
   * 根据用户名查询用户信息
   * @param {string} userName - 用户名
   * @param {Array<string>} [selectFields=['id', 'password', 'user_image']] - 要查询的字段
   * @returns {Promise<Object|null>} 查询结果
   */
  async getUserByName(userName, selectFields = ['id', 'password', 'user_image']) {
    try {
      const { data, error } = await supabase
        .from('normal_user')
        .select(selectFields.join(','))
        .eq('user_name', userName)
        .single()
      
      if (error) {
        console.error('查询用户失败:', error)
        return null
      }
      
      return data
    } catch (err) {
      console.error('查询用户时发生错误:', err)
      return null
    }
  },

  /**
   * 用户登录验证
   * @param {string} userName - 用户名
   * @param {string} password - 密码
   * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>} 登录结果
   */
  async login(userName, password) {
    try {
      // 根据用户名查询用户信息，获取所有字段
      const userData = await this.getUserByName(userName, ['*'])
      
      if (!userData) {
        return {
          success: false,
          data: null,
          error: '用户名或密码错误'
        }
      }
      
      // 验证密码是否匹配
      if (userData.password !== password) {
        return {
          success: false,
          data: null,
          error: '用户名或密码错误'
        }
      }
      
      // 登录成功，移除密码字段后直接返回用户信息
      const { password: _, ...userDataWithoutPassword } = userData
      
      return {
        success: true,
        data: userDataWithoutPassword,
        error: null
      }
    } catch (err) {
      return this._handleError(err, '登录过程中发生未知错误')
    }
  },

  /**
   * 用户注册
   * @param {string} userName - 用户名
   * @param {string} password - 密码
   * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>} 注册结果
   */
  // 修改register方法
  async register(userName, password) {
    try {
    // 验证输入参数
    if (!userName || !password) {
      return {
        success: false,
        data: null,
        error: '用户名和密码为必填项'
      }
    }
  
    // 检查用户名是否已存在
    const { exists, error: checkError } = await this._checkUserNameExists(userName)
    
    if (checkError) {
      return this._handleError(checkError, '注册过程中发生错误')
    }
  
    // 如果用户名已存在
    if (exists) {
      return {
        success: false,
        data: null,
        error: '该用户名已被注册，请选择其他用户名'
      }
    }
  
    // 生成数字类型的唯一ID（使用时间戳的后几位+随机数）
    const uniqueId = Math.floor(Date.now() / 1000) * 1000 + Math.floor(Math.random() * 1000);
  
    // 用户名可用，创建新用户
    const { data: newUser, error: createError } = await supabase
      .from('normal_user')
      .insert([{
        id: uniqueId,  // 数字类型ID
        user_name: userName,
        password: password,
        user_image: 'https://uunfvyozplyovhrffnqn.supabase.co/storage/v1/object/public/UserAvatar/683_1764995455209.png', // 默认头像
        introduction: '' // 默认简介为空
      }])
      .select('id, user_name, user_image, introduction') // 不返回密码，包含简介
      .single()
    
    if (createError) {
      return this._handleError(createError, '创建用户失败')
    }
    
    return {
      success: true,
      data: newUser,
      error: null
    }
  } catch (err) {
    return this._handleError(err, '注册过程中发生未知错误')
  }
  },
  
  // 修改addUser方法
  async addUser(userData) {
    try {
    // 验证必填字段
    if (!userData.user_name || !userData.password) {
      return {
        success: false,
        data: null,
        error: '用户名和密码为必填项'
      }
    }
  
    // 检查用户名是否已存在
    const { exists, error: checkError } = await this._checkUserNameExists(userData.user_name)
    
    if (checkError) {
      return this._handleError(checkError, '添加用户过程中发生错误')
    }
  
    // 如果用户名已存在
    if (exists) {
      return {
        success: false,
        data: null,
        error: '该用户名已被使用，请选择其他用户名'
      }
    }
  
    // 生成数字类型的唯一ID
    const uniqueId = Math.floor(Date.now() / 1000) * 1000 + Math.floor(Math.random() * 1000);
  
    const { data, error } = await supabase
      .from('normal_user')
      .insert([{
        id: uniqueId,  // 数字类型ID
        user_name: userData.user_name,
        password: userData.password,
        user_image: userData.user_image || null
      }])
      .select()
      .single()
    
    if (error) {
      return this._handleError(error, '创建用户失败')
    }
    
    return {
      success: true,
      data,
      error: null
    }
  } catch (err) {
    return this._handleError(err, '创建用户时发生未知错误')
  }
  },

  /**
   * 根据用户名删除用户
   * @param {string} userName - 用户名
   * @returns {Promise<{success: boolean, error: string|null}>} 删除结果
   */
  async deleteUserByName(userName) {
    try {
      const { error } = await supabase
        .from('normal_user')
        .delete()
        .eq('user_name', userName)
      
      if (error) {
        return this._handleError(error, '删除用户失败')
      }
      
      return {
        success: true,
        error: null
      }
    } catch (err) {
      return this._handleError(err, '删除用户时发生未知错误')
    }
  },

  /**
   * 修改用户名
   * @param {string} currentUserName - 当前用户名
   * @param {string} newUserName - 新用户名
   * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>} 修改结果
   */
  async changeUserName(currentUserName, newUserName) {
    try {
      // 验证参数
      if (!currentUserName || !newUserName) {
        return {
          success: false,
          data: null,
          error: '当前用户名和新用户名为必填项'
        }
      }

      // 检查新用户名是否与当前用户名相同
      if (currentUserName === newUserName) {
        return {
          success: false,
          data: null,
          error: '新用户名与当前用户名相同，请输入不同的用户名'
        }
      }

      // 检查新用户名是否已被使用
      const { exists, error: checkError } = await this._checkUserNameExists(newUserName)
      if (checkError) {
        return this._handleError(checkError, '修改用户名过程中发生错误')
      }

      if (exists) {
        return {
          success: false,
          data: null,
          error: '该用户名已被注册，请选择其他用户名'
        }
      }

      // 更新用户名
      const { data, error: updateError } = await supabase
        .from('normal_user')
        .update({ user_name: newUserName })
        .eq('user_name', currentUserName)
        .select()
        .single()

      if (updateError) {
        return this._handleError(updateError, '修改用户名失败')
      }

      // 返回更新后的用户信息（不包含密码）
      const { password: _, ...userDataWithoutPassword } = data

      return {
        success: true,
        data: userDataWithoutPassword,
        error: null
      }
    } catch (err) {
      return this._handleError(err, '修改用户名时发生未知错误')
    }
  },

  /**
   * 更新用户信息（不包括id）
   * @param {string} userName - 用户名（用于定位用户）
   * @param {Object} updateData - 更新数据
   * @param {string} [updateData.user_name] - 新用户名
   * @param {string} [updateData.password] - 新密码
   * @param {string|null} [updateData.user_image] - 新头像地址
   * @param {File|null} [updateData.avatar_file] - 新头像文件（可选，优先于user_image）
   * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>} 更新结果
   */
  async updateUserByName(userName, updateData) {
    try {
      // 移除可能存在的id字段，确保不修改id
      const { id, avatar_file, ...validUpdateData } = updateData

      // 如果提供了头像文件，则上传头像
      if (avatar_file && avatar_file instanceof File) {
        // 先获取用户信息以获取用户ID
        const user = await this.getUserByName(userName, ['id'])
        if (!user) {
          return this._handleError(new Error('用户不存在'), '更新用户失败')
        }

        // 上传头像
        const uploadResult = await this.uploadAvatar(avatar_file, user.id)
        if (!uploadResult.success) {
          return uploadResult
        }

        // 将上传后的URL添加到更新数据中
        validUpdateData.user_image = uploadResult.data
      }

      // 如果没有要更新的字段，直接返回成功
      if (Object.keys(validUpdateData).length === 0) {
        return {
          success: true,
          data: null,
          error: null
        }
      }

      // 如果要更新用户名，检查新用户名是否已被使用
      if (validUpdateData.user_name && validUpdateData.user_name !== userName) {
        const { exists, error: checkError } = await this._checkUserNameExists(validUpdateData.user_name, userName)
        
        if (checkError) {
          return this._handleError(checkError, '更新过程中发生错误')
        }

        if (exists) {
          return {
            success: false,
            data: null,
            error: '该用户名已被使用，请选择其他用户名'
          }
        }
      }

      const { data, error } = await supabase
        .from('normal_user')
        .update(validUpdateData)
        .eq('user_name', userName)
        .select()
        .single()
      
      if (error) {
        return this._handleError(error, '更新用户失败')
      }
      
      return {
        success: true,
        data,
        error: null
      }
    } catch (err) {
      return this._handleError(err, '更新用户时发生未知错误')
    }
  }
}

export default normalUserAPI