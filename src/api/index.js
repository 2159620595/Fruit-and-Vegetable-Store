import axios from 'axios'

const request = axios.create({
  baseURL: 'https://www.xingyunfeicui.xyz/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  },
)

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
