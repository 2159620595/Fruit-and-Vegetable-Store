// src/stores/productStore.js
import { defineStore } from 'pinia'
import { getProducts, getProductDetail, getCategories, getGoodsList } from '@/api/index.js'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    categories: [],
    loading: false,
    error: null,
  }),

  getters: {
    // 确保总是返回数组
    productList: (state) => {
      return Array.isArray(state.products) ? state.products : []
    },
    // 获取指定分类的商品
    productsByCategory: (state) => (category) => {
      return state.productList.filter((p) => p.category === category)
    },
    // 获取价格范围内的商品
    productsByPriceRange: (state) => (min, max) => {
      return state.productList.filter((p) => p.price >= min && p.price <= max)
    },
  },

  actions: {
    async fetchProducts(params = {}) {
      this.loading = true
      this.error = null
      try {
        // 尝试从/products端点获取
        let response = await getProducts(params)
        console.log('=== 商品API响应 ===')
        console.log('响应数据:', response.data)

        // 处理不同的响应格式
        if (response.data?.success && response.data?.data) {
          // 格式: { success: true, data: [...] }
          this.products = Array.isArray(response.data.data) ? response.data.data : []
        } else if (response.data?.data) {
          // 格式: { data: [...] }
          this.products = Array.isArray(response.data.data) ? response.data.data : []
        } else if (Array.isArray(response.data)) {
          // 格式: [...]
          this.products = response.data
        } else {
          console.warn('商品数据格式不正确，尝试使用首页数据')
          // 如果/products失败，尝试从/home获取
          response = await getGoodsList()
          if (response.data?.data?.popular_picks) {
            // 从首页数据中提取商品
            const allProducts = [
              ...(response.data.data.popular_picks || []),
              ...(response.data.data.customer_favorites || []),
              ...(response.data.data.new_arrivals || []),
              ...(response.data.data.limited_offers || []),
            ]
            // 去重
            const uniqueProducts = Array.from(
              new Map(allProducts.map((item) => [item.id, item])).values(),
            )
            this.products = uniqueProducts
          } else {
            this.products = []
          }
        }

        console.log('最终商品列表:', this.products)
        console.log('商品数量:', this.products.length)
      } catch (error) {
        console.error('获取商品列表失败:', error)
        this.error = error.message
        this.products = []
      } finally {
        this.loading = false
      }
    },

    async fetchProductById(id) {
      try {
        const response = await getProductDetail(id)
        if (response.data?.success) {
          return response.data.data
        } else if (response.data?.data) {
          return response.data.data
        }
        return response.data
      } catch (error) {
        console.error('获取商品详情失败:', error)
        throw error
      }
    },

    async fetchCategories() {
      try {
        const response = await getCategories()
        if (response.data?.success) {
          this.categories = response.data.data || []
        } else if (Array.isArray(response.data)) {
          this.categories = response.data
        } else {
          this.categories = []
        }
      } catch (error) {
        console.error('获取分类失败:', error)
        this.categories = []
      }
    },
  },
})
