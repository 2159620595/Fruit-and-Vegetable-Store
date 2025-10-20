import request from '@/utils/request'

/**
 * 评价相关 API
 * 根据接口文档: fresh-harvest-api-openapi.json
 */

/**
 * 添加商品评价
 * POST /api/reviews
 * @param {Object} data - 评价数据
 * @param {number} data.product_id - 商品ID (必填)
 * @param {number} data.rating - 评分 1-5星 (必填)
 * @param {number} [data.order_id] - 订单ID (可选)
 * @param {string} [data.comment] - 评价内容 (可选)
 * @param {string[]} [data.images] - 评价图片URL列表 (可选)
 * @returns {Promise} 返回 { code: 200, message: "评价成功", data: { review_id: 1 } }
 */
export const createReview = data => {
  return request.post('/reviews', data)
}

/**
 * 评价点赞
 * POST /api/reviews/{id}/like
 * @param {number} id - 评价ID
 * @returns {Promise}
 */
export const likeReview = id => {
  return request.post(`/reviews/${id}/like`)
}

/**
 * 评价踩
 * POST /api/reviews/{id}/dislike
 * @param {number} id - 评价ID
 * @returns {Promise}
 */
export const dislikeReview = id => {
  return request.post(`/reviews/${id}/dislike`)
}

/**
 * 获取商品评价列表
 * GET /api/products/{id}/reviews
 * @param {number} productId - 商品ID
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.page_size] - 每页数量
 * @param {number} [params.rating_filter] - 评分筛选
 * @returns {Promise}
 */
export const getProductReviews = (productId, params = {}) => {
  return request.get(`/products/${productId}/reviews`, { params })
}

/**
 * 获取用户评价列表
 * GET /api/reviews
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.page_size] - 每页数量
 * @returns {Promise} 返回用户的所有评价列表
 */
export const getUserReviews = (params = {}) => {
  return request.get('/reviews', { params })
}

/**
 * 根据订单ID获取评价（已弃用）
 * 注意：后端没有此接口，请使用 getProductReviews 并筛选用户评价
 * @deprecated
 * @param {number} orderId - 订单ID
 * @returns {Promise} 返回该订单的评价列表
 */
export const getReviewByOrderId = orderId => {
  return request.get('/reviews', {
    params: {
      order_id: orderId,
      page: 1,
      page_size: 100,
    },
  })
}
