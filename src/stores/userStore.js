// src/stores/userStore.js
import { defineStore } from 'pinia'
import {
  userLoginService,
  userRegisterService,
  getUserProfileService,
  updateAvatarService,
  updateUserProfileService,
  changePasswordService,
} from '@/api/user.js'

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
    userInfo: state => state.user,
    // 是否已登录
    isLoggedIn: state => state.isAuthenticated && !!state.token,
  },

  actions: {
    // 登录
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await userLoginService(credentials)

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
          throw new Error('登录响应格式错误：未找到token')
        }

        // 保存到store
        this.token = token
        this.user = user
        this.isAuthenticated = true

        // Pinia持久化插件会自动保存

        // 登录成功后同步购物车
        try {
          const { useCartStore } = await import('./cartStore')
          const cartStore = useCartStore()
          await cartStore.syncLocalCartToBackend()
        } catch (cartError) {
          console.warn('⚠️ 购物车同步失败（不影响登录）:', cartError)
        }

        return response.data
      } catch (error) {
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
    },

    // 从服务器获取用户信息
    async fetchProfile() {
      if (!this.token) {
        return
      }

      this.loading = true
      try {
        // 调用用户信息API
        const response = await getUserProfileService()

        if (response.data?.code === 200 && response.data?.data) {
          // 更新用户信息，包含统计数据
          const data = response.data.data
          this.user = {
            ...data.user,
            order_stats: data.order_stats,
            favorite_count: data.favorite_count,
          }
        } else {
          // 如果API失败，使用localStorage中的信息
          this.initFromStorage()
        }
      } catch (error) {
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

        // 清除地址数据
        const { useAddressStore } = await import('./addressStore')
        const addressStore = useAddressStore()
        addressStore.addresses = []

        // 清除物流数据
        const { useLogisticsStore } = await import('./logisticsStore')
        const logisticsStore = useLogisticsStore()
        logisticsStore.clearLogisticsData()
      } catch (error) {
        console.error('❌ 清除数据时出错:', error)
        // 即使清除其他数据失败，也要确保用户数据被清除
      }

      // Pinia持久化插件会自动清除
    },

    // 更新用户头像
    async updateAvatar(formData) {
      this.loading = true
      try {
        const response = await updateAvatarService(formData)

        // 重新获取用户信息以更新头像
        await this.fetchProfile()

        return response.data
      } catch (error) {
        this.error = error.message || '头像上传失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新用户信息
    async updateProfile(userData) {
      this.loading = true
      try {
        const response = await updateUserProfileService(userData)

        // 更新本地用户信息
        if (response.data?.data?.user) {
          this.user = { ...this.user, ...response.data.data.user }
        }

        return response.data
      } catch (error) {
        this.error = error.message || '更新用户信息失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 修改密码
    async changePassword(passwordData) {
      this.loading = true
      try {
        const response = await changePasswordService(passwordData)
        return response.data
      } catch (error) {
        this.error = error.message || '修改密码失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 清除错误
    clearError() {
      this.error = null
    },
  },
})
