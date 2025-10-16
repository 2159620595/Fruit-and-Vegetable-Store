// src/stores/orderStore.js
import { defineStore } from 'pinia'
import axios from 'axios'
const API_URL = 'https://www.xingyunfeicui.xyz/api'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
  }),

  actions: {
    // 获取认证头
    getAuthHeaders() {
      // const token = localStorage.getItem('token')
      const token = '11'
      if (!token) {
        throw new Error('未登录，请先登录')
      }
      return {
        Authorization: `Bearer ${token}`,
      }
    },

    async createOrder(orderData) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post(`${API_URL}/orders`, orderData, {
          headers: this.getAuthHeaders(),
        })
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '创建订单失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOrders() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`${API_URL}/orders`, { headers: this.getAuthHeaders() })
        this.orders = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '获取订单列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOrderById(id) {
      if (!id) throw new Error('订单ID不能为空')

      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`${API_URL}/orders/${id}`, {
          headers: this.getAuthHeaders(),
        })
        this.currentOrder = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '获取订单详情失败'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
