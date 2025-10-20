// src/stores/orderStore.js
// 组合式全局订单 store（移除 Pinia 依赖）
import { ref, reactive } from 'vue'
import {
  createOrder as createOrderAPI,
  getOrderList,
  getOrderDetail,
  cancelOrder as cancelOrderAPI,
  confirmOrder as confirmOrderAPI,
  deleteOrder as deleteOrderAPI,
  updateOrderStatus as updateOrderStatusAPI,
  payOrder as payOrderAPI,
  buyAgain as buyAgainAPI,
  searchOrders as searchOrdersAPI,
  batchUpdateOrderStatus as batchUpdateOrderStatusAPI,
  getOrderStatistics as getOrderStatisticsAPI,
} from '@/api/order'
import { createReview } from '@/api/review'

// 单例状态
const orders = ref([])
const currentOrder = ref(null)
const orderCounts = reactive({
  to_pay: 0,
  to_ship: 0,
  shipped: 0,
  in_transit: 0,
  to_review: 0,
  cancelled: 0,
})
const reviewedOrders = ref([]) // 已评价的订单ID列表
const loading = ref(false)
const error = ref(null)

// 工具函数
function setLoading(val) {
  loading.value = val
}
function setError(message) {
  error.value = message
}

// 公共方法（保持与原 Pinia actions 同名同参）
async function createOrder(orderData) {
  setLoading(true)
  setError(null)
  try {
    const formattedData = {
      items: orderData.items.map(item => ({
        product_id: item.productId || item.product_id,
        quantity: item.quantity,
      })),
      shipping_address: JSON.stringify(orderData.shippingAddress),
      delivery_method: orderData.deliveryMethod,
      payment_method: orderData.paymentMethod,
      shipping_fee: orderData.shippingFee || 0,
      total_amount: orderData.totalAmount || 0,
      remark: orderData.remark || '',
    }
    const response = await createOrderAPI(formattedData)
    const result = response.data.data || response.data
    return result
  } catch (err) {
    setError(err.message || '创建订单失败')
    throw err
  } finally {
    setLoading(false)
  }
}

async function fetchOrders(params = {}) {
  setLoading(true)
  setError(null)
  try {
    const response = await getOrderList(params)
    const result = response.data.data || response.data

    const list = (result.orders || []).slice().sort((a, b) => {
      const dateA = new Date(a.created_at || 0)
      const dateB = new Date(b.created_at || 0)
      return dateB - dateA
    })
    orders.value = list

    if (result.counts) {
      Object.assign(orderCounts, {
        to_pay: parseInt(result.counts.to_pay) || 0,
        to_ship: parseInt(result.counts.to_ship) || 0,
        shipped: parseInt(result.counts.shipped) || 0,
        in_transit: parseInt(result.counts.in_transit) || 0,
        to_review: parseInt(result.counts.to_review) || 0,
        cancelled: parseInt(result.counts.cancelled) || 0,
      })
    }

    syncReviewStatus()
    return result
  } catch (err) {
    setError(err.message || '获取订单列表失败')
    throw err
  } finally {
    setLoading(false)
  }
}

function clearOrders() {
  orders.value = []
}

async function fetchOrderById(id) {
  if (!id) throw new Error('订单ID不能为空')
  setLoading(true)
  setError(null)
  try {
    const response = await getOrderDetail(id)
    const result = response.data.data || response.data
    currentOrder.value = result
    return result
  } catch (err) {
    setError(err.message || '获取订单详情失败')
    throw err
  } finally {
    setLoading(false)
  }
}

async function cancelOrder(id) {
  setLoading(true)
  setError(null)
  try {
    await cancelOrderAPI(id)
    const order = orders.value.find(o => o.id === id)
    if (order) order.status = 'cancelled'
    if (currentOrder.value && currentOrder.value.order?.id === id) {
      currentOrder.value.order.status = 'cancelled'
    }
    return true
  } catch (err) {
    setError(err.message || '取消订单失败')
    throw err
  } finally {
    setLoading(false)
  }
}

async function confirmOrder(id) {
  setLoading(true)
  setError(null)
  try {
    await confirmOrderAPI(id)
    const order = orders.value.find(o => o.id === id)
    if (order) order.status = 'delivered'
    if (currentOrder.value && currentOrder.value.order?.id === id) {
      currentOrder.value.order.status = 'delivered'
    }
    return true
  } catch (err) {
    setError(err.message || '确认收货失败')
    throw err
  } finally {
    setLoading(false)
  }
}

async function deleteOrder(id) {
  setLoading(true)
  setError(null)
  try {
    await deleteOrderAPI(id)
    orders.value = orders.value.filter(o => o.id !== id)
    return true
  } catch (err) {
    setError(err.message || '删除订单失败')
    throw err
  } finally {
    setLoading(false)
  }
}

async function updateOrderStatus(id, status) {
  setLoading(true)
  setError(null)
  try {
    const response = await updateOrderStatusAPI(id, status)
    const result = response.data.data || response.data

    const order = orders.value.find(o => o.id === id)
    if (order) {
      order.status = status
      order.updated_at = new Date().toISOString()
    }
    if (currentOrder.value?.order && currentOrder.value.order.id === id) {
      currentOrder.value.order.status = status
      currentOrder.value.order.updated_at = new Date().toISOString()
    }
    return result
  } catch (err) {
    setError(err.message || '更新订单状态失败')
    throw err
  } finally {
    setLoading(false)
  }
}

async function payOrder(orderId, paymentMethod) {
  try {
    setLoading(true)
    // 调用真实的支付 API
    const response = await payOrderAPI(orderId, paymentMethod)
    const result = response.data || response

    // 更新本地订单状态
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'processing'
      order.payment_method = paymentMethod
    }

    return result
  } catch (err) {
    setError(err.message || '支付失败')
    throw err
  } finally {
    setLoading(false)
  }
}

async function reviewOrder(orderId, reviewData) {
  try {
    setLoading(true)

    let reviewPayload = null
    if (reviewData.product_reviews && reviewData.product_reviews.length > 0) {
      const firstProduct = reviewData.product_reviews[0]
      reviewPayload = {
        product_id: firstProduct.product_id,
        order_id: orderId,
        rating: firstProduct.rating || reviewData.rating,
        comment: reviewData.comment || '',
        images: reviewData.images || [],
      }
    } else {
      const order = orders.value.find(o => o.id === orderId)
      if (order?.items?.length > 0) {
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
        const order = orders.value.find(o => o.id === orderId)
        if (order) order.is_reviewed = true
        saveReviewedOrderToCache(orderId)
      } catch (err) {
        if (err.message && err.message.includes('已评价')) {
          const order = orders.value.find(o => o.id === orderId)
          if (order) order.is_reviewed = true
          saveReviewedOrderToCache(orderId)
          return {
            success: true,
            message: '您已评价过此商品',
            alreadyReviewed: true,
          }
        }
        if (
          err.code === 'ECONNABORTED' ||
          err.message?.includes('网络错误') ||
          err.message?.includes('timeout')
        ) {
          const order = orders.value.find(o => o.id === orderId)
          if (order) order.is_reviewed = true
          saveReviewedOrderToCache(orderId)
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
  } catch (err) {
    setError(err.message || '评价失败')
    throw err
  } finally {
    setLoading(false)
  }
}

async function buyAgain(orderId) {
  try {
    setLoading(true)
    const response = await buyAgainAPI(orderId)
    return response.data
  } catch (err) {
    setError(err.message || '再次购买失败')
    throw err
  } finally {
    setLoading(false)
  }
}

function syncReviewStatus() {
  const set = new Set(reviewedOrders.value)
  orders.value.forEach(order => {
    if (order.is_reviewed !== undefined && order.is_reviewed !== null) {
      if (order.is_reviewed) set.add(order.id)
      else set.delete(order.id)
    } else if (set.has(order.id)) {
      order.is_reviewed = true
    }
  })
  reviewedOrders.value = Array.from(set)
}

function saveReviewedOrderToCache(orderId) {
  if (!reviewedOrders.value.includes(orderId)) {
    reviewedOrders.value.push(orderId)
  }
}

async function searchOrders(params = {}) {
  setLoading(true)
  setError(null)
  try {
    const response = await searchOrdersAPI(params)
    const result = response.data.data || response.data
    const list = (result.orders || []).slice().sort((a, b) => {
      const dateA = new Date(a.created_at || 0)
      const dateB = new Date(b.created_at || 0)
      return dateB - dateA
    })
    orders.value = list
    return result
  } catch (err) {
    setError(err.message || '搜索订单失败')
    throw err
  } finally {
    setLoading(false)
  }
}

async function batchUpdateOrderStatus(data) {
  setLoading(true)
  setError(null)
  try {
    const response = await batchUpdateOrderStatusAPI(data)
    const result = response.data.data || response.data
    if (Array.isArray(data.order_ids)) {
      data.order_ids.forEach(orderId => {
        const order = orders.value.find(o => o.id === orderId)
        if (order) {
          order.status = data.status
          order.updated_at = new Date().toISOString()
        }
      })
    }
    return result
  } catch (err) {
    setError(err.message || '批量更新订单状态失败')
    throw err
  } finally {
    setLoading(false)
  }
}

async function getOrderStatistics(params = {}) {
  setLoading(true)
  setError(null)
  try {
    const response = await getOrderStatisticsAPI(params)
    const result = response.data.data || response.data
    return result
  } catch (err) {
    setError(err.message || '获取订单统计失败')
    throw err
  } finally {
    setLoading(false)
  }
}

// 兼容原 API 的导出函数
export function useOrderStore() {
  return {
    // state（保持只读语义：在组件中通过 .value 访问）
    orders,
    currentOrder,
    orderCounts,
    reviewedOrders,
    loading,
    error,

    // getters（在组件中可自行 computed 过滤）
    get pendingOrders() {
      return orders.value.filter(o => o.status === 'pending')
    },
    get processingOrders() {
      return orders.value.filter(o => o.status === 'processing')
    },
    get shippedOrders() {
      return orders.value.filter(o =>
        ['shipped', 'in_transit'].includes(o.status)
      )
    },
    get completedOrders() {
      return orders.value.filter(o => o.status === 'delivered')
    },

    // actions
    clearOrders,
    createOrder,
    fetchOrders,
    fetchOrderById,
    cancelOrder,
    confirmOrder,
    deleteOrder,
    updateOrderStatus,
    payOrder,
    reviewOrder,
    buyAgain,
    searchOrders,
    batchUpdateOrderStatus,
    getOrderStatistics,
    syncReviewStatus,
    saveReviewedOrderToCache,
  }
}
