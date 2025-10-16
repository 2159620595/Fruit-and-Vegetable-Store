// src/stores/productStore.js
import { defineStore } from 'pinia'
import { getGoodsList, getProductDetail } from '@/api/index.js'

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
    productsByCategory: (state) => {
      const products = Array.isArray(state.products) ? state.products : []
      return (category) => products.filter((p) => p.category === category)
    },
    // 获取价格范围内的商品
    productsByPriceRange: (state) => {
      const products = Array.isArray(state.products) ? state.products : []
      return (min, max) => products.filter((p) => p.price >= min && p.price <= max)
    },
  },

  actions: {
    async fetchProducts(params = {}) {
      this.loading = true
      this.error = null
      try {
        console.log('=== 开始加载商品数据 ===')

        // 直接从首页接口获取商品数据
        const response = await getGoodsList()
        console.log('首页API响应:', response.data)

        if (response.data?.data) {
          const data = response.data.data

          // 从首页数据中提取所有商品
          const allProducts = [
            ...(data.popular_picks || []),
            ...(data.customer_favorites || []),
            ...(data.new_arrivals || []),
            ...(data.limited_offers || []),
          ]

          // 去重（使用id作为唯一标识）
          const uniqueProducts = Array.from(
            new Map(allProducts.map((item) => [item.id, item])).values(),
          )

          this.products = uniqueProducts

          // 同时提取分类
          this.extractCategoriesFromHomeData(data)

          console.log('✅ 商品加载成功')
          console.log('商品数量:', this.products.length)
          console.log('分类数量:', this.categories.length)
        } else {
          console.warn('⚠️ 首页数据格式不正确')
          this.products = []
        }
      } catch (error) {
        console.error('❌ 获取商品列表失败:', error)
        this.error = error.message
        this.products = []
      } finally {
        this.loading = false
      }
    },

    async fetchProductById(id) {
      try {
        const response = await getProductDetail(id)
        console.log('API返回的商品详情:', response.data)

        // 根据实际API返回结构处理数据
        if (response.data?.code === 200 && response.data?.data) {
          // 返回完整的data对象，包含product、reviews、related_products
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

    // 从已加载的商品中提取分类
    fetchCategories() {
      try {
        if (this.products.length > 0) {
          const categorySet = new Set()
          this.products.forEach((product) => {
            if (product.category) {
              categorySet.add(product.category)
            }
          })
          this.categories = Array.from(categorySet).sort()
          console.log('✅ 从商品数据中提取到的分类:', this.categories)
        } else {
          console.warn('⚠️ 没有商品数据，无法提取分类')
          this.categories = []
        }
      } catch (error) {
        console.error('提取分类失败:', error)
        this.categories = []
      }
    },

    // 从首页数据中提取并保存分类
    extractCategoriesFromHomeData(homeData) {
      if (homeData?.categories && Array.isArray(homeData.categories)) {
        // 如果首页数据包含categories字段
        if (homeData.categories[0] && typeof homeData.categories[0] === 'object') {
          // 对象数组，提取name字段
          this.categories = homeData.categories.map((cat) => cat.name || cat.category_name)
        } else {
          // 字符串数组
          this.categories = homeData.categories
        }
        console.log('✅ 从首页数据中获取到的分类:', this.categories)
      } else {
        // 从商品数据中提取分类
        const allProducts = [
          ...(homeData?.popular_picks || []),
          ...(homeData?.customer_favorites || []),
          ...(homeData?.new_arrivals || []),
          ...(homeData?.limited_offers || []),
        ]

        const categorySet = new Set()
        allProducts.forEach((product) => {
          if (product.category) {
            categorySet.add(product.category)
          }
        })
        this.categories = Array.from(categorySet).sort()
        console.log('✅ 从首页商品中提取到的分类:', this.categories)
      }
    },
  },
})
