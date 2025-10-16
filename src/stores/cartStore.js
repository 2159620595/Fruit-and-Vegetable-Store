// src/stores/cartStore.js
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart')) || [],
  }),

  getters: {
    cartCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    cartTotal: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    subtotal: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  },

  actions: {
    addToCart(product, quantity = 1) {
      const existingItem = this.items.find((item) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          image_url: product.image_url,
          quantity: quantity,
        })
      }

      this.saveCart()
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find((item) => item.id === productId)
      if (item) {
        item.quantity = Math.max(1, quantity)
        this.saveCart()
      }
    },

    removeFromCart(productId) {
      this.items = this.items.filter((item) => item.id !== productId)
      this.saveCart()
    },

    clearCart() {
      this.items = []
      this.saveCart()
    },

    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    },
  },
})
