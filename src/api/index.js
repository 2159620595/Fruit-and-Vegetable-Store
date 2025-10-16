import axios from 'axios'

const request = axios.create({
  baseURL: 'https://xingyunfeicui.xyz/api',
})

// 获取商品列表
export const getGoodsList = () => request.get('/home')

// 评价列表
export const getCommentList = () => request.get(`/reviews`)

// 搜索商品
export const searchProducts = (keyword, params = {}) => {
  return request.get('/products/search', {
    params: {
      keyword,
      ...params,
    },
  })
}
