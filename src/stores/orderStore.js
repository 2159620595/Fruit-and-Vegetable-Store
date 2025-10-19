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
  // payOrder as payOrderAPI, // 暂时未使用
  buyAgain as buyAgainAPI,
  // 🆕 新增接口
  searchOrders as searchOrdersAPI,
  batchUpdateOrderStatus as batchUpdateOrderStatusAPI,
  getOrderStatistics as getOrderStatisticsAPI,
} from '@/api/order'
import { createReview } from '@/api/review'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    currentOrder: null,
    orderCounts: {
      to_pay: 0,
      to_ship: 0,
      to_receive: 0,
      in_transit: 0,
      to_review: 0,
      cancelled: 0,
    },
    reviewedOrders: [], // 已评价的订单ID列表
    loading: false,
    error: null,
  }),

  persist: {
    key: 'order',
    storage: localStorage,
    // 只持久化评价记录，订单数据和统计都从服务器获取
    paths: ['reviewedOrders'],
    // 自定义序列化，确保只保存 reviewedOrders
    serializer: {
      serialize: state => {
        return JSON.stringify({
          reviewedOrders: state.reviewedOrders || [],
        })
      },
      deserialize: value => {
        return JSON.parse(value)
      },
    },
  },

  getters: {
    // 获取待支付订单
    pendingOrders: state =>
      state.orders.filter(order => order.status === 'pending'),

    // 获取待发货订单
    processingOrders: state =>
      state.orders.filter(order => order.status === 'processing'),

    // 获取已发货订单
    shippedOrders: state =>
      state.orders.filter(order =>
        ['shipped', 'in_transit'].includes(order.status)
      ),

    // 获取已完成订单
    completedOrders: state =>
      state.orders.filter(order => order.status === 'delivered'),
  },

  actions: {
    /**
     * 清空订单列表（切换标签时使用）
     */
    clearOrders() {
      this.orders = []
    },

    /**
     * 初始化时清理持久化数据（只保留 reviewedOrders）
     */
    initCleanupPersist() {
      try {
        const storageKey = 'order'
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const data = JSON.parse(stored)

          // 如果存在 orders 或 orderCounts 字段，说明是旧数据，需要清理
          if (data.orders || data.orderCounts) {
            // 只保留评价记录
            const cleaned = {
              reviewedOrders: data.reviewedOrders || [],
            }
            localStorage.setItem(storageKey, JSON.stringify(cleaned))
          }
        }
      } catch {
        // 如果清理失败，直接删除整个缓存
        localStorage.removeItem('order')
      }
    },

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
          items: orderData.items.map(item => ({
            product_id: item.productId || item.product_id,
            quantity: item.quantity,
          })),
          shipping_address: JSON.stringify(orderData.shippingAddress),
          delivery_method: orderData.deliveryMethod,
          payment_method: orderData.paymentMethod,
          remark: orderData.remark || '',
        }

        const response = await createOrderAPI(formattedData)
        const result = response.data.data || response.data

        return result
      } catch (error) {
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

        // 对订单按创建时间倒序排序（最新的在前）
        const orders = result.orders || []
        this.orders = orders.sort((a, b) => {
          const dateA = new Date(a.created_at || 0)
          const dateB = new Date(b.created_at || 0)
          return dateB - dateA // 倒序：最新的在前
        })

        // 保存后端返回的 counts，确保所有字段都存在
        if (result.counts) {
          this.orderCounts = {
            to_pay: result.counts.to_pay || 0,
            to_ship: result.counts.to_ship || 0,
            to_receive: result.counts.to_receive || 0,
            in_transit: result.counts.in_transit || 0,
            to_review: result.counts.to_review || 0,
            cancelled: result.counts.cancelled || 0,
          }
        }

        // 同步评价状态：优先服务器，补充本地缓存
        this.syncReviewStatus()

        return result
      } catch (error) {
        this.error = error.message || '获取订单列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 同步评价状态
     */
    syncReviewStatus() {
      try {
        const reviewedSet = new Set(this.reviewedOrders)

        this.orders.forEach(order => {
          // 优先使用服务器返回的状态
          if (order.is_reviewed !== undefined && order.is_reviewed !== null) {
            if (order.is_reviewed) {
              reviewedSet.add(order.id)
            } else {
              reviewedSet.delete(order.id)
            }
          } else {
            // 服务器没有返回，使用 Pinia 缓存
            if (reviewedSet.has(order.id)) {
              order.is_reviewed = true
            }
          }
        })

        // 同步到 Pinia state（会自动持久化）
        this.reviewedOrders = Array.from(reviewedSet)
      } catch {
        // 忽略错误
      }
    },

    /**
     * 保存已评价订单到缓存（使用 Pinia persist）
     */
    saveReviewedOrderToCache(orderId) {
      try {
        if (!this.reviewedOrders.includes(orderId)) {
          this.reviewedOrders.push(orderId)
        }
      } catch {
        // 忽略错误
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

        return result
      } catch (error) {
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
        const order = this.orders.find(o => o.id === id)
        if (order) {
          order.status = 'cancelled'
        }

        if (this.currentOrder && this.currentOrder.order.id === id) {
          this.currentOrder.order.status = 'cancelled'
        }

        return true
      } catch (error) {
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
        const order = this.orders.find(o => o.id === id)
        if (order) {
          order.status = 'delivered'
        }

        if (this.currentOrder && this.currentOrder.order.id === id) {
          this.currentOrder.order.status = 'delivered'
        }

        return true
      } catch (error) {
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
        this.orders = this.orders.filter(o => o.id !== id)

        return true
      } catch (error) {
        this.error = error.message || '删除订单失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新订单状态（优化版 - 支持后端状态流转验证）
     * @param {Number} id - 订单ID
     * @param {String} status - 新状态
     */
    async updateOrderStatus(id, status) {
      this.loading = true
      this.error = null

      try {
        // 调用后端API更新订单状态（后端会进行状态流转验证）
        const response = await updateOrderStatusAPI(id, status)
        const result = response.data.data || response.data

        // 更新本地状态
        const order = this.orders.find(o => o.id === id)
        if (order) {
          order.status = status
          // 同时更新 updated_at 时间
          order.updated_at = new Date().toISOString()
        }

        // 更新当前订单详情
        if (
          this.currentOrder &&
          this.currentOrder.order &&
          this.currentOrder.order.id === id
        ) {
          this.currentOrder.order.status = status
          this.currentOrder.order.updated_at = new Date().toISOString()
        }

        return result
      } catch (error) {
        // 后端会返回详细的错误信息（例如：订单状态不能从"已送达"变更为"已发货"）
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

        // 模拟支付处理（实际项目中这里应该调用真实的支付接口）
        await new Promise(resolve => setTimeout(resolve, 1500)) // 模拟1.5秒支付处理时间

        // 模拟支付成功，更新订单状态
        await this.updateOrderStatus(orderId, 'processing')

        // 更新本地订单状态
        const order = this.orders.find(o => o.id === orderId)
        if (order) {
          order.status = 'processing'
          order.payment_method = paymentMethod
        }

        return { success: true, message: '支付成功' }
      } catch (error) {
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

        // 准备评价数据
        let reviewPayload = null
        if (
          reviewData.product_reviews &&
          reviewData.product_reviews.length > 0
        ) {
          const firstProduct = reviewData.product_reviews[0]
          reviewPayload = {
            product_id: firstProduct.product_id,
            order_id: orderId,
            rating: firstProduct.rating || reviewData.rating,
            comment: reviewData.comment || '',
            images: reviewData.images || [],
          }
        } else {
          const order = this.orders.find(o => o.id === orderId)
          if (order && order.items && order.items.length > 0) {
            reviewPayload = {
              product_id: order.items[0].product_id,
              order_id: orderId,
              rating: reviewData.rating,
              comment: reviewData.comment || '',
              images: reviewData.images || [],
            }
          }
        }

        if (reviewPayload) {
          try {
            await createReview(reviewPayload)

            // 标记订单为已评价
            const order = this.orders.find(o => o.id === orderId)
            if (order) {
              order.is_reviewed = true
            }

            // 保存到缓存
            this.saveReviewedOrderToCache(orderId)
          } catch (err) {
            // 检查是否已评价
            if (err.message && err.message.includes('已评价')) {
              const order = this.orders.find(o => o.id === orderId)
              if (order) {
                order.is_reviewed = true
              }
              this.saveReviewedOrderToCache(orderId)
              return {
                success: true,
                message: '您已评价过此商品',
                alreadyReviewed: true,
              }
            }

            // 检查是否是超时或网络错误
            if (
              err.code === 'ECONNABORTED' ||
              err.message.includes('网络错误') ||
              err.message.includes('timeout')
            ) {
              // 超时或网络错误，降级处理：标记为已评价
              const order = this.orders.find(o => o.id === orderId)
              if (order) {
                order.is_reviewed = true
              }
              this.saveReviewedOrderToCache(orderId)
              return {
                success: true,
                message: '评价已提交，请稍后刷新查看',
                timeout: true,
              }
            }

            throw err
          }
        }

        return { success: true, message: '评价成功' }
      } catch (error) {
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

        const response = await buyAgainAPI(orderId)

        return response.data
      } catch (error) {
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

    /**
     * 🆕 搜索订单（按订单号或商品名称）
     * @param {Object} params - 搜索参数
     * @param {String} params.keyword - 搜索关键词
     * @param {Number} params.page - 页码
     * @param {Number} params.page_size - 每页数量
     */
    async searchOrders(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await searchOrdersAPI(params)
        const result = response.data.data || response.data

        // 更新订单列表
        const orders = result.orders || []
        this.orders = orders.sort((a, b) => {
          const dateA = new Date(a.created_at || 0)
          const dateB = new Date(b.created_at || 0)
          return dateB - dateA
        })

        return result
      } catch (error) {
        this.error = error.message || '搜索订单失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 🆕 批量更新订单状态
     * @param {Object} data - 批量更新数据
     * @param {Array} data.order_ids - 订单ID数组
     * @param {String} data.status - 目标状态
     */
    async batchUpdateOrderStatus(data) {
      this.loading = true
      this.error = null

      try {
        const response = await batchUpdateOrderStatusAPI(data)
        const result = response.data.data || response.data

        // 更新本地订单状态
        if (data.order_ids && Array.isArray(data.order_ids)) {
          data.order_ids.forEach(orderId => {
            const order = this.orders.find(o => o.id === orderId)
            if (order) {
              order.status = data.status
              order.updated_at = new Date().toISOString()
            }
          })
        }

        return result
      } catch (error) {
        this.error = error.message || '批量更新订单状态失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 🆕 获取订单统计数据
     * @param {Object} params - 查询参数
     * @param {String} params.period - 统计周期 (today/week/month/year)
     */
    async getOrderStatistics(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await getOrderStatisticsAPI(params)
        const result = response.data.data || response.data

        return result
      } catch (error) {
        this.error = error.message || '获取订单统计失败'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
