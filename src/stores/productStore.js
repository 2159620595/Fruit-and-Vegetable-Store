// src/stores/productStore.js
import { defineStore } from 'pinia'
import axios from 'axios'
const API_URL = 'https://www.xingyunfeicui.xyz/api'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    categories: [],
    loading: false,
  }),

  getters: {
    // 确保总是返回数组
    productList: (state) => {
      return Array.isArray(state.products) ? state.products : []
    },
  },

  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        const response = await axios.get(`${API_URL}/products`)
        console.log('API响应:', response.data)

        if (response.data?.success) {
          this.products = Array.isArray(response.data.data) ? response.data.data : []
        } else if (Array.isArray(response.data)) {
          this.products = response.data
        } else {
          console.warn('商品数据格式不正确:', response.data)
          this.products = []
        }

        console.log('设置后的products:', this.products)
      } catch (error) {
        console.error('Failed to fetch products:', error)
        this.products = []
      } finally {
        this.loading = false
      }
    },

    async fetchProductById(id) {
      const response = await axios.get(`${API_URL}/products/${id}`)
      if (response.data?.success) {
        return response.data.data
      }
      return response.data
    },

    async fetchCategories() {
      try {
        const response = await axios.get(`${API_URL}/categories`)
        this.categories = response.data
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    },
  },
})
