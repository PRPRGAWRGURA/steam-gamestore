import { createClient } from '@supabase/supabase-js'

// 从环境变量获取Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 检查环境变量是否正确加载
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase环境变量未正确配置')
}

// 创建supabase客户端实例
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 导出实例
export default supabase