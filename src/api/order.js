import request from '@/utils/request'

/**
 * 订单相关 API
 */

// 创建订单
export const createOrder = data => {
  return request.post('/orders', data)
}

// 获取订单列表
export const getOrderList = (params = {}) => {
  return request.get('/orders', { params })
}

// 获取订单详情
export const getOrderDetail = id => {
  return request.get(`/orders/${id}`)
}

// 取消订单
export const cancelOrder = id => {
  return request.put(`/orders/${id}/cancel`)
}

// 确认收货
export const confirmOrder = id => {
  return request.put(`/orders/${id}/confirm`)
}

// 删除订单
export const deleteOrder = id => {
  return request.delete(`/orders/${id}`)
}

// 获取订单状态统计
export const getOrderStatusCount = () => {
  return request.get('/orders/count')
}

// 更新订单状态
export const updateOrderStatus = (id, status) => {
  return request.put(`/orders/${id}/status`, { status })
}

// 支付订单
export const payOrder = (id, paymentMethod) => {
  return request.post(`/orders/${id}/pay`, { 
    payment_method: paymentMethod,
    use_balance: paymentMethod === 'balance'
  })
}

// 评价订单
export const reviewOrder = (id, data) => {
  return request.post(`/orders/${id}/review`, data)
}

// 再次购买
export const buyAgain = id => {
  return request.post(`/orders/${id}/buy-again`)
}

// 立即购买
export const buyNow = data => {
  return request.post('/buy-now', data)
}

// 🆕 获取物流信息
export const getLogistics = orderId => {
  return request.get(`/logistics/${orderId}`)
}

// 🆕 订单搜索（按订单号或商品名称）
export const searchOrders = params => {
  return request.get('/orders/search', { params })
}

// 🆕 批量更新订单状态
export const batchUpdateOrderStatus = data => {
  return request.post('/orders/batch-update-status', data)
}

// 🆕 订单统计数据
export const getOrderStatistics = params => {
  return request.get('/orders/statistics', { params })
}
