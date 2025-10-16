import request from '@/utils/request'

/**
 * 购物车相关 API
 */

// 获取购物车列表
export const getCartList = () => {
  return request.get('/cart')
}

// 添加商品到购物车
export const addToCart = (data) => {
  return request.post('/cart', data)
}

// 更新购物车商品数量
export const updateCartItem = (id, data) => {
  return request.put(`/cart/${id}`, data)
}

// 删除购物车商品
export const deleteCartItem = (id) => {
  return request.delete(`/cart/${id}`)
}

// 清空购物车
export const clearCart = () => {
  return request.delete('/cart')
}

// 批量删除购物车商品
export const batchDeleteCart = (ids) => {
  return request.post('/cart/batch-delete', { ids })
}

// 购物车商品选中/取消选中
export const toggleCartItemSelected = (id, selected) => {
  return request.put(`/cart/${id}/select`, { selected })
}

// 全选/取消全选
export const toggleAllCartItems = (selected) => {
  return request.put('/cart/select-all', { selected })
}

// 获取购物车数量（不需要详细信息时使用）
export const getCartCount = () => {
  return request.get('/cart/count')
}
