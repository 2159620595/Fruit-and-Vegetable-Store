// 后台管理Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getProductList,
  getOrderList,
  getUserList,
  getReviewList,
  getAdminStats,
} from '@/api/admin'

export const useAdminStore = defineStore(
  'admin',
  () => {
    // ==================== 状态 ====================
    // 商品列表
    const products = ref([])
    const productTotal = ref(0)

    // 订单列表
    const orders = ref([])
    const orderTotal = ref(0)

    // 用户列表
    const users = ref([])
    const userTotal = ref(0)

    // 评价列表
    const reviews = ref([])
    const reviewTotal = ref(0)

    // 统计数据
    const stats = ref({
      productCount: 0,
      orderCount: 0,
      userCount: 0,
      totalRevenue: 0,
    })

    // ==================== Getters ====================
    // 获取上架商品数量
    const activeProductCount = computed(() => {
      return products.value.filter(p => p.status === 'active').length
    })

    // 获取待处理订单数量
    const pendingOrderCount = computed(() => {
      return orders.value.filter(o => o.status === 'pending').length
    })

    // ==================== Actions ====================
    // 获取商品列表
    const fetchProducts = async params => {
      try {
        const res = await getProductList(params)
        if (res.data?.data) {
          const data = res.data.data
          products.value = data.list || data.items || data
          productTotal.value = data.total || products.value.length
        } else if (res.data) {
          products.value = res.data.list || res.data.items || res.data
          productTotal.value = res.data.total || products.value.length
        }
        return res
      } catch (error) {
        console.error('获取商品列表失败:', error)
        throw error
      }
    }

    // 获取订单列表
    const fetchOrders = async params => {
      try {
        const res = await getOrderList(params)
        if (res.data?.data) {
          const data = res.data.data
          orders.value = data.list || data.items || data
          orderTotal.value = data.total || orders.value.length
        } else if (res.data) {
          orders.value = res.data.list || res.data.items || res.data
          orderTotal.value = res.data.total || orders.value.length
        }
        return res
      } catch (error) {
        console.error('获取订单列表失败:', error)
        throw error
      }
    }

    // 获取用户列表
    const fetchUsers = async params => {
      try {
        const res = await getUserList(params)
        if (res.data?.data) {
          const data = res.data.data
          users.value = data.list || data.items || data
          userTotal.value = data.total || users.value.length
        } else if (res.data) {
          users.value = res.data.list || res.data.items || res.data
          userTotal.value = res.data.total || users.value.length
        }
        return res
      } catch (error) {
        console.error('获取用户列表失败:', error)
        throw error
      }
    }

    // 获取评价列表
    const fetchReviews = async params => {
      try {
        const res = await getReviewList(params)
        if (res.data?.data) {
          const data = res.data.data
          reviews.value = data.list || data.items || data
          reviewTotal.value = data.total || reviews.value.length
        } else if (res.data) {
          reviews.value = res.data.list || res.data.items || res.data
          reviewTotal.value = res.data.total || reviews.value.length
        }
        return res
      } catch (error) {
        console.error('获取评价列表失败:', error)
        throw error
      }
    }

    // 获取统计数据
    const fetchStats = async () => {
      try {
        const res = await getAdminStats()
        if (res.data?.data) {
          stats.value = res.data.data
        } else if (res.data) {
          stats.value = res.data
        }
        return res
      } catch (error) {
        console.error('获取统计数据失败:', error)
        // 使用默认数据
        stats.value = {
          productCount: 0,
          orderCount: 0,
          userCount: 0,
          totalRevenue: 0,
        }
        throw error
      }
    }

    // 重置状态
    const reset = () => {
      products.value = []
      productTotal.value = 0
      orders.value = []
      orderTotal.value = 0
      users.value = []
      userTotal.value = 0
      reviews.value = []
      reviewTotal.value = 0
      stats.value = {
        productCount: 0,
        orderCount: 0,
        userCount: 0,
        totalRevenue: 0,
      }
    }

    return {
      // 状态
      products,
      productTotal,
      orders,
      orderTotal,
      users,
      userTotal,
      reviews,
      reviewTotal,
      stats,
      // Getters
      activeProductCount,
      pendingOrderCount,
      // Actions
      fetchProducts,
      fetchOrders,
      fetchUsers,
      fetchReviews,
      fetchStats,
      reset,
    }
  },
  {
    persist: false, // 后台数据不持久化
  }
)

