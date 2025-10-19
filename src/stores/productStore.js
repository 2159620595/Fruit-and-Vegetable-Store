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

  // 🔧 移除持久化：商品数据应该实时从后端获取
  // persist: {
  //   key: 'product',
  //   storage: localStorage,
  // },

  getters: {
    // 确保总是返回数组
    productList: state => {
      return Array.isArray(state.products) ? state.products : []
    },
    // 获取指定分类的商品
    productsByCategory: state => {
      const products = Array.isArray(state.products) ? state.products : []
      return category => products.filter(p => p.category === category)
    },
    // 获取价格范围内的商品
    productsByPriceRange: state => {
      const products = Array.isArray(state.products) ? state.products : []
      return (min, max) =>
        products.filter(p => p.price >= min && p.price <= max)
    },
  },

  actions: {
    async fetchProducts(/* params = {} */) {
      this.loading = true
      this.error = null
      try {
        // 直接从首页接口获取商品数据
        const response = await getGoodsList()

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
            new Map(allProducts.map(item => [item.id, item])).values()
          )

          this.products = uniqueProducts

          // 同时提取分类
          this.extractCategoriesFromHomeData(data)
        } else {
          this.products = []
        }
      } catch (error) {
        this.error = error.message
        this.products = []
      } finally {
        this.loading = false
      }
    },

    async fetchProductById(id) {
      const response = await getProductDetail(id)

      // 根据实际API返回结构处理数据
      if (response.data?.code === 200 && response.data?.data) {
        // 返回完整的data对象，包含product、reviews、related_products
        return response.data.data
      } else if (response.data?.data) {
        return response.data.data
      }
      return response.data
    },

    // 从已加载的商品中提取分类
    fetchCategories() {
      try {
        if (this.products.length > 0) {
          const categorySet = new Set()
          this.products.forEach(product => {
            if (product.category) {
              categorySet.add(product.category)
            }
          })
          this.categories = Array.from(categorySet).sort()
        } else {
          this.categories = []
        }
      } catch {
        this.categories = []
      }
    },

    // 从首页数据中提取并保存分类
    extractCategoriesFromHomeData(homeData) {
      if (homeData?.categories && Array.isArray(homeData.categories)) {
        // 如果首页数据包含categories字段
        if (
          homeData.categories[0] &&
          typeof homeData.categories[0] === 'object'
        ) {
          // 对象数组，提取name字段
          this.categories = homeData.categories.map(
            cat => cat.name || cat.category_name
          )
        } else {
          // 字符串数组
          this.categories = homeData.categories
        }
      } else {
        // 从商品数据中提取分类
        const allProducts = [
          ...(homeData?.popular_picks || []),
          ...(homeData?.customer_favorites || []),
          ...(homeData?.new_arrivals || []),
          ...(homeData?.limited_offers || []),
        ]

        const categorySet = new Set()
        allProducts.forEach(product => {
          if (product.category) {
            categorySet.add(product.category)
          }
        })
        this.categories = Array.from(categorySet).sort()
      }
    },
  },
})
