import { createClient } from '@supabase/supabase-js'

// 创建Supabase客户端实例
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY 
const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
   * 发布新消息
   * @param {Object} postData - 消息数据
   * @param {string} postData.user_id - 用户ID
   * @param {string} postData.content - 消息内容
   * @param {string|null} postData.image_url - 图片URL（可选）
   * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>} 操作结果
   */
  async createPost(postData) {
    try {
      const { data, error } = await supabase
        .from('community_post')
        .insert([{
          user_id: postData.user_id,
          content: postData.content,
          image_url: postData.image_url || null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        return this._handleError(error, '发布消息失败')
      }

      return {
        success: true,
        data,
        error: null
      }
    } catch (err) {
      return this._handleError(err, '发布消息时发生错误')
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
        .select()
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
  }
}