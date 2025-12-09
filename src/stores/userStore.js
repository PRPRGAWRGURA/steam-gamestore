import { defineStore } from 'pinia'
import { normalUserAPI } from '../utils/normalUserAPI'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    isLoading: false,
    error: null,
    user_count: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.currentUser
  },

  actions: {
    // 初始化用户状态（从localStorage恢复）
    initUser() {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          this.currentUser = JSON.parse(userStr)
        }
        const userCountStr = localStorage.getItem('user_count')
        if (userCountStr) {
          this.user_count = parseInt(userCountStr)
        }
      } catch (e) {
        console.error('解析用户信息失败:', e)
        localStorage.removeItem('user')
      }
    },

    // 获取玩家数量
    async getCount() {
      try {
        const count = await normalUserAPI.getCount();
        this.user_count = count;
        localStorage.setItem('user_count', count.toString())
        return count
      } catch (error) {
        console.error('获取玩家数量失败:', error)
        return this.user_count
      }
    },


    // 登录操作
    async login(username, password, rememberMe = false) {
      this.isLoading = true
      this.error = null
      
      try {
        const result = await normalUserAPI.login(username, password)
        
        if (result.success) {
          this.currentUser = result.data
          
          // 保存到localStorage
          if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(result.data))
            localStorage.setItem('rememberedUsername', username)
            localStorage.setItem('rememberedPassword', password)
          } else {
            localStorage.removeItem('rememberedUsername')
            localStorage.removeItem('rememberedPassword')
          }
          
          return true
        } else {
          this.error = result.error
          return false
        }
      } catch (error) {
        this.error = '登录过程中发生错误'
        return false
      } finally {
        this.isLoading = false
      }
    },

    // 登出操作
    logout() {
      // 清除用户状态
      this.currentUser = null
      
      // 清除用户信息缓存
      localStorage.removeItem('user')
      
      // 清除记住密码相关缓存
      localStorage.removeItem('rememberedUsername')
      localStorage.removeItem('rememberedPassword')
      
      // 如果有当前用户信息，清除其点赞状态缓存
      // 注意：这里this.currentUser已经为null，所以不需要在这里处理点赞缓存
      // 点赞缓存的清除需要在调用logout之前处理
    }
  }
})