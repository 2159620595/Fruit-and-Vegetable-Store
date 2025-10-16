import request from '@/utils/request'

// 获取首页数据
export const getGoodsList = () => request.get('/home')

// 获取所有商品列表
export const getProducts = (params = {}) => {
  return request.get('/products', { params })
}

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

// 获取商品分类
export const getCategories = () => {
  return request.get('/categories')
}

// 评价列表
export const getCommentList = () => request.get('/reviews')
