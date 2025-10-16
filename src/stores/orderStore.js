// src/stores/orderStore.js
import { defineStore } from 'pinia'
import {
  createOrder as createOrderAPI,
  getOrderList,
  getOrderDetail,
  cancelOrder as cancelOrderAPI,
  confirmOrder as confirmOrderAPI,
  deleteOrder as deleteOrderAPI,
} from '@/api/order'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    currentOrder: null,
    orderCounts: {
      to_pay: 0,
      to_ship: 0,
      to_receive: 0,
      to_review: 0,
    },
    loading: false,
    error: null,
  }),

  getters: {
    // 获取待支付订单
    pendingOrders: (state) => state.orders.filter((order) => order.status === 'pending'),

    // 获取待发货订单
    processingOrders: (state) => state.orders.filter((order) => order.status === 'processing'),

    // 获取待收货订单
    shippedOrders: (state) =>
      state.orders.filter((order) => ['shipped', 'in_transit'].includes(order.status)),

    // 获取已完成订单
    completedOrders: (state) => state.orders.filter((order) => order.status === 'delivered'),
  },

  actions: {
    /**
     * 创建订单
     * @param {Object} orderData - 订单数据
     * @param {Array} orderData.items - 商品列表 [{product_id, quantity}]
     * @param {String} orderData.shipping_address - 收货地址（JSON字符串）
     * @param {String} orderData.delivery_method - 配送方式
     * @param {String} orderData.payment_method - 支付方式
     * @param {String} orderData.remark - 备注
     */
    async createOrder(orderData) {
      this.loading = true
      this.error = null

      try {
        // 格式化订单数据以适配后端
        const formattedData = {
          items: orderData.items.map((item) => ({
            product_id: item.productId || item.product_id,
            quantity: item.quantity,
          })),
          shipping_address: JSON.stringify(orderData.shippingAddress),
          delivery_method: orderData.deliveryMethod,
          payment_method: orderData.paymentMethod,
          remark: orderData.remark || '',
        }

        console.log('📦 创建订单:', formattedData)

        const response = await createOrderAPI(formattedData)
        const result = response.data.data || response.data

        console.log('✅ 订单创建成功:', result)

        return result
      } catch (error) {
        console.error('❌ 创建订单失败:', error)
        this.error = error.message || '创建订单失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取订单列表
     * @param {Object} params - 查询参数
     * @param {String} params.status - 订单状态
     * @param {Number} params.page - 页码
     * @param {Number} params.page_size - 每页数量
     */
    async fetchOrders(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await getOrderList(params)
        const result = response.data.data || response.data

        this.orders = result.orders || []
        this.orderCounts = result.counts || this.orderCounts

        console.log('✅ 获取订单列表成功:', this.orders.length, '条')

        return result
      } catch (error) {
        console.error('❌ 获取订单列表失败:', error)
        this.error = error.message || '获取订单列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取订单详情
     * @param {Number} id - 订单ID
     */
    async fetchOrderById(id) {
      if (!id) {
        throw new Error('订单ID不能为空')
      }

      this.loading = true
      this.error = null

      try {
        const response = await getOrderDetail(id)
        const result = response.data.data || response.data

        this.currentOrder = result

        console.log('✅ 获取订单详情成功:', result)

        return result
      } catch (error) {
        console.error('❌ 获取订单详情失败:', error)
        this.error = error.message || '获取订单详情失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 取消订单
     * @param {Number} id - 订单ID
     */
    async cancelOrder(id) {
      this.loading = true
      this.error = null

      try {
        await cancelOrderAPI(id)

        // 更新本地订单状态
        const order = this.orders.find((o) => o.id === id)
        if (order) {
          order.status = 'cancelled'
        }

        if (this.currentOrder && this.currentOrder.order.id === id) {
          this.currentOrder.order.status = 'cancelled'
        }

        console.log('✅ 订单取消成功')

        return true
      } catch (error) {
        console.error('❌ 取消订单失败:', error)
        this.error = error.message || '取消订单失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 确认收货
     * @param {Number} id - 订单ID
     */
    async confirmOrder(id) {
      this.loading = true
      this.error = null

      try {
        await confirmOrderAPI(id)

        // 更新本地订单状态
        const order = this.orders.find((o) => o.id === id)
        if (order) {
          order.status = 'delivered'
        }

        if (this.currentOrder && this.currentOrder.order.id === id) {
          this.currentOrder.order.status = 'delivered'
        }

        console.log('✅ 确认收货成功')

        return true
      } catch (error) {
        console.error('❌ 确认收货失败:', error)
        this.error = error.message || '确认收货失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除订单
     * @param {Number} id - 订单ID
     */
    async deleteOrder(id) {
      this.loading = true
      this.error = null

      try {
        await deleteOrderAPI(id)

        // 从列表中移除
        this.orders = this.orders.filter((o) => o.id !== id)

        console.log('✅ 订单删除成功')

        return true
      } catch (error) {
        console.error('❌ 删除订单失败:', error)
        this.error = error.message || '删除订单失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 清空错误信息
     */
    clearError() {
      this.error = null
    },
  },
})
