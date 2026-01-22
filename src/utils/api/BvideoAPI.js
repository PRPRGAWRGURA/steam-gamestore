import supabase from '../core/supabase';

/**
 * B站视频API
 * 用于从Supabase数据库获取B站最新视频URL
 */
export const bvideoAPI = {
    /**
     * 获取最新视频URL
     * @returns {Promise<Object>} - 包含视频URL的响应对象
     */
    async getLatestVideoUrl() {
        try {
            // 从Supabase获取最新的视频URL
            const { data, error } = await supabase
                .from('BvideoDogGet')
                .select('video_url')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                console.error('获取视频URL失败:', error.message);
                return {
                    success: false,
                    error: error.message
                };
            }

            if (!data || !data.video_url) {
                return {
                    success: false,
                    error: '未找到视频URL'
                };
            }

            return {
                success: true,
                data: {
                    video_url: data.video_url
                }
            };
        } catch (error) {
            console.error('获取视频URL异常:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};