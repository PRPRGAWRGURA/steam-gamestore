// 导入共享的Supabase客户端实例
import supabase from '../core/supabase.js'
import { gameitemAPI } from './gameitemAPI.js'

/**
 * 游戏库存相关表结构说明
 * 
 * 表名：user_gamelibrary
 * 字段说明：
 * - id: INT, PRIMARY KEY - 库存项唯一标识符
 * - user_id: INT8, FOREIGN KEY - 用户id
 * - game_id: INT8, FOREIGN KEY - 游戏id
 * - created_at: TIMESTAMP - 库存项创建时间
 */

/**
 * 获取用户游戏库
 * @param {number} userId - 用户ID
 * @returns {Promise<{success: boolean, data: Array, error: string}>}
 */
export const getUserGameLibrary = async (userId) => {
  try {
    // 从游戏库存表获取用户的游戏
    const { data: libraryItems, error: libraryError } = await supabase
      .from('user_gamelibrary')
      .select('id, game_id, created_at')
      .eq('user_id', userId)

    if (libraryError) {
      console.error('获取游戏库存失败:', libraryError)
      return { success: false, error: '获取游戏库存失败' }
    }

    if (libraryItems.length === 0) {
      return { success: true, data: [], error: null }
    }

    // 获取所有游戏的详细信息
    const gameIds = libraryItems.map(item => item.game_id)
    const gameDetails = await Promise.all(
      gameIds.map(async (gameId) => {
        const gameResult = await gameitemAPI.getGameById(gameId)
        return gameResult.success ? gameResult.data : null
      })
    )

    // 组合游戏库存和游戏信息
    const libraryGames = libraryItems.map((item, index) => {
      const game = gameDetails[index]
      return {
        id: item.id,
        gameId: item.game_id,
        name: game?.game_name || '未知游戏',
        coverImage: game?.library_img || game?.header_img || game?.hero_img || '',
        detailImage: game?.header_img || game?.hero_img || '',
        addedDate: item.created_at,
        playtime: {
          total: 0,
          recent: 0
        },
        genre: game?.game_type || '未知类型',
        developer: game?.game_publisher || '未知发行商'
      }
    }).filter(item => item.name !== '未知游戏') // 过滤掉获取游戏信息失败的项目

    return { success: true, data: libraryGames, error: null }
  } catch (error) {
    console.error('获取用户游戏库时发生错误:', error)
    return { success: false, error: '获取用户游戏库时发生错误' }
  }
}

/**
 * 检查游戏是否在用户库中
 * @param {number} userId - 用户ID
 * @param {number} gameId - 游戏ID
 * @returns {Promise<{success: boolean, data: boolean, error: string}>}
 */
export const checkGameInLibrary = async (userId, gameId) => {
  try {
    const { data: libraryItem, error } = await supabase
      .from('user_gamelibrary')
      .select('id')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116是未找到记录的错误
      console.error('检查游戏库存失败:', error)
      return { success: false, error: '检查游戏库存失败' }
    }

    return { success: true, data: !!libraryItem, error: null }
  } catch (error) {
    console.error('检查游戏是否在库中时发生错误:', error)
    return { success: false, error: '检查游戏是否在库中时发生错误' }
  }
}

/**
 * 添加游戏到用户库中
 * @param {number} userId - 用户ID
 * @param {number} gameId - 游戏ID
 * @returns {Promise<{success: boolean, data: any, error: string}>}
 */
export const addGameToLibrary = async (userId, gameId) => {
  try {
    // 检查游戏是否已经在库中
    const checkResult = await checkGameInLibrary(userId, gameId)
    
    if (!checkResult.success) {
      return checkResult
    }

    if (checkResult.data) {
      return { success: true, data: null, error: null } // 游戏已经在库中
    }

    // 添加游戏到库存
    const { data, error } = await supabase
      .from('user_gamelibrary')
      .insert({
        user_id: userId,
        game_id: gameId
      })
      .select()
      .single()

    if (error) {
      console.error('添加游戏到库存失败:', error)
      return { success: false, error: '添加游戏到库存失败' }
    }

    return { success: true, data, error: null }
  } catch (error) {
    console.error('添加游戏到库中时发生错误:', error)
    return { success: false, error: '添加游戏到库中时发生错误' }
  }
}

/**
 * 从用户库中移除游戏
 * @param {number} userId - 用户ID
 * @param {number} gameId - 游戏ID
 * @returns {Promise<{success: boolean, error: string}>}
 */
export const removeGameFromLibrary = async (userId, gameId) => {
  try {
    const { error } = await supabase
      .from('user_gamelibrary')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId)

    if (error) {
      console.error('从库存移除游戏失败:', error)
      return { success: false, error: '从库存移除游戏失败' }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('从库中移除游戏时发生错误:', error)
    return { success: false, error: '从库中移除游戏时发生错误' }
  }
}

/**
 * 批量添加游戏到用户库中
 * @param {number} userId - 用户ID
 * @param {Array<number>} gameIds - 游戏ID数组
 * @returns {Promise<{success: boolean, data: Array, error: string}>}
 */
export const batchAddGamesToLibrary = async (userId, gameIds) => {
  try {
    const addedGames = []
    
    for (const gameId of gameIds) {
      const result = await addGameToLibrary(userId, gameId)
      if (result.success && result.data) {
        addedGames.push(result.data)
      }
    }

    return { success: true, data: addedGames, error: null }
  } catch (error) {
    console.error('批量添加游戏到库中时发生错误:', error)
    return { success: false, error: '批量添加游戏到库中时发生错误' }
  }
}

/**
 * 导出游戏库API
 */
export const gamelibraryAPI = {
  getUserGameLibrary,
  checkGameInLibrary,
  addGameToLibrary,
  removeGameFromLibrary,
  batchAddGamesToLibrary
}
