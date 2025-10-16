<!-- src/views/Shop.vue -->
<template>
  <div class="shop">
    <Header></Header>
    <div class="container">
      <h1>商品列表</h1>

      <!-- 搜索关键词显示 -->
      <div v-if="searchKeyword" class="search-info">
        <p>
          搜索 "<strong>{{ searchKeyword }}</strong
          >" 的结果
          <button @click="clearSearch" class="clear-search-btn">×</button>
        </p>
      </div>

      <div class="shop-layout">
        <!-- Filters Sidebar -->
        <aside class="filters">
          <div class="filter-group">
            <h3>分类</h3>
            <label v-for="cat in categories" :key="cat">
              <input type="checkbox" :value="cat" v-model="selectedCategories" />
              {{ cat }}
            </label>
          </div>

          <div class="filter-group">
            <h3>价格区间</h3>
            <input type="range" min="0" max="50" v-model="maxPrice" />
            <p>最高 ${{ maxPrice }}</p>
          </div>
        </aside>

        <!-- Products Grid -->
        <div class="products-area">
          <div class="products-header">
            <p>找到 {{ filteredProducts.length }} 个商品</p>
            <select v-model="sortBy">
              <option value="name">名称</option>
              <option value="price-low">价格: 从低到高</option>
              <option value="price-high">价格: 从高到低</option>
              <option value="rating">评分</option>
            </select>
          </div>

          <!-- 加载状态 -->
          <div v-if="productStore.loading" class="loading-state">
            <div class="spinner"></div>
            <p>加载中...</p>
          </div>

          <!-- 商品列表 -->
          <div v-else-if="sortedProducts.length > 0" class="products-grid">
            <div
              v-for="product in sortedProducts"
              :key="product.id"
              class="product-card"
              @click="goToProduct(product.id)"
            >
              <div class="product-image">
                <img v-if="product.image_url" :src="product.image_url" :alt="product.name" />
                <div v-else class="placeholder">🍎</div>
              </div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="price">¥{{ product.price }}</p>
                <div class="product-actions">
                  <button class="add-to-cart-btn" @click.stop="addToCart(product)">
                    加入购物车
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
              ></path>
            </svg>
            <p>{{ searchKeyword ? '未找到匹配的商品' : '未找到符合条件的商品' }}</p>
            <p v-if="searchKeyword" class="suggestion">
              尝试使用其他关键词或<button @click="clearSearch" class="link-btn">清除搜索</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '../stores/productStore'
import { useCartStore } from '../stores/cartStore'
import Header from '../components/Header.vue'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const cartStore = useCartStore()
const selectedCategories = ref([])
const maxPrice = ref(50)
const sortBy = ref('name')
const searchKeyword = ref('')

const categories = ['水果', '蔬菜', '绿叶菜', '果汁']

// 监听路由查询参数变化
watch(
  () => route.query.search,
  (newSearch) => {
    searchKeyword.value = newSearch || ''
  },
  { immediate: true },
)

const filteredProducts = computed(() => {
  // 使用 getter 确保总是获取数组
  let products = productStore.productList || []

  // 额外的安全检查
  if (!Array.isArray(products)) {
    console.warn('products 不是数组，使用空数组代替:', products)
    return []
  }

  try {
    // 搜索过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      products = products.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(keyword)) ||
          (p.description && p.description.toLowerCase().includes(keyword)) ||
          (p.category && p.category.toLowerCase().includes(keyword)),
      )
    }

    // 分类过滤
    if (selectedCategories.value.length > 0) {
      products = products.filter((p) => p.category && selectedCategories.value.includes(p.category))
    }

    // 价格过滤
    products = products.filter((p) => p.price && p.price <= maxPrice.value)

    return products
  } catch (error) {
    console.error('过滤商品时出错:', error)
    return []
  }
})

const sortedProducts = computed(() => {
  const products = [...filteredProducts.value]

  switch (sortBy.value) {
    case 'price-low':
      return products.sort((a, b) => (a.price || 0) - (b.price || 0))
    case 'price-high':
      return products.sort((a, b) => (b.price || 0) - (a.price || 0))
    case 'rating':
      return products.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    default:
      return products.sort((a, b) => {
        const nameA = a.name || ''
        const nameB = b.name || ''
        return nameA.localeCompare(nameB)
      })
  }
})

const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

const addToCart = (product) => {
  cartStore.addToCart(product)
  alert('已加入购物车！')
}

// 清除搜索
const clearSearch = () => {
  router.push({ path: '/shop' })
}

onMounted(async () => {
  console.log('=== Shop页面挂载 ===')
  console.log('初始 productStore.products:', productStore.products)
  console.log('初始 productStore.productList:', productStore.productList)

  try {
    await productStore.fetchProducts()
    console.log('=== 数据加载完成 ===')
    console.log('productStore.products:', productStore.products)
    console.log('productStore.products 类型:', typeof productStore.products)
    console.log('是否为数组:', Array.isArray(productStore.products))
    console.log('productStore.productList:', productStore.productList)
    console.log('商品数量:', productStore.productList?.length || 0)
  } catch (error) {
    console.error('加载商品数据失败:', error)
  }
})
</script>

<style scoped>
.shop {
  min-height: 100vh;
  background-color: #f9f9f9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

/* 搜索信息 */
.search-info {
  background: #eef6ee;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #618961;
}

.search-info p {
  margin: 0;
  color: #333;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-info strong {
  color: #2d5a27;
}

.clear-search-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  transition: color 0.2s;
}

.clear-search-btn:hover {
  color: #333;
}

.shop-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
}

.filters {
  background: white;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group h3 {
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
}

.filter-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 14px;
}

.filter-group input[type='checkbox'] {
  cursor: pointer;
}

.filter-group input[type='range'] {
  width: 100%;
  cursor: pointer;
}

.products-area {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e5e5;
}

.products-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.products-header select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  font-size: 48px;
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.price {
  color: #2d5a27;
  font-size: 18px;
  font-weight: bold;
  margin: 8px 0;
}

.add-to-cart-btn {
  width: 100%;
  padding: 10px;
  background: #618961;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.add-to-cart-btn:hover {
  background: #2d5a27;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.spinner {
  margin: 0 auto 20px;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #618961;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  font-size: 16px;
  margin: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state svg {
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin: 10px 0;
}

.empty-state .suggestion {
  color: #666;
  font-size: 14px;
}

.link-btn {
  background: none;
  border: none;
  color: #618961;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.link-btn:hover {
  color: #2d5a27;
}

@media (max-width: 960px) {
  .shop-layout {
    grid-template-columns: 1fr;
  }

  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 640px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .product-image {
    height: 150px;
  }
}
</style>
