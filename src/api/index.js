import request from '@/utils/request'

// 获取首页数据（包含所有商品和分类）
export const getGoodsList = () => request.get('/home')

// 搜索商品
export const searchProducts = (keyword, params = {}) => {
  return request.get('/search', {
    params: {
      keyword,
      ...params,
    },
  })
}

// 获取商品详情
export const getProductDetail = (id) => {
  return request.get(`/products/${id}`)
}

// 评价列表
export const getCommentList = () => request.get('/reviews')

// 导出购物车相关 API
export * from './cart'

// 导出订单相关 API
export * from './order'

// 导出地址相关 API
export * from './address'
