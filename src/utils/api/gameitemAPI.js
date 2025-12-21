import supabase from "../core/supabase.js";

/**
 * 游戏表结构说明
 * 
 * 表名：game_item
 * 
 * 字段说明：
 * - id: INT, PRIMARY KEY - 游戏唯一标识符
 * - game_publisher: VARCHAR - 游戏发行商名称
 * - game_name: VARCHAR - 游戏名称
 * - game_price: FLOAT8 - 游戏原价
 * - game_discount: FLOAT8 - 游戏折扣比例
 * - game_description: TEXT - 游戏详细描述
 * - game_type: VARCHAR - 游戏类型（如Action、Adventure等）
 * - game_tags: VARCHAR/JSON - 游戏标签，可存储多个标签
 * - library_img: VARCHAR - 游戏库存展示图
 * - header_img: VARCHAR - 游戏头图（在库中显示的缩略图）
 * - created_at: TIMESTAMP - 游戏记录创建时间
 */

export const gameitemAPI = {
    /**
     * 获取游戏列表
     * @param {Object} options - 筛选和分页选项
     * @returns {Promise<Object>} - 包含游戏列表的响应对象
     */
    async getGames(options = {}) {
        try {
            const { limit = 20, offset = 0, search = '', type = '' } = options;
            
            let query = supabase.from('game_item').select('*');
            
            // 添加搜索条件
            if (search) {
                query = query.ilike('game_name', `%${search}%`);
            }
            
            // 添加类型筛选
            if (type) {
                query = query.eq('game_type', type);
            }
            
            // 添加分页
            query = query.limit(limit).offset(offset);
            
            // 按创建时间排序，最新的在前
            query = query.order('created_at', { ascending: false });
            
            const response = await query;
            
            return {
                success: true,
                data: response.data,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    },
    
    /**
     * 根据ID获取游戏详情
     * @param {number} gameId - 游戏ID
     * @returns {Promise<Object>} - 包含游戏详情的响应对象
     */
    async getGameById(gameId) {
        try {
            const response = await supabase
                .from('game_item')
                .select('*')
                .eq('id', gameId)
                .single();
            
            if (response.error) {
                return {
                    success: false,
                    data: null,
                    error: response.error.message
                };
            }
            
            return {
                success: true,
                data: response.data,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    },
    
    /**
     * 添加新游戏
     * @param {Object} gameData - 游戏数据
     * @returns {Promise<Object>} - 包含结果的响应对象
     */
    async addGame(gameData) {
        try {
            const response = await supabase
                .from('game_item')
                .insert([gameData])
                .select()
                .single();
            
            if (response.error) {
                return {
                    success: false,
                    data: null,
                    error: response.error.message
                };
            }
            
            return {
                success: true,
                data: response.data,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    },
    
    /**
     * 更新游戏信息
     * @param {number} gameId - 游戏ID
     * @param {Object} gameData - 要更新的游戏数据
     * @returns {Promise<Object>} - 包含结果的响应对象
     */
    async updateGame(gameId, gameData) {
        try {
            const response = await supabase
                .from('game_item')
                .update(gameData)
                .eq('id', gameId)
                .select()
                .single();
            
            if (response.error) {
                return {
                    success: false,
                    data: null,
                    error: response.error.message
                };
            }
            
            return {
                success: true,
                data: response.data,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    },
    
    /**
     * 删除游戏
     * @param {number} gameId - 游戏ID
     * @returns {Promise<Object>} - 包含结果的响应对象
     */
    async deleteGame(gameId) {
        try {
            const response = await supabase
                .from('game_item')
                .delete()
                .eq('id', gameId);
            
            if (response.error) {
                return {
                    success: false,
                    data: null,
                    error: response.error.message
                };
            }
            
            return {
                success: true,
                data: { deleted: true },
                error: null
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    },
    
    /**
     * 获取游戏类型列表
     * @returns {Promise<Object>} - 包含游戏类型列表的响应对象
     */
    async getGameTypes() {
        try {
            const response = await supabase
                .from('game_item')
                .select('game_type')
                .distinct();
            
            if (response.error) {
                return {
                    success: false,
                    data: null,
                    error: response.error.message
                };
            }
            
            // 提取类型数组
            const types = response.data.map(item => item.game_type).filter(type => type);
            
            return {
                success: true,
                data: types,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }
}
