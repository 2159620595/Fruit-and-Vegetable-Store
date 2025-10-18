// src/stores/cartStore.js
import { defineStore } from 'pinia'
import {
  getCartList,
  addToCart as addToCartAPI,
  updateCartItem,
  deleteCartItem,
  clearCart as clearCartAPI,
  batchDeleteCart,
  toggleCartItemSelected,
  toggleAllCartItems,
  getCartCount,
} from '@/api/cart'
import { useUserStore } from './userStore'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),

  persist: {
    key: 'cart',
    storage: localStorage,
  },

  getters: {
    // 购物车商品总数量
    cartCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),

    // 购物车商品总价（所有商品）
    cartTotal: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),

    // 小计（所有商品）
    subtotal: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),

    // 已选中商品总数量
    selectedCount: (state) =>
      state.items.filter((item) => item.selected).reduce((sum, item) => sum + item.quantity, 0),

    // 已选中商品总价
    selectedTotal: (state) =>
      state.items
        .filter((item) => item.selected)
        .reduce((sum, item) => sum + item.price * item.quantity, 0),

    // 已选中商品列表
    selectedItems: (state) => state.items.filter((item) => item.selected),

    // 是否全选
    isAllSelected: (state) => {
      if (state.items.length === 0) return false
      return state.items.every((item) => item.selected)
    },

    // 是否有选中商品
    hasSelected: (state) => state.items.some((item) => item.selected),
  },

  actions: {
    /**
     * 从后端加载购物车数据
     */
    async fetchCartList() {
      const userStore = useUserStore()

      console.log('🛒 fetchCartList 开始')
      console.log('用户token:', userStore.token)
      console.log('当前items:', this.items)

      // 如果用户未登录，直接返回（Pinia持久化插件会自动加载数据）
      if (!userStore.token) {
        console.log('用户未登录，使用本地数据')
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await getCartList()
        console.log('🛒 API响应原始数据:', response)
        console.log('🛒 response.data:', response.data)

        const cartData = response.data.data || response.data
        console.log('🛒 cartData:', cartData)

        // 后端返回格式：{ items: [...], subtotal, shipping, total }
        const items = cartData.items || []
        console.log('🛒 items from API:', items)

        // 如果后端返回空数据，但localStorage有数据，保留localStorage数据
        if (items.length === 0 && this.items.length > 0) {
          console.log('🛒 后端返回空数据，但localStorage有数据，保留localStorage数据')
          // 不更新this.items，保持localStorage中的数据
          return
        }

        // 确保每个商品都有 selected 属性，并映射字段
        this.items = items.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          name: item.name,
          name_en: item.name_en,
          price: parseFloat(item.price),
          quantity: item.quantity,
          image_url: item.image_url,
          image: item.image_url,
          stock: item.stock,
          selected: item.selected !== undefined ? item.selected : false,
        }))

        console.log('🛒 处理后的items:', this.items)

        // Pinia持久化插件会自动保存
      } catch (error) {
        console.error('获取购物车失败:', error)
        this.error = error.message || '获取购物车失败'
        // 如果请求失败，保持本地数据（Pinia持久化插件会自动处理）
      } finally {
        this.loading = false
      }
    },

    /**
     * 添加商品到购物车
     */
    async addToCart(product, quantity = 1) {
      const userStore = useUserStore()

      // 本地购物车逻辑
      const existingItem = this.items.find((item) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          id: product.id,
          product_id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          image_url: product.image_url,
          quantity: quantity,
          selected: false,
        })
      }

      // Pinia持久化插件会自动保存

      // 如果用户已登录，同步到后端
      if (userStore.token) {
        try {
          await addToCartAPI({
            product_id: product.id,
            quantity: quantity,
          })
          console.log('✅ 购物车同步到后端成功')
        } catch (error) {
          console.error('❌ 同步购物车到后端失败:', error)
          // 即使后端失败，也保持本地状态
        }
      }
    },

    /**
     * 更新购物车商品数量
     * @param {number} cartItemId - 购物车项的ID（不是product_id）
     * @param {number} quantity - 新数量
     */
    async updateQuantity(cartItemId, quantity) {
      const userStore = useUserStore()

      // 本地更新（使用购物车项ID）
      const item = this.items.find((item) => item.id === cartItemId)
      if (item) {
        const validQuantity = Math.max(1, Math.min(item.stock || 999, quantity))
        item.quantity = validQuantity
        // Pinia持久化插件会自动保存

        // 同步到后端
        if (userStore.token) {
          try {
            await updateCartItem(cartItemId, { quantity: validQuantity })
            console.log('✅ 数量更新同步成功')
          } catch (error) {
            console.error('❌ 同步数量更新失败:', error)
            // 如果后端失败，可以选择回滚或保持本地状态
          }
        }
      }
    },

    /**
     * 从购物车删除商品
     * @param {number} cartItemId - 购物车项的ID
     */
    async removeFromCart(cartItemId) {
      const userStore = useUserStore()

      // 本地删除
      this.items = this.items.filter((item) => item.id !== cartItemId)
      // Pinia持久化插件会自动保存

      // 同步到后端
      if (userStore.token) {
        try {
          await deleteCartItem(cartItemId)
          console.log('✅ 删除商品同步成功')
        } catch (error) {
          console.error('❌ 同步删除失败:', error)
        }
      }
    },

    /**
     * 批量删除购物车商品
     */
    async batchRemove(productIds) {
      const userStore = useUserStore()

      console.log('🛒 batchRemove 开始:', {
        productIds,
        currentItems: this.items.map((item) => ({ id: item.id, product_id: item.product_id })),
      })

      // 本地删除 - 使用id或product_id进行匹配
      this.items = this.items.filter(
        (item) => !productIds.includes(item.id) && !productIds.includes(item.product_id),
      )

      console.log('🛒 batchRemove 删除后:', {
        remainingItems: this.items.map((item) => ({ id: item.id, product_id: item.product_id })),
      })

      // Pinia持久化插件会自动保存

      // 同步到后端
      if (userStore.token) {
        try {
          await batchDeleteCart(productIds)
          console.log('✅ 批量删除同步成功')
        } catch (error) {
          console.error('❌ 批量删除同步失败:', error)
        }
      }
    },

    /**
     * 删除已选中的商品
     */
    async removeSelectedItems() {
      console.log('🛒 removeSelectedItems 开始')
      console.log('🛒 selectedItems:', this.selectedItems)

      const selectedIds = this.selectedItems.map((item) => item.id || item.product_id)
      console.log('🛒 selectedIds:', selectedIds)

      if (selectedIds.length > 0) {
        await this.batchRemove(selectedIds)
      }
    },

    /**
     * 清空购物车
     */
    async clearCart() {
      const userStore = useUserStore()

      // 本地清空
      this.items = []
      // Pinia持久化插件会自动保存

      // 同步到后端
      if (userStore.token) {
        try {
          await clearCartAPI()
          console.log('✅ 清空购物车同步成功')
        } catch (error) {
          console.error('❌ 清空购物车同步失败:', error)
        }
      }
    },

    /**
     * 切换商品选中状态
     */
    async toggleItemSelected(productId) {
      const item = this.items.find((item) => item.id === productId)
      if (item) {
        item.selected = !item.selected
        // Pinia持久化插件会自动保存

        // 同步到后端
        const userStore = useUserStore()
        if (userStore.token) {
          try {
            await toggleCartItemSelected(productId, item.selected)
            console.log('✅ 选中状态同步成功')
          } catch (error) {
            console.error('❌ 选中状态同步失败:', error)
          }
        }
      }
    },

    /**
     * 全选/取消全选
     */
    async toggleAllSelected() {
      const newSelectedState = !this.isAllSelected

      // 本地更新
      this.items.forEach((item) => {
        item.selected = newSelectedState
      })
      // Pinia持久化插件会自动保存

      // 同步到后端
      const userStore = useUserStore()
      if (userStore.token) {
        try {
          await toggleAllCartItems(newSelectedState)
          console.log('✅ 全选状态同步成功')
        } catch (error) {
          console.error('❌ 全选状态同步失败:', error)
        }
      }
    },

    /**
     * 获取购物车数量（轻量级接口）
     */
    async fetchCartCount() {
      const userStore = useUserStore()

      if (!userStore.token) {
        return this.cartCount
      }

      try {
        const response = await getCartCount()
        const count = response.data.data?.count || response.data.count || 0
        return count
      } catch (error) {
        console.error('获取购物车数量失败:', error)
        return this.cartCount
      }
    },

    /**
     * 同步本地购物车到后端（用户登录后调用）
     */
    async syncLocalCartToBackend() {
      const userStore = useUserStore()

      if (!userStore.token || this.items.length === 0) {
        return
      }

      try {
        // 将本地购物车中的每个商品同步到后端
        for (const item of this.items) {
          await addToCartAPI({
            product_id: item.id || item.product_id,
            quantity: item.quantity,
          })
        }
        console.log('✅ 本地购物车同步到后端成功')

        // 同步后重新获取购物车数据
        await this.fetchCartList()
      } catch (error) {
        console.error('❌ 同步本地购物车失败:', error)
      }
    },
  },
})
