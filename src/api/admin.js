// 后台管理相关API
import request from '@/utils/request'

// ============= 统计数据 =============
// 获取后台统计数据
export const getAdminStats = () => request.get('/admin/stats')

// ============= 商品管理 =============
// 获取商品列表（后台）
export const getProductList = params =>
  request.get('/admin/products', { params })

// 获取商品详情（后台）
export const getProductDetail = id => request.get(`/admin/products/${id}`)

// 添加商品
export const addProduct = data => request.post('/admin/products', data)

// 更新商品
export const updateProduct = (id, data) =>
  request.put(`/admin/products/${id}`, data)

// 删除商品
export const deleteProduct = id => request.delete(`/admin/products/${id}`)

// 批量删除商品
export const batchDeleteProducts = ids =>
  request.post('/admin/products/batch-delete', { ids })

// 上架商品
export const publishProduct = id => request.put(`/admin/products/${id}/publish`)

// 下架商品
export const unpublishProduct = id =>
  request.put(`/admin/products/${id}/unpublish`)

// ============= 订单管理 =============
// 获取订单列表（后台）
export const getOrderList = params => request.get('/admin/orders', { params })

// 获取订单详情（后台）
export const getOrderDetail = id => request.get(`/admin/orders/${id}`)

// 更新订单状态
export const updateOrderStatus = (id, status) =>
  request.put(`/admin/orders/${id}/status`, { status })

// 更新订单信息
export const updateOrder = (id, data) =>
  request.put(`/admin/orders/${id}`, data)

// 删除订单
export const deleteOrder = id => request.delete(`/admin/orders/${id}`)

// ============= 用户管理 =============
// 获取用户列表
export const getUserList = params => request.get('/admin/users', { params })

// 获取用户详情
export const getUserDetail = id => request.get(`/admin/users/${id}`)

// 添加用户
export const addUser = data => request.post('/admin/users', data)

// 更新用户信息
export const updateUser = (id, data) => request.put(`/admin/users/${id}`, data)

// 禁用用户
export const disableUser = id => request.put(`/admin/users/${id}/disable`)

// 启用用户
export const enableUser = id => request.put(`/admin/users/${id}/enable`)

// 删除用户
export const deleteUser = id => request.delete(`/admin/users/${id}`)

// ============= 评价管理 =============
// 获取评价列表（后台）
export const getReviewList = params => request.get('/admin/reviews', { params })

// 更新评价
export const updateReview = (id, data) =>
  request.put(`/admin/reviews/${id}`, data)

// 删除评价
export const deleteReview = id => request.delete(`/admin/reviews/${id}`)

// 批量删除评价
export const batchDeleteReviews = ids =>
  request.post('/admin/reviews/batch-delete', { ids })

// 审核评价
export const approveReview = id => request.put(`/admin/reviews/${id}/approve`)

// 拒绝评价
export const rejectReview = id => request.put(`/admin/reviews/${id}/reject`)

// ============= 分类管理 =============
// 获取分类列表
export const getCategoryList = () => request.get('/admin/categories')

// 添加分类
export const addCategory = data => request.post('/admin/categories', data)

// 更新分类
export const updateCategory = (id, data) =>
  request.put(`/admin/categories/${id}`, data)

// 删除分类
export const deleteCategory = id => request.delete(`/admin/categories/${id}`)

