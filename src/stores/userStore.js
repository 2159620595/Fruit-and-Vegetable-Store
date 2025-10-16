// src/stores/userStore.js
import { defineStore } from 'pinia'
import { userLoginService, userRegisterService } from '@/api/user.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
  }),

  getters: {
    // 获取用户信息
    userInfo: (state) => state.user,
    // 是否已登录
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
  },

  actions: {
    // 登录
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await userLoginService(credentials)
        console.log('✅ 登录成功，响应数据:', response.data)

        // 兼容多种响应格式
        let token = null
        let user = null

        // 响应格式：{ code: 0/200, data: { token, user }, message }
        const responseData = response.data

        if (responseData?.data?.token) {
          // 格式1: { code: 200, data: { token, user } }
          token = responseData.data.token
          user = responseData.data.user
        } else if (responseData?.token) {
          // 格式2: { code: 200, token, user }
          token = responseData.token
          user = responseData.user
        } else if (responseData?.data) {
          // 格式3: data字段中可能直接包含token
          const data = responseData.data
          if (typeof data === 'object' && data.token) {
            token = data.token
            user = data.user || data
          }
        }

        if (!token) {
          console.error('❌ 响应中没有找到token:', responseData)
          throw new Error('登录响应格式错误：未找到token')
        }

        // 保存到store
        this.token = token
        this.user = user
        this.isAuthenticated = true

        // 持久化存储
        localStorage.setItem('token', token)
        if (user) {
          localStorage.setItem('userInfo', JSON.stringify(user))
        }

        console.log('✅ 登录状态已保存')

        // 登录成功后同步购物车
        try {
          const { useCartStore } = await import('./cartStore')
          const cartStore = useCartStore()
          await cartStore.syncLocalCartToBackend()
          console.log('✅ 购物车同步完成')
        } catch (cartError) {
          console.warn('⚠️ 购物车同步失败（不影响登录）:', cartError)
        }

        return response.data
      } catch (error) {
        console.error('❌ 登录失败:', error)
        // 错误信息已经在拦截器中处理过了
        this.error = error.message || '登录失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 注册
    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await userRegisterService(userData)
        console.log('注册响应:', response)

        // 注册成功，不自动登录，返回结果
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '注册失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 从localStorage恢复用户状态
    initFromStorage() {
      const token = localStorage.getItem('token')
      const userInfo = localStorage.getItem('userInfo')

      if (token) {
        this.token = token
        this.isAuthenticated = true

        if (userInfo) {
          try {
            this.user = JSON.parse(userInfo)
          } catch (e) {
            console.error('解析用户信息失败:', e)
          }
        }
      }
    },

    // 从服务器获取用户信息
    async fetchProfile() {
      if (!this.token) {
        console.warn('⚠️ 没有token，无法获取用户信息')
        return
      }

      this.loading = true
      try {
        // 这里需要一个获取用户信息的API
        // 暂时使用localStorage中的信息
        console.log('📤 获取用户信息')

        // 如果有用户信息API，可以这样调用：
        // const response = await request.get('/user/profile')
        // this.user = response.data.data

        // 暂时从localStorage恢复
        this.initFromStorage()

        console.log('✅ 用户信息已加载:', this.user)
      } catch (error) {
        console.error('❌ 获取用户信息失败:', error)
        // 如果token无效，清除登录状态
        if (error.response?.status === 401) {
          this.logout()
        }
      } finally {
        this.loading = false
      }
    },

    // 登出
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null

      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },

    // 清除错误
    clearError() {
      this.error = null
    },
  },
})
