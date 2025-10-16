<template>
  <div class="product-detail-page">
    <!-- Breadcrumbs -->
    <div class="breadcrumbs">
      <a href="#" class="breadcrumb-link" @click.prevent="router.push('/shop')">商城</a>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">{{ product?.name || '商品详情' }}</span>
    </div>

    <!-- Main Product Section -->
    <div class="main-content" v-if="product">
      <div class="product-section">
        <!-- Product Image -->
        <div class="product-image-section">
          <div class="product-image">
            <div class="image-container">
              <img
                v-if="product.image_url"
                :src="product.image_url"
                :alt="product.name"
                style="width: 100%; height: 100%; object-fit: cover"
              />
              <div v-else class="apples-image">🍎🍎🍎🍎🍎</div>
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="product-details-section">
          <h1 class="product-name">{{ product.name }}</h1>
          <p class="product-weight">{{ product.unit || '1份' }}</p>

          <div class="rating-section">
            <span class="rating-text"
              >评分: {{ product.rating || '暂无评分' }} • {{ reviews.length }} 条评价</span
            >
          </div>

          <div class="price-section">
            <div class="current-price">价格: ${{ product.price }}</div>
            <div class="original-price" v-if="product.original_price">
              原价: ${{ product.original_price }}
            </div>
            <div class="promotion" v-if="product.original_price">
              促销: 立省
              {{
                Math.round(
                  ((product.original_price - product.price) / product.original_price) * 100,
                )
              }}%
            </div>
          </div>

          <div class="product-description">
            <p>{{ product.description || '暂无描述' }}</p>
          </div>

          <div class="action-buttons">
            <button class="btn btn-primary" @click="addToCart">加入购物车</button>
            <button class="btn btn-secondary" @click="buyNow">立即购买</button>
          </div>
        </div>
      </div>

      <!-- Customer Reviews Section -->
      <div class="reviews-section">
        <h2 class="section-title">客户评价</h2>

        <div v-if="reviews.length === 0" class="empty-reviews">
          <p>暂无评价</p>
        </div>

        <div v-for="review in reviews" :key="review.id" class="review-item">
          <div class="review-header">
            <div class="reviewer-info">
              <div class="reviewer-avatar">
                <img
                  :src="
                    review.avatar ||
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjc2MTQgMjAgMjUgMTcuNzYxNCAyNSAxNUMyNSAxMi4yMzg2IDIyLjc2MTQgMTAgMjAgMTBDMTcuMjM4NiAxMCAxNSAxMi4yMzg2IDE1IDE1QzE1IDE3Ljc2MTQgMTcuMjM4NiAyMCAyMCAyMFoiIGZpbGw9IiM2NjY2NjYiLz4KPHBhdGggZD0iTTIwIDMwQzI0LjQxODMgMzAgMjggMjYuNDE4MyAyOCAyMkgyOEMyOCAyMC44OTU0IDI3LjEwNDYgMjAgMjYgMjBIMTRDMTIuODk1NCAyMCAxMiAyMC44OTU0IDEyIDIySDhDOCAyNi40MTgzIDExLjU4MTcgMzAgMjAgMzBaIiBmaWxsPSIjNjY2NjY2Ii8+Cjwvc3ZnPgo='
                  "
                  :alt="review.full_name"
                />
              </div>
              <div class="reviewer-details">
                <div class="reviewer-name">{{ review.full_name }}</div>
                <div class="review-date">{{ formatDate(review.created_at) }}</div>
              </div>
            </div>
            <div class="star-rating">
              {{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}
            </div>
          </div>
          <div class="review-text">
            {{ review.comment }}
          </div>
          <div class="review-engagement">
            <button class="engagement-btn like-btn">👍 {{ review.likes || 0 }}</button>
            <button class="engagement-btn dislike-btn">👎 {{ review.dislikes || 0 }}</button>
          </div>
        </div>
      </div>

      <!-- Related Products Section -->
      <div class="related-products-section">
        <h2 class="section-title">相关商品</h2>
        <div class="related-products-grid">
          <div
            v-for="item in relatedProducts"
            :key="item.id"
            class="related-product"
            @click="router.push(`/product/${item.id}`)"
          >
            <div class="related-product-image">
              <img
                v-if="item.image_url"
                :src="item.image_url"
                :alt="item.name"
                style="width: 100%; height: 100%; object-fit: cover"
              />
              <div v-else class="product-bg">🍎</div>
            </div>
            <div class="related-product-info">
              <div class="related-product-name">{{ item.name }}</div>
              <div class="related-product-price">${{ item.price }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading">
      <p>加载中...</p>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="#" class="footer-link">About Us</a>
          <a href="#" class="footer-link">Contact</a>
          <a href="#" class="footer-link">FAQ</a>
          <a href="#" class="footer-link">Privacy Policy</a>
          <a href="#" class="footer-link">Terms of Service</a>
        </div>
        <div class="social-links">
          <a href="#" class="social-link">📷</a>
          <a href="#" class="social-link">🐦</a>
          <a href="#" class="social-link">📘</a>
        </div>
        <div class="copyright">@2024 Fresh Harvest. All rights reserved.</div>
      </div>
    </footer>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { useProductStore } from '../stores/productStore'
import { useUserStore } from '../stores/userStore'
import ProductCard from '../components/ProductCard.vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const productStore = useProductStore()
const userStore = useUserStore()

const product = ref(null)
const quantity = ref(1)
const reviews = ref([])
const relatedProducts = ref([])
const newReview = ref({ rating: 5, comment: '' })

const addToCart = () => {
  cartStore.addToCart(product.value, quantity.value)
  alert('Added to cart!')
}

const buyNow = () => {
  addToCart()
  router.push('/cart')
}

const submitReview = async () => {
  try {
    await axios.post(
      `http://localhost:3000/api/products/${route.params.id}/reviews`,
      newReview.value,
      { headers: { Authorization: `Bearer ${userStore.token}` } },
    )
    alert('Review submitted!')
    loadReviews()
    newReview.value = { rating: 5, comment: '' }
  } catch (error) {
    alert('Failed to submit review', error)
  }
}

const loadReviews = async () => {
  try {
    const response = await axios.get(
      `https://xingyunfeicui.xyz/api/reviews/product/${route.params.id}`,
    )
    if (response.data?.success) {
      reviews.value = response.data.data || []
    }
  } catch (error) {
    console.error('Failed to load reviews', error)
    reviews.value = []
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  try {
    product.value = await productStore.fetchProductById(route.params.id)
    loadReviews()

    await productStore.fetchProducts()
    relatedProducts.value = productStore.products
      .filter((p) => p.category === product.value?.category && p.id !== product.value?.id)
      .slice(0, 3)
  } catch (error) {
    console.error('Failed to load product', error)
    router.push('/')
  }
})
</script>

<style scoped>
.product-detail-page {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header Styles */
.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  padding: 16px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.leaf-icon {
  font-size: 16px;
  color: #2d5a27;
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #000000;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #2d5a27;
}

.search-bar {
  flex: 1;
  max-width: 300px;
  margin: 0 32px;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f0f8f0;
  border-radius: 8px;
  padding: 8px 12px;
}

.search-icon {
  margin-right: 8px;
  color: #666666;
}

.search-input input {
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 16px;
}

.action-btn:hover {
  background-color: #e5e5e5;
}

/* Breadcrumbs */
.breadcrumbs {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-link {
  color: #2d5a27;
  text-decoration: none;
  font-size: 14px;
}

.breadcrumb-separator {
  color: #000000;
  font-size: 14px;
}

.breadcrumb-current {
  color: #000000;
  font-size: 14px;
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* Product Section */
.product-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-bottom: 64px;
}

.product-image-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-image {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1;
  background-color: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
}

.apples-image {
  font-size: 120px;
  line-height: 1;
}

/* Product Details */
.product-details-section {
  padding: 24px 0;
}

.product-name {
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
}

.product-weight {
  font-size: 16px;
  color: #666666;
  margin: 0 0 16px 0;
}

.rating-section {
  margin-bottom: 24px;
}

.rating-text {
  font-size: 16px;
  color: #000000;
  font-weight: 500;
}

.price-section {
  margin-bottom: 24px;
}

.current-price {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 8px;
}

.original-price {
  font-size: 16px;
  color: #999999;
  text-decoration: line-through;
  margin-bottom: 8px;
}

.promotion {
  font-size: 14px;
  color: #2d5a27;
  font-weight: 500;
}

.product-description {
  margin-bottom: 32px;
}

.product-description p {
  font-size: 16px;
  color: #333333;
  line-height: 1.6;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 140px;
}

.btn-primary {
  background-color: #2d5a27;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #1e3d1a;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333333;
  border: 1px solid #e5e5e5;
}

.btn-secondary:hover {
  background-color: #e5e5e5;
}

/* Reviews Section */
.reviews-section {
  margin-bottom: 64px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 32px 0;
}

.review-item {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.review-item:last-child {
  margin-bottom: 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.reviewer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reviewer-name {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 4px;
}

.review-date {
  font-size: 14px;
  color: #666666;
}

.star-rating {
  font-size: 16px;
  color: #ffc107;
}

.review-text {
  font-size: 16px;
  color: #333333;
  line-height: 1.5;
  margin-bottom: 16px;
}

.review-engagement {
  display: flex;
  gap: 16px;
}

.engagement-btn {
  background: none;
  border: none;
  font-size: 14px;
  color: #666666;
  cursor: pointer;
  transition: color 0.2s;
}

.engagement-btn:hover {
  color: #2d5a27;
}

/* Related Products */
.related-products-section {
  margin-bottom: 64px;
}

.related-products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.related-product {
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.related-product:hover {
  transform: translateY(-4px);
}

.related-product-image {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.product-bg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.banana-bg {
  background-color: #fff8e1;
}

.avocado-bg {
  background-color: #e8f5e8;
}

.spinach-bg {
  background-color: #f0f8f0;
}

.related-product-info {
  padding: 16px;
  text-align: center;
}

.related-product-name {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
}

.related-product-price {
  font-size: 14px;
  color: #666666;
}

/* Footer */
.footer {
  background-color: #f8f9fa;
  border-top: 1px solid #e5e5e5;
  padding: 32px 0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
}

.footer-link {
  color: #333333;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #2d5a27;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.social-link {
  font-size: 20px;
  text-decoration: none;
  transition: transform 0.2s;
}

.social-link:hover {
  transform: scale(1.1);
}

.copyright {
  font-size: 14px;
  color: #666666;
}

/* Empty States */
.empty-reviews {
  text-align: center;
  padding: 40px;
  color: #999;
}

.loading {
  text-align: center;
  padding: 100px 0;
  font-size: 18px;
  color: #666;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .product-section {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .related-products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .nav-links {
    gap: 16px;
  }

  .search-bar {
    margin: 0;
    max-width: none;
  }

  .main-content {
    padding: 16px;
  }

  .product-name {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .related-products-grid {
    grid-template-columns: 1fr;
  }

  .footer-links {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
