<!-- src/views/Favorites.vue -->
<template>
  <div class="favorites-page">
    <!-- Main Content -->
    <div class="main-content">
      <!-- 面包屑导航 -->
      <Breadcrumb current-page="我的收藏" />

      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">我的收藏</h1>
        <p class="page-subtitle">收藏的商品列表</p>
      </div>

      <!-- 收藏商品列表 -->
      <div v-if="favorites.length > 0" class="favorites-content">
        <!-- 工具栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <span class="total-count">共 {{ favorites.length }} 件商品</span>
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
            </div>

            <div class="product-info">
              <h3 class="product-name" @click="goToProduct(product.id)">
                {{ product.name }}
              </h3>
              <p class="product-desc">{{ product.description }}</p>

              <div class="product-price">
                <span class="current-price">¥{{ product.price }}</span>
                <span
                  v-if="
                    product.original_price &&
                    product.original_price !== product.price
                  "
                  class="original-price"
                >
                  ¥{{ product.original_price }}
                </span>
              </div>

              <div class="product-meta">
                <div class="rating">
                  <el-rate
                    :model-value="parseFloat(product.rating)"
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
                  @click="removeFavorite(product.id)"
                >
                  取消收藏
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
        <p class="empty-desc">快去商城挑选心仪的商品吧</p>
        <el-button type="primary" @click="goToShop">去逛逛</el-button>
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

const router = useRouter()
const cartStore = useCartStore()

// 响应式数据
const favorites = ref([])
const selectedItems = ref([])
const loading = ref(false)

// 默认图片
const defaultImage =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04MCA2MEM4MCA1My4zNzI2IDg1LjM3MjYgNDggOTIgNDhIMTA4QzExNC42MjcgNDggMTIwIDUzLjM3MjYgMTIwIDYwVjE0MEMxMjAgMTQ2LjYyNyAxMTQuNjI3IDE1MiAxMDggMTUySDkyQzg1LjM3MjYgMTUyIDgwIDE0Ni42MjcgODAgMTQwVjYwWiIgZmlsbD0iI0U1RTdFQiIvPgo8L3N2Zz4K'

// 方法
const loadFavorites = async () => {
  loading.value = true
  try {
    // 这里应该调用获取收藏列表的API
    // const response = await getFavoritesList()
    // favorites.value = response.data

    // 模拟数据
    favorites.value = [
      {
        id: 1,
        name: '新鲜苹果',
        description: '红富士苹果，香甜可口',
        price: '12.99',
        original_price: '15.99',
        image_url: '/src/assets/images/apple.jpg',
        rating: '4.8',
        sales_count: 156,
        is_favorite: true,
      },
      {
        id: 2,
        name: '有机蔬菜',
        description: '新鲜有机蔬菜，健康营养',
        price: '8.99',
        original_price: '8.99',
        image_url: '/src/assets/images/沙拉蔬菜.jpg',
        rating: '4.6',
        sales_count: 89,
        is_favorite: true,
      },
    ]
  } catch  {
    ElMessage.error('加载收藏列表失败')
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

    // 这里应该调用批量删除收藏的API
    // await batchRemoveFavorites(selectedItems.value)

    // 模拟删除成功
    favorites.value = favorites.value.filter(
      item => !selectedItems.value.includes(item.id)
    )
    selectedItems.value = []

    ElMessage.success('删除成功')
  } catch {
    // 用户取消
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

    // 这里应该调用清空收藏的API
    // await clearAllFavorites()

    favorites.value = []
    selectedItems.value = []

    ElMessage.success('清空成功')
  } catch {
    // 用户取消
  }
}

const removeFavorite = async productId => {
  try {
    await ElMessageBox.confirm('确定要取消收藏这件商品吗？', '取消收藏', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 这里应该调用取消收藏的API
    // await removeFromFavorites(productId)

    favorites.value = favorites.value.filter(item => item.id !== productId)
    const index = selectedItems.value.indexOf(productId)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }

    ElMessage.success('已取消收藏')
  } catch {
    // 用户取消
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
  } catch  {
    ElMessage.error('加入购物车失败')
  }
}

const goToProduct = productId => {
  router.push(`/product/${productId}`)
}

const goToShop = () => {
  router.push('/shop')
}

const handleImageError = event => {
  event.target.src = defaultImage
}

// 生命周期
onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background-color: #f8f9fa;
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

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.favorites-content {
  background: white;
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
  color: #666;
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
  border-color: #67c23a;
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
  color: #333;
  margin: 0 0 8px 0;
  cursor: pointer;
  transition: color 0.2s;
}

.product-name:hover {
  color: #67c23a;
}

.product-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  margin-bottom: 12px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #e6a23c;
}

.original-price {
  font-size: 14px;
  color: #999;
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
  color: #999;
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
  color: #333;
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .toolbar-right {
    justify-content: center;
  }
}
</style>
