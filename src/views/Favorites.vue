<!-- src/views/Favorites.vue -->
<template>
  <div class="favorites-page">
    <!-- Main Content -->
    <div class="main-content">
      <!-- 面包屑导航 -->
      <Breadcrumb current-page="我的收藏" />

      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">我的收藏</h1>
            <p class="page-subtitle">收藏的商品列表</p>
          </div>
          <div class="status-section">
            <div class="network-status" :class="networkStatus">
              <span class="status-dot"></span>
              <span class="status-text">
                {{
                  networkStatus === 'online'
                    ? '已连接'
                    : networkStatus === 'offline'
                      ? '连接失败'
                      : '检查中...'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">正在加载收藏列表...</p>
      </div>

      <!-- 收藏商品列表 -->
      <div v-else-if="favorites.length > 0" class="favorites-content">
        <!-- 工具栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <span class="total-count">共 {{ favorites.length }} 件商品</span>
            <el-button
              size="small"
              @click="loadFavorites"
              :loading="loading"
              style="margin-left: 16px"
            >
              刷新列表
            </el-button>
          </div>
          <div class="toolbar-right">
            <el-button
              :disabled="selectedItems.length === 0"
              @click="batchRemove"
            >
              批量删除 ({{ selectedItems.length }})
            </el-button>
            <el-button @click="clearAll">清空收藏</el-button>
          </div>
        </div>

        <!-- 商品网格 -->
        <div class="products-grid">
          <div
            v-for="product in favorites"
            :key="product.id"
            class="product-card"
            :class="{ selected: selectedItems.includes(product.id) }"
          >
            <div class="card-checkbox">
              <el-checkbox
                :model-value="selectedItems.includes(product.id)"
                @change="toggleSelect(product.id)"
              />
            </div>

            <div class="product-image" @click="goToProduct(product.id)">
              <img
                :src="product.image_url || defaultImage"
                :alt="product.name"
                @error="handleImageError"
                loading="lazy"
              />
              <div class="image-overlay">
                <el-button
                  type="primary"
                  size="small"
                  @click.stop="goToProduct(product.id)"
                >
                  查看详情
                </el-button>
              </div>
              <!-- 收藏状态标识 -->
              <div class="favorite-badge">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z"
                  />
                </svg>
              </div>
            </div>

            <div class="product-info">
              <h3 class="product-name" @click="goToProduct(product.id)">
                {{ product.name }}
              </h3>
              <p class="product-desc">{{ product.description }}</p>

              <div class="product-price">
                <span class="current-price">
                  ¥{{ parseFloat(product.price).toFixed(2) }}
                </span>
                <span
                  v-if="
                    product.original_price &&
                    parseFloat(product.original_price) !==
                      parseFloat(product.price)
                  "
                  class="original-price"
                >
                  ¥{{ parseFloat(product.original_price).toFixed(2) }}
                </span>
              </div>

              <div class="product-meta">
                <div class="rating">
                  <el-rate
                    :model-value="parseFloat(product.rating || 0)"
                    disabled
                    show-score
                    text-color="#ff9900"
                    score-template="{value}"
                  />
                </div>
                <div class="sales-count">
                  已售 {{ product.sales_count || 0 }}
                </div>
              </div>

              <div class="product-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="addToCart(product)"
                >
                  加入购物车
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  :loading="product.favoriteLoading"
                  @click="toggleFavorite(product)"
                >
                  {{ product.is_favorite ? '取消收藏' : '添加收藏' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z"
              stroke="#e5e7eb"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h3 class="empty-title">暂无收藏商品</h3>
        <p class="empty-desc">您还没有收藏任何商品，快去商城挑选心仪的商品吧</p>
        <div class="empty-actions">
          <el-button type="primary" @click="goToShop">去商城逛逛</el-button>
          <el-button @click="loadFavorites">刷新列表</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCartStore } from '../stores/cartStore'
import Breadcrumb from '../components/Breadcrumb.vue'
import {
  getFavoritesList,
  batchRemoveFavorites,
  clearAllFavorites,
  toggleFavorite as toggleFavoriteAPI,
} from '../api/favorites'

// 组件名称
defineOptions({
  name: 'FavoritesPage',
})

const router = useRouter()
const cartStore = useCartStore()

// 响应式数据
const favorites = ref([])
const selectedItems = ref([])
const loading = ref(false)
const networkStatus = ref('checking') // checking, online, offline

// 默认图片
const defaultImage =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04MCA2MEM4MCA1My4zNzI2IDg1LjM3MjYgNDggOTIgNDhIMTA4QzExNC42MjcgNDggMTIwIDUzLjM3MjYgMTIwIDYwVjE0MEMxMjAgMTQ2LjYyNyAxMTQuNjI3IDE1MiAxMDggMTUySDkyQzg1LjM3MjYgMTUyIDgwIDE0Ni42MjcgODAgMTQwVjYwWiIgZmlsbD0iI0U1RTdFQiIvPgo8L3N2Zz4K'

// 安全地提取数组数据的辅助函数
const extractArrayData = responseData => {
  // 尝试多种可能的数据结构
  const possiblePaths = [
    responseData.data?.products, // 处理 {data: {products: [...]}} 结构
    responseData.data,
    responseData.favorites,
    responseData.list,
    responseData.items,
    responseData.results,
    responseData,
  ]

  for (const data of possiblePaths) {
    if (Array.isArray(data)) {
      return data
    }
  }

  return []
}

// 方法
const loadFavorites = async () => {
  loading.value = true
  networkStatus.value = 'checking'

  try {
    const response = await getFavoritesList()
    networkStatus.value = 'online'

    // 调试信息：打印API响应
    // console.log('收藏列表API响应:', response)

    // 使用辅助函数安全地提取数组数据
    const favoritesData = extractArrayData(response.data)

    if (favoritesData.length > 0) {
      favorites.value = favoritesData.map(product => ({
        ...product,
        is_favorite: true, // 收藏列表中的商品都是已收藏状态
        favoriteLoading: false, // 添加加载状态
      }))

      // console.log('处理后的收藏列表:', favorites.value)
    } else {
      favorites.value = []
      // console.warn(
      //   '未找到有效的收藏数据，API响应结构:',
      //   JSON.stringify(response.data, null, 2)
      // )

      if (response.data && response.data.code === 200) {
        ElMessage.info('您还没有收藏任何商品')
      } else {
        ElMessage.warning('收藏列表数据格式不正确')
      }
    }
  } catch {
    networkStatus.value = 'offline'
    // console.error('加载收藏列表失败:', error)
    ElMessage.error('加载收藏列表失败，请检查网络连接')
    favorites.value = []
  } finally {
    loading.value = false
  }
}

const toggleSelect = productId => {
  const index = selectedItems.value.indexOf(productId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(productId)
  }
}

const batchRemove = async () => {
  if (selectedItems.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedItems.value.length} 件商品吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 调用批量删除收藏的API
    await batchRemoveFavorites(selectedItems.value)

    // 更新本地状态
    favorites.value = favorites.value.filter(
      item => !selectedItems.value.includes(item.id)
    )
    selectedItems.value = []

    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

const clearAll = async () => {
  if (favorites.value.length === 0) return

  try {
    await ElMessageBox.confirm('确定要清空所有收藏吗？', '清空收藏', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用清空收藏的API
    await clearAllFavorites()

    favorites.value = []
    selectedItems.value = []

    ElMessage.success('清空成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空失败，请重试')
    }
  }
}

// 切换收藏状态
const toggleFavorite = async product => {
  try {
    // 设置加载状态
    product.favoriteLoading = true

    // 使用统一的切换收藏接口
    const response = await toggleFavoriteAPI(product.id)

    // 根据API返回的消息判断操作结果
    const message = response.data?.message || ''
    if (message.includes('收藏成功') || message.includes('已添加到收藏')) {
      product.is_favorite = true
      ElMessage.success('已添加到收藏')
    } else if (message.includes('已取消收藏') || message.includes('取消收藏')) {
      product.is_favorite = false
      // 如果取消收藏，从列表中移除
      favorites.value = favorites.value.filter(item => item.id !== product.id)
      const index = selectedItems.value.indexOf(product.id)
      if (index > -1) {
        selectedItems.value.splice(index, 1)
      }
      ElMessage.success('已取消收藏')
    } else {
      // 如果消息不明确，根据当前状态切换
      product.is_favorite = !product.is_favorite
      if (!product.is_favorite) {
        // 如果取消收藏，从列表中移除
        favorites.value = favorites.value.filter(item => item.id !== product.id)
        const index = selectedItems.value.indexOf(product.id)
        if (index > -1) {
          selectedItems.value.splice(index, 1)
        }
      }
      ElMessage.success(product.is_favorite ? '已添加到收藏' : '已取消收藏')
    }
  } catch {
    ElMessage.error('操作失败，请重试')
  } finally {
    product.favoriteLoading = false
  }
}

const addToCart = async product => {
  try {
    await cartStore.addToCart({
      productId: product.id,
      quantity: 1,
      product: product,
    })
    ElMessage.success('已加入购物车')
  } catch {
    ElMessage.error('加入购物车失败')
  }
}

// 图片加载错误处理
const handleImageError = event => {
  event.target.src = defaultImage
}

const goToProduct = productId => {
  router.push(`/product/${productId}`)
}

const goToShop = () => {
  router.push('/shop')
}

// 生命周期
onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 收藏徽章样式 */
.favorite-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(255, 107, 107, 0.9);
  color: var(--text-inverse);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  animation: heartBeat 2s ease-in-out infinite;
}

@keyframes heartBeat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.favorites-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.status-section {
  display: flex;
  align-items: center;
}

.network-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.network-status.checking {
  background-color: var(--bg-input);
  color: var(--text-secondary);
}

.network-status.online {
  background-color: rgba(82, 196, 26, 0.1);
  color: var(--success-color);
}

.network-status.offline {
  background-color: rgba(245, 34, 45, 0.1);
  color: var(--error-color);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

.network-status.checking .status-dot {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.favorites-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.total-count {
  font-size: 14px;
  color: var(--text-secondary);
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.product-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  position: relative;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-card.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
}

.card-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}

.product-image:hover img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.product-image:hover .image-overlay {
  opacity: 1;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
  cursor: pointer;
  transition: color 0.2s;
}

.product-name:hover {
  color: var(--primary-color);
}

.product-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  margin-bottom: 12px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--warning-color);
}

.original-price {
  font-size: 14px;
  color: var(--text-light);
  text-decoration: line-through;
  margin-left: 8px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rating {
  flex: 1;
}

.sales-count {
  font-size: 12px;
  color: var(--text-light);
}

.product-actions {
  display: flex;
  gap: 8px;
}

.product-actions .el-button {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  margin-bottom: 24px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 24px 0;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .favorites-page {
    padding: 16px;
  }

  .main-content {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .toolbar-right {
    justify-content: space-between;
  }

  .product-card {
    padding: 12px;
  }

  .product-name {
    font-size: 14px;
  }

  .product-price {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .favorites-page {
    padding: 12px;
  }

  .main-content {
    padding: 12px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .product-card {
    padding: 10px;
  }

  .product-name {
    font-size: 13px;
  }

  .product-price {
    font-size: 15px;
  }

  .toolbar {
    gap: 10px;
  }
}
</style>
