import supabase from "../core/supabase.js";

/**
 * 游戏表结构说明
 * 
 * 表名：game_item
 * 
 * 字段说明：
 * - id: INT8, PRIMARY KEY - 游戏唯一标识符
 * - game_publisher: TEXT - 游戏发行商名称
 * - game_name: VARCHAR - 游戏名称
 * - game_price: FLOAT8 - 游戏原价
 * - game_discount: FLOAT8 - 游戏折扣比例（表内数字为0.7时价格折扣显示30%off）
 * - game_description: TEXT - 游戏详细描述
 * - game_type: VARCHAR - 游戏类型（如Action、Adventure等）
 * - game_tags: JSONB - 游戏标签，可存储多个标签
 * - library_img: TEXT - 游戏库存展示图
 * - header_img: TEXT - 游戏头图（在库中显示的缩略图）
 * - hero_img: TEXT - 游戏英雄图（在详情页显示的大图）
 * - state: VARCHAR - 游戏状态（如Available、Unavailable等）
 * - created_at: TIMESTAMP - 游戏记录创建时间
 */

export const gameitemAPI = {
    /**
     * 获取游戏列表
     * 支持多种场景：商城首页、搜索结果、游戏库等
     * @param {Object} options - 筛选选项
     * @param {string} [options.search=''] - 搜索关键词，用于模糊匹配游戏名称
     * @param {string} [options.type=''] - 游戏类型筛选
     * @param {string} [options.sortBy='created_at'] - 排序字段，支持：created_at, game_price, game_name
     * @param {boolean} [options.sortAsc=false] - 是否升序排序
     * @param {number} [options.page=1] - 页码，用于分页
     * @param {number} [options.pageSize=20] - 每页数量，用于分页
     * @param {string} [options.fields='*'] - 返回字段，用逗号分隔，如：id,game_name,game_price,library_img
     * @param {string} [options.state=''] - 游戏状态筛选，如：Available, Unavailable
     * @param {string} [gamePublisher] - 游戏发行商名称，用于过滤当前发行商的游戏
     * @returns {Promise<Object>} - 包含游戏列表和分页信息的响应对象
     */
    async getGames(options = {}, gamePublisher) {
        try {
            const {
                search = '',
                type = '',
                sortBy = 'created_at',
                sortAsc = false,
                page = 1,
                pageSize = 20,
                fields = '*',
                state = '已发布'
            } = options;
            
            let query = supabase.from('game_item').select(fields, { count: 'exact' });
            
            // 添加发行商过滤，只返回当前发行商的游戏
            if (gamePublisher) {
                query = query.eq('game_publisher', gamePublisher);
            }
            
            // 添加搜索条件
            if (search) {
                query = query.ilike('game_name', `%${search}%`);
            }
            
            // 添加类型筛选
            if (type) {
                query = query.eq('game_type', type);
            }
            
            // 添加状态筛选
            if (state) {
                query = query.eq('state', state);
            }
            
            // 添加排序
            query = query.order(sortBy, { ascending: sortAsc });
            
            // 添加分页，当pageSize为'unlimited'时不进行分页
            if (pageSize !== 'unlimited') {
                // 添加分页
                const offset = (page - 1) * pageSize;
                query = query.range(offset, offset + pageSize - 1);
            }
            
            const response = await query;
            
            // 计算总页数，当pageSize为'unlimited'时，总页数为1
            const totalPages = pageSize !== 'unlimited' ? Math.ceil(response.count / pageSize) : 1;
            
            return {
                success: true,
                data: {
                    items: response.data,
                    pagination: {
                        page,
                        pageSize,
                        total: response.count,
                        totalPages: totalPages
                    }
                },
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
