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
import {
  getUserBalanceService,
  createRechargeOrderService,
  confirmRechargePaymentService,
  getRechargeRecordsService,
  getBalanceTransactionsService,
  payWithBalanceService,
} from '@/api/recharge.js'
import request from '@/utils/request.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    balance: 0,
    membershipLevel: '普通会员',
    totalRecharge: 0,
    rechargeRecords: [],
    balanceTransactions: [],
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
          // 更新余额、会员等级和累计充值
          this.balance = data.user?.balance || 0
          this.membershipLevel = data.user?.membership_level || '普通会员'
          this.totalRecharge = data.user?.total_recharge || 0
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

    // 获取用户余额信息
    async fetchUserBalance() {
      if (!this.token) {
        return
      }

      try {
        const response = await getUserBalanceService()
        if (response.data?.code === 200 && response.data?.data) {
          const data = response.data.data
          this.balance = data.balance || 0
          this.membershipLevel = data.membership_level || '普通会员'
          // 修复：正确获取total_recharge字段
          this.totalRecharge =
            data.total_recharge || data.user?.total_recharge || 0

          // 更新用户信息中的余额和会员等级
          if (this.user) {
            this.user.balance = data.balance
            this.user.membership_level = data.membership_level
            this.user.total_recharge = this.totalRecharge
          }

          console.log('✅ 余额信息已更新:', {
            balance: this.balance,
            membershipLevel: this.membershipLevel,
            totalRecharge: this.totalRecharge,
          })
        }
      } catch (error) {
        console.error('获取用户余额信息失败:', error)
      }
    },

    // 创建充值订单
    async createRechargeOrder(amount, paymentMethod) {
      this.loading = true
      try {
        const response = await createRechargeOrderService({
          amount,
          payment_method: paymentMethod,
        })
        return response.data
      } catch (error) {
        this.error = error.message || '创建充值订单失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 确认充值支付
    async confirmRechargePayment(rechargeId, transactionId, paymentStatus) {
      this.loading = true
      try {
        const response = await confirmRechargePaymentService({
          recharge_id: rechargeId,
          transaction_id: transactionId,
          payment_status: paymentStatus,
        })

        // 如果支付成功，重新获取用户信息（包括余额和会员等级）
        if (paymentStatus === 'success') {
          await this.fetchUserBalance()
          await this.fetchProfile() // 重新获取用户信息以更新会员等级
        }

        return response.data
      } catch (error) {
        this.error = error.message || '确认充值支付失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取充值记录
    async fetchRechargeRecords(params = {}) {
      try {
        const {
          page = 1,
          limit = 10,
          status = null,
          start_date = null,
          end_date = null,
          sort = 'desc',
        } = params

        const queryParams = { page, limit, sort }
        if (status) queryParams.status = status
        if (start_date) queryParams.start_date = start_date
        if (end_date) queryParams.end_date = end_date

        const response = await getRechargeRecordsService(queryParams)

        console.log('🔍 充值记录API响应:', response.data)

        if (response.data?.code === 200 && response.data?.data) {
          const records = response.data.data.records || []
          this.rechargeRecords = records

          // 确保时间字段被正确处理
          if (records.length > 0) {
            console.log('✅ 第一条记录:', records[0])
          }

          return response.data.data
        }
      } catch (error) {
        console.error('获取充值记录失败:', error)
        throw error
      }
    },

    // 获取充值统计汇总
    async fetchRechargeSummary(period = 'all') {
      try {
        const response = await request.get('/api/recharge/summary', {
          params: { period },
        })
        if (response.data?.code === 200 && response.data?.data) {
          return response.data.data
        }
      } catch (error) {
        console.error('获取充值统计失败:', error)
        throw error
      }
    },

    // 获取充值记录详情
    async fetchRechargeRecordDetail(id) {
      if (!this.token) {
        throw new Error('请先登录')
      }

      try {
        const response = await request.get(`/api/recharge/records/${id}`)

        // 处理多种可能的响应格式
        if (response.data) {
          // 格式1: { code: 200, data: {...}, message: '...' }
          if (response.data.code === 200 && response.data.data) {
            return response.data.data
          }
          // 格式2: 直接返回数据
          if (response.data.id) {
            return response.data
          }
        }

        throw new Error('获取充值记录详情失败')
      } catch (error) {
        console.error('获取充值记录详情失败:', error)
        throw error
      }
    },

    // 获取余额变动记录
    async fetchBalanceTransactions(page = 1, limit = 10, type = null) {
      try {
        const params = { page, limit }
        if (type) params.type = type

        const response = await getBalanceTransactionsService(params)
        if (response.data?.code === 200 && response.data?.data) {
          this.balanceTransactions = response.data.data.transactions || []
          return response.data.data
        }
      } catch (error) {
        console.error('获取余额变动记录失败:', error)
      }
    },

    // 使用余额支付
    async payWithBalance(orderId, amount, description) {
      this.loading = true
      try {
        const response = await payWithBalanceService({
          order_id: orderId,
          amount,
          description,
        })

        // 更新余额
        if (response.data?.code === 200 && response.data?.data) {
          this.balance = response.data.data.balance_after
          if (this.user) {
            this.user.balance = this.balance
          }
        }

        return response.data
      } catch (error) {
        this.error = error.message || '余额支付失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新余额（用于充值成功后）
    updateBalance(newBalance) {
      this.balance = newBalance
      if (this.user) {
        this.user.balance = newBalance
      }
    },

    // 更新会员等级
    updateMembershipLevel(newLevel) {
      this.membershipLevel = newLevel
      if (this.user) {
        this.user.membership_level = newLevel
      }
    },

    // 获取会员折扣信息
    async fetchMembershipDiscount() {
      if (!this.token) {
        return
      }

      try {
        const response = await request.get('/api/user/membership-discount')
        if (response.data?.code === 200 && response.data?.data) {
          const data = response.data.data
          this.membershipLevel = data.membership_level
          return data
        }
      } catch (error) {
        console.error('获取会员折扣信息失败:', error)

        // 如果接口不存在，返回默认的会员信息
        if (error.message && error.message.includes('接口不存在')) {
          console.warn('会员折扣接口不存在，使用默认会员信息')
          const defaultMembership = {
            membership_level: this.membershipLevel || '普通会员',
            discount_rate: 1.0,
            benefits: '基础购物体验',
            discount_percentage: 0,
          }
          return defaultMembership
        }

        throw error
      }
    },
  },
})
