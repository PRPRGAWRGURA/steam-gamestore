import { createClient } from '@supabase/supabase-js'

// 创建Supabase客户端实例
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
      // 根据用户名查询用户信息
      const userData = await this.getUserByName(userName, ['id', 'user_name', 'user_image', 'password'])
      
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
        user_image: '/UserImage/001.png' // 默认头像为空
      }])
      .select('id, user_name, user_image') // 不返回密码
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
   * 更新用户信息（不包括id）
   * @param {string} userName - 用户名（用于定位用户）
   * @param {Object} updateData - 更新数据
   * @param {string} [updateData.user_name] - 新用户名
   * @param {string} [updateData.password] - 新密码
   * @param {string} [updateData.user_image] - 新头像地址
   * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>} 更新结果
   */
  async updateUserByName(userName, updateData) {
    try {
      // 移除可能存在的id字段，确保不修改id
      const { id, ...validUpdateData } = updateData

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