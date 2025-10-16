<!-- src/components/ProductCard.vue -->
<template>
  <div class="product-card">
    <div class="product-image" @click="goToProduct">
      <img :src="product.image" :alt="product.name">
      <button class="favorite-btn" @click.stop="toggleFavorite">
        {{ isFavorite ? '❤️' : '🤍' }}
      </button>
    </div>
    
    <div class="product-info">
      <h3 @click="goToProduct">{{ product.name }}</h3>
      <p class="product-unit">{{ product.unit }}</p>
      
      <div class="product-rating" v-if="product.rating">
        <span class="stars">⭐ {{ product.rating }}</span>
        <span class="reviews">({{ product.reviews }} reviews)</span>
      </div>
      
      <div class="product-price">
        <span class="current-price">${{ product.price.toFixed(2) }}</span>
        <span class="original-price" v-if="product.originalPrice">
          ${{ product.originalPrice.toFixed(2) }}
        </span>
      </div>
      
      <div class="product-actions">
        <button class="add-to-cart" @click="addToCart">
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const cartStore = useCartStore()
const isFavorite = ref(false)

const goToProduct = () => {
  router.push(`/product/${props.product.id}`)
}

const addToCart = () => {
  cartStore.addToCart(props.product)
  alert('Product added to cart!')
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}
</script>