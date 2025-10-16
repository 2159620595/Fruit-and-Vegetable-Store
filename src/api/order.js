import request from '@/utils/request'

/**
 * 订单相关 API
 */

// 创建订单
export const createOrder = (data) => {
  return request.post('/orders', data)
}

// 获取订单列表
export const getOrderList = (params = {}) => {
  return request.get('/orders', { params })
}

// 获取订单详情
export const getOrderDetail = (id) => {
  return request.get(`/orders/${id}`)
}

// 取消订单
export const cancelOrder = (id) => {
  return request.put(`/orders/${id}/cancel`)
}

// 确认收货
export const confirmOrder = (id) => {
  return request.put(`/orders/${id}/confirm`)
}

// 删除订单
export const deleteOrder = (id) => {
  return request.delete(`/orders/${id}`)
}

// 获取订单状态统计
export const getOrderStatusCount = () => {
  return request.get('/orders/count')
}
