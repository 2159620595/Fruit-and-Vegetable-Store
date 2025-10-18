// src/stores/userStore.js
import { defineStore } from 'pinia'
import { userLoginService, userRegisterService, getUserProfileService } from '@/api/user.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  persist: {
    key: 'user',
    storage: localStorage,
  },

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

        // Pinia持久化插件会自动保存

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

    // 从持久化存储恢复用户状态（Pinia会自动处理）
    initFromStorage() {
      // Pinia持久化插件会自动恢复状态
      console.log('✅ 用户状态已从持久化存储恢复')
    },

    // 从服务器获取用户信息
    async fetchProfile() {
      if (!this.token) {
        console.warn('⚠️ 没有token，无法获取用户信息')
        return
      }

      this.loading = true
      try {
        console.log('📤 获取用户信息')

        // 调用用户信息API
        const response = await getUserProfileService()
        console.log('✅ 用户信息API响应:', response.data)

        if (response.data?.code === 200 && response.data?.data?.user) {
          // 更新用户信息
          this.user = response.data.data.user
          console.log('✅ 用户信息已更新:', this.user)
        } else {
          console.warn('⚠️ 用户信息API响应格式异常')
          // 如果API失败，使用localStorage中的信息
          this.initFromStorage()
        }
      } catch (error) {
        console.error('❌ 获取用户信息失败:', error)
        // 如果token无效，清除登录状态
        if (error.response?.status === 401) {
          this.logout()
        } else {
          // 如果API失败，使用localStorage中的信息
          this.initFromStorage()
        }
      } finally {
        this.loading = false
      }
    },

    // 登出
    async logout() {
      console.log('🚪 开始退出登录，清除所有用户相关数据...')

      // 清除用户数据
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null

      // 清除其他 store 的数据
      try {
        // 清除购物车数据
        const { useCartStore } = await import('./cartStore')
        const cartStore = useCartStore()
        cartStore.items = []
        console.log('✅ 购物车数据已清除')

        // 清除订单数据
        const { useOrderStore } = await import('./orderStore')
        const orderStore = useOrderStore()
        orderStore.orders = []
        orderStore.currentOrder = null
        orderStore.orderCounts = {
          to_pay: 0,
          to_ship: 0,
          to_receive: 0,
          to_review: 0,
        }
        console.log('✅ 订单数据已清除')

        // 清除地址数据
        const { useAddressStore } = await import('./addressStore')
        const addressStore = useAddressStore()
        addressStore.addresses = []
        console.log('✅ 地址数据已清除')

        // 清除物流数据
        const { useLogisticsStore } = await import('./logisticsStore')
        const logisticsStore = useLogisticsStore()
        logisticsStore.clearLogisticsData()
        console.log('✅ 物流数据已清除')

        console.log('✅ 所有用户相关数据已清除完成')
      } catch (error) {
        console.error('❌ 清除数据时出错:', error)
        // 即使清除其他数据失败，也要确保用户数据被清除
      }

      // Pinia持久化插件会自动清除
    },

    // 清除错误
    clearError() {
      this.error = null
    },
  },
})
