// src/stores/orderStore.js
import { defineStore } from 'pinia'
import {
  createOrder as createOrderAPI,
  getOrderList,
  getOrderDetail,
  cancelOrder as cancelOrderAPI,
  confirmOrder as confirmOrderAPI,
  deleteOrder as deleteOrderAPI,
  updateOrderStatus as updateOrderStatusAPI,
  payOrder as payOrderAPI,
  reviewOrder as reviewOrderAPI,
  buyAgain as buyAgainAPI,
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

  persist: {
    key: 'order',
    storage: localStorage,
  },

  getters: {
    // 获取待支付订单
    pendingOrders: (state) => state.orders.filter((order) => order.status === 'pending'),

    // 获取待发货订单
    processingOrders: (state) => state.orders.filter((order) => order.status === 'processing'),

    // 获取已发货订单
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
     * 更新订单状态
     * @param {Number} id - 订单ID
     * @param {String} status - 新状态
     */
    async updateOrderStatus(id, status) {
      this.loading = true
      this.error = null

      try {
        console.log('🔄 开始更新订单状态:', { id, status })
        console.log(
          '当前订单列表:',
          this.orders.map((o) => ({ id: o.id, status: o.status })),
        )

        // 调用后端API更新订单状态
        console.log('📡 调用后端API更新订单状态...')
        await updateOrderStatusAPI(id, status)
        console.log('✅ 后端API调用成功')

        // 更新本地状态
        const order = this.orders.find((o) => o.id == id) // 使用 == 进行类型转换比较
        if (order) {
          console.log('找到订单，更新本地状态:', { 原状态: order.status, 新状态: status })
          order.status = status
          // 同时更新 updated_at 时间
          order.updated_at = new Date().toISOString()
        } else {
          console.warn('未找到订单，ID:', id)
          // 如果订单列表中找不到，可能是新创建的订单，先刷新列表
          console.log('刷新订单列表以获取最新数据...')
          await this.fetchOrders()

          // 再次尝试更新
          const updatedOrder = this.orders.find((o) => o.id == id)
          if (updatedOrder) {
            console.log('刷新后找到订单，更新本地状态:', {
              原状态: updatedOrder.status,
              新状态: status,
            })
            updatedOrder.status = status
            updatedOrder.updated_at = new Date().toISOString()
          } else {
            console.error('刷新后仍未找到订单，ID:', id)
          }
        }

        if (this.currentOrder && this.currentOrder.order.id == id) {
          console.log('更新当前订单状态')
          this.currentOrder.order.status = status
        }

        console.log('✅ 订单状态更新成功:', { id, status })
        console.log(
          '更新后的订单列表:',
          this.orders.map((o) => ({ id: o.id, status: o.status })),
        )

        return true
      } catch (error) {
        console.error('❌ 更新订单状态失败:', error)
        this.error = error.message || '更新订单状态失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 支付订单
     * @param {Number} orderId - 订单ID
     * @param {String} paymentMethod - 支付方式
     */
    async payOrder(orderId, paymentMethod) {
      try {
        this.loading = true
        console.log('💳 开始支付订单:', { orderId, paymentMethod })

        // 模拟支付处理（实际项目中这里应该调用真实的支付接口）
        await new Promise((resolve) => setTimeout(resolve, 1500)) // 模拟1.5秒支付处理时间

        // 模拟支付成功，更新订单状态
        await this.updateOrderStatus(orderId, 'processing')

        console.log('✅ 支付成功:', { orderId, paymentMethod })

        // 更新本地订单状态
        const order = this.orders.find((o) => o.id == orderId)
        if (order) {
          order.status = 'processing'
          order.payment_method = paymentMethod
        }

        return { success: true, message: '支付成功' }
      } catch (error) {
        console.error('❌ 支付失败:', error)
        this.error = error.message || '支付失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 评价订单
     * @param {Number} orderId - 订单ID
     * @param {Object} reviewData - 评价数据
     * @param {Number} reviewData.rating - 评分（1-5）
     * @param {String} reviewData.comment - 评价内容
     */
    async reviewOrder(orderId, reviewData) {
      try {
        this.loading = true
        console.log('⭐ 开始评价订单:', { orderId, reviewData })

        const response = await reviewOrderAPI(orderId, reviewData)
        console.log('✅ 评价成功:', response.data)

        return response.data
      } catch (error) {
        console.error('❌ 评价失败:', error)
        this.error = error.message || '评价失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 再次购买
     * @param {Number} orderId - 订单ID
     */
    async buyAgain(orderId) {
      try {
        this.loading = true
        console.log('🛒 开始再次购买:', orderId)

        const response = await buyAgainAPI(orderId)
        console.log('✅ 再次购买成功:', response.data)

        return response.data
      } catch (error) {
        console.error('❌ 再次购买失败:', error)
        this.error = error.message || '再次购买失败'
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
