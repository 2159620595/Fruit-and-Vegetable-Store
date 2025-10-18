import request from '@/utils/request'

/**
 * 购物车相关 API
 * 根据 OpenAPI 文档，只支持基本的 CRUD 操作
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

// 注意：以下接口在 OpenAPI 文档中不存在，可能需要后端实现或使用替代方案
// 清空购物车 - 可以通过删除所有商品实现
export const clearCart = async () => {
  // 先获取购物车列表
  const response = await getCartList()
  const items = response.data.data?.items || []

  // 逐个删除所有商品
  const deletePromises = items.map((item) => deleteCartItem(item.id))
  await Promise.all(deletePromises)

  return { data: { message: '购物车已清空' } }
}

// 批量删除购物车商品 - 通过逐个删除实现
export const batchDeleteCart = async (ids) => {
  const deletePromises = ids.map((id) => deleteCartItem(id))
  await Promise.all(deletePromises)

  return { data: { message: '批量删除成功' } }
}

// 购物车商品选中/取消选中 - 暂不支持，返回模拟响应
export const toggleCartItemSelected = (id, selected) => {
  console.warn('⚠️ 购物车选中功能暂不支持，请检查后端实现')
  return Promise.resolve({ data: { message: '选中状态更新成功' } })
}

// 全选/取消全选 - 暂不支持，返回模拟响应
export const toggleAllCartItems = (selected) => {
  console.warn('⚠️ 购物车全选功能暂不支持，请检查后端实现')
  return Promise.resolve({ data: { message: '全选状态更新成功' } })
}

// 获取购物车数量 - 通过获取列表计算
export const getCartCount = async () => {
  try {
    const response = await getCartList()
    const items = response.data.data?.items || []
    const count = items.reduce((sum, item) => sum + item.quantity, 0)

    return { data: { count } }
  } catch (error) {
    console.error('获取购物车数量失败:', error)
    return { data: { count: 0 } }
  }
}
