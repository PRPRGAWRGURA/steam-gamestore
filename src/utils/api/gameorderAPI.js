// 导入共享的Supabase客户端实例
import supabase from '../core/supabase.js'
import { gameitemAPI } from './gameitemAPI.js'
import { gamelibraryAPI } from './gamelibraryAPI.js'

/**
 * 游戏订单相关表结构说明
 * 
 * 表名：user_gameorder
 * 字段说明：
 * - id: INT, PRIMARY KEY - 订单唯一标识符
 * - user_id: INT8, FOREIGN KEY - 用户id
 * - game_id: INT8, FOREIGN KEY - 游戏id
 * - buy_price: FLOAT8 - 购买时价格
 * - status: TEXT - 订单状态
 * - updated_at: TIMESTAMP - 订单更新时间
 * - created_at: TIMESTAMP - 订单创建时间
 */

// 订单状态常量
export const ORDER_STATUS = {
  PENDING: 'pending',    // 未支付
  PURCHASED: 'purchased' // 已购买
}

/**
 * 创建订单（加入购物车）
 * @param {number} userId - 用户ID
 * @param {number} gameId - 游戏ID
 * @param {number} price - 购买价格
 * @returns {Promise<{success: boolean, data: any, error: string}>}
 */
export const createOrder = async (userId, gameId, price) => {
  try {
    // 检查是否已经存在未支付的相同游戏订单
    const { data: existingOrder, error: checkError } = await supabase
      .from('user_gameorder')
      .select('id')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .eq('status', ORDER_STATUS.PENDING)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116是未找到记录的错误
      console.error('检查订单失败:', checkError)
      return { success: false, error: '检查订单失败' }
    }

    // 如果已经存在未支付的订单，直接返回成功
    if (existingOrder) {
      return { success: true, data: existingOrder, error: null }
    }

    // 创建新订单
    const { data, error } = await supabase
      .from('user_gameorder')
      .insert({
        user_id: userId,
        game_id: gameId,
        buy_price: price,
        status: ORDER_STATUS.PENDING
      })
      .select()
      .single()

    if (error) {
      console.error('创建订单失败:', error)
      return { success: false, error: '创建订单失败' }
    }

    return { success: true, data, error: null }
  } catch (error) {
    console.error('创建订单时发生错误:', error)
    return { success: false, error: '创建订单时发生错误' }
  }
}

/**
 * 获取用户购物车（未支付订单）
 * @param {number} userId - 用户ID
 * @returns {Promise<{success: boolean, data: Array, error: string}>}
 */
export const getShoppingCart = async (userId) => {
  try {
    // 获取用户的未支付订单
    const { data: orders, error: orderError } = await supabase
      .from('user_gameorder')
      .select('id, game_id, buy_price, created_at')
      .eq('user_id', userId)
      .eq('status', ORDER_STATUS.PENDING)

    if (orderError) {
      console.error('获取订单失败:', orderError)
      return { success: false, error: '获取订单失败' }
    }

    if (orders.length === 0) {
      return { success: true, data: [], error: null }
    }

    // 获取所有游戏的详细信息
    const gameIds = orders.map(order => order.game_id)
    const gameDetails = await Promise.all(
      gameIds.map(async (gameId) => {
        const gameResult = await gameitemAPI.getGameById(gameId)
        return gameResult.success ? gameResult.data : null
      })
    )

    // 组合订单和游戏信息
    const cartItems = orders.map((order, index) => {
      const game = gameDetails[index]
      return {
        orderId: order.id,
        gameId: order.game_id,
        name: game?.game_name || '未知游戏',
        price: order.buy_price,
        image: game?.hero_img || game?.header_img || game?.library_img || '',
        createdAt: order.created_at
      }
    }).filter(item => item.name !== '未知游戏') // 过滤掉获取游戏信息失败的项目

    return { success: true, data: cartItems, error: null }
  } catch (error) {
    console.error('获取购物车时发生错误:', error)
    return { success: false, error: '获取购物车时发生错误' }
  }
}

/**
 * 更新订单状态
 * @param {number} orderId - 订单ID
 * @param {string} status - 新状态
 * @returns {Promise<{success: boolean, data: any, error: string}>}
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data, error } = await supabase
      .from('user_gameorder')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('更新订单状态失败:', error)
      return { success: false, error: '更新订单状态失败' }
    }

    return { success: true, data, error: null }
  } catch (error) {
    console.error('更新订单状态时发生错误:', error)
    return { success: false, error: '更新订单状态时发生错误' }
  }
}

/**
 * 批量更新订单状态（结算）
 * @param {number} userId - 用户ID
 * @param {Array<number>} orderIds - 订单ID数组
 * @returns {Promise<{success: boolean, data: any, error: string}>}
 */
export const batchUpdateOrderStatus = async (userId, orderIds) => {
  try {
    // 首先获取这些订单的详细信息，包括游戏ID
    const { data: orders, error: ordersError } = await supabase
      .from('user_gameorder')
      .select('id, game_id')
      .eq('user_id', userId)
      .in('id', orderIds)
      .eq('status', ORDER_STATUS.PENDING)

    if (ordersError) {
      console.error('获取订单信息失败:', ordersError)
      return { success: false, error: '获取订单信息失败' }
    }

    // 批量更新订单状态
    const updatePromises = orderIds.map(orderId => 
      supabase
        .from('user_gameorder')
        .update({ status: ORDER_STATUS.PURCHASED })
        .eq('id', orderId)
        .eq('user_id', userId)
        .eq('status', ORDER_STATUS.PENDING)
        .select()
    )

    const results = await Promise.all(updatePromises)
    
    // 检查是否所有更新都成功
    const failedResults = results.filter(result => result.error)
    
    if (failedResults.length > 0) {
      console.error('部分订单更新失败:', failedResults)
      return { success: false, error: '部分订单更新失败' }
    }

    // 将购买的游戏添加到游戏库
    const gameIds = orders.map(order => order.game_id)
    await gamelibraryAPI.batchAddGamesToLibrary(userId, gameIds)

    const updatedOrders = results.map(result => result.data).flat()
    return { success: true, data: updatedOrders, error: null }
  } catch (error) {
    console.error('批量更新订单状态时发生错误:', error)
    return { success: false, error: '批量更新订单状态时发生错误' }
  }
}

/**
 * 删除订单（从购物车移除）
 * @param {number} orderId - 订单ID
 * @param {number} userId - 用户ID
 * @returns {Promise<{success: boolean, error: string}>}
 */
export const deleteOrder = async (orderId, userId) => {
  try {
    const { error } = await supabase
      .from('user_gameorder')
      .delete()
      .eq('id', orderId)
      .eq('user_id', userId)
      .eq('status', ORDER_STATUS.PENDING)

    if (error) {
      console.error('删除订单失败:', error)
      return { success: false, error: '删除订单失败' }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('删除订单时发生错误:', error)
    return { success: false, error: '删除订单时发生错误' }
  }
}

/**
 * 导出游戏订单API
 */
export const gameorderAPI = {
  createOrder,
  getShoppingCart,
  updateOrderStatus,
  batchUpdateOrderStatus,
  deleteOrder,
  ORDER_STATUS
}
