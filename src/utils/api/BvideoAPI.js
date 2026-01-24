import supabase from '../core/supabase';
import { setCache, getCache } from '../tools/cacheUtils';

/**
 * B站视频API
 * 用于从Supabase数据库获取B站最新视频URL
 */

// B站视频缓存常量
const BVIDEO_CACHE_KEY = 'bilibili_latest_video';
const BVIDEO_CACHE_EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24小时

export const bvideoAPI = {
    /**
     * 获取最新视频URL
     * @returns {Promise<Object>} - 包含视频URL的响应对象
     */
    async getLatestVideoUrl() {
        try {
            // 先检查缓存
            const cachedData = getCache(BVIDEO_CACHE_KEY);
            if (cachedData) {
                console.log('使用缓存的B站视频URL');
                return {
                    success: true,
                    data: {
                        video_url: cachedData
                    }
                };
            }
            
            // 缓存不存在或已过期，从Supabase获取最新的视频URL
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
            
            // 将获取到的视频URL存入缓存
            setCache(BVIDEO_CACHE_KEY, data.video_url, BVIDEO_CACHE_EXPIRE_TIME);
            console.log('更新B站视频URL缓存');

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