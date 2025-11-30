import { defineStore } from 'pinia'
import { normalUserAPI } from '../utils/normalUserAPI'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    isLoading: false,
    error: null
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
      } catch (e) {
        console.error('解析用户信息失败:', e)
        localStorage.removeItem('user')
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
      this.currentUser = null
      localStorage.removeItem('user')
    }
  }
})