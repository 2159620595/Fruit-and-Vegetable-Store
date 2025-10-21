<template>
  <el-dialog
    v-model="visible"
    title="我的评价"
    width="600px"
    :before-close="handleClose"
  >
    <div class="review-detail-dialog">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <!-- 评价内容 -->
      <div v-else-if="reviews.length > 0" class="reviews-container">
        <div v-for="review in reviews" :key="review.id" class="review-item">
          <!-- 评价头部 -->
          <div class="review-header">
            <div class="user-info">
              <el-avatar :src="review.user_avatar" :size="40">
                {{ review.user_name?.charAt(0) || '用' }}
              </el-avatar>
              <div class="user-details">
                <div class="user-name">
                  {{ review.user_name || '匿名用户' }}
                </div>
                <div class="review-time">
                  {{ formatDate(review.created_at) }}
                </div>
              </div>
            </div>
            <el-rate
              v-model="review.rating"
              disabled
              show-score
              text-color="#ff9900"
            />
          </div>

          <!-- 商品信息 -->
          <div class="product-info" v-if="review.product_name">
            <span class="label">商品：</span>
            <span class="value">{{ review.product_name }}</span>
          </div>

          <!-- 评价内容 -->
          <div class="review-content">
            <p>{{ review.comment || '暂无评价内容' }}</p>
          </div>

          <!-- 评价图片 -->
          <div
            v-if="review.images && review.images.length > 0"
            class="review-images"
          >
            <el-image
              v-for="(img, index) in review.images"
              :key="index"
              :src="img"
              :preview-src-list="review.images"
              :initial-index="index"
              fit="cover"
              class="review-image"
            />
          </div>

          <!-- 点赞数 -->
          <div class="review-footer">
            <div class="likes">
              <el-icon><Promotion /></el-icon>
              <span>{{ review.likes || 0 }} 人觉得有用</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 暂无评价 -->
      <el-empty v-else description="暂无评价记录" :image-size="120" />
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Promotion } from '@element-plus/icons-vue'
import { getProductReviews } from '@/api/review'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  orderId: {
    type: Number,
    default: null,
  },
  order: {
    type: Object,
    default: null,
  },
})

const userStore = useUserStore()

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const loading = ref(false)
const reviews = ref([])

watch(
  () => props.modelValue,
  async newVal => {
    visible.value = newVal
    if (newVal && props.order) {
      await loadReviews()
    }
  }
)

watch(visible, newVal => {
  emit('update:modelValue', newVal)
})

// 加载评价
const loadReviews = async () => {
  try {
    loading.value = true
    reviews.value = []

    if (!props.order || !props.order.items || props.order.items.length === 0) {
      return
    }

    const currentUserId = userStore.userInfo?.id

    // 遍历订单中的所有商品，获取每个商品的评价
    const reviewPromises = props.order.items.map(async item => {
      try {
        const response = await getProductReviews(item.product_id, {
          page: 1,
          page_size: 100,
        })
        const result = response.data.data || response.data
        const productReviews = result.reviews || []

        // 筛选出当前用户对该商品的评价
        return productReviews
          .filter(review => review.user_id === currentUserId)
          .map(review => ({
            ...review,
            product_name: item.product_name,
            product_image: item.product_image,
          }))
      } catch (error) {
        console.error(`获取商品 ${item.product_id} 评价失败:`, error)
        return []
      }
    })

    const allReviews = await Promise.all(reviewPromises)
    reviews.value = allReviews.flat()
  } catch (error) {
    console.error('获取评价失败:', error)
    ElMessage.error('获取评价失败')
    reviews.value = []
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = dateString => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.review-detail-dialog {
  min-height: 200px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-light);
}

.loading-container .el-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.reviews-container {
  max-height: 500px;
  overflow-y: auto;
}

.review-item {
  padding: 20px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  margin-bottom: 16px;
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

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
}

.review-time {
  font-size: 12px;
  color: var(--text-light);
}

.product-info {
  margin-bottom: 12px;
  font-size: 14px;
}

.product-info .label {
  color: var(--text-secondary);
  margin-right: 4px;
}

.product-info .value {
  color: var(--text-color);
  font-weight: 500;
}

.review-content {
  margin-bottom: 12px;
}

.review-content p {
  line-height: 1.6;
  color: var(--text-color);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.review-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.review-image:hover {
  transform: scale(1.05);
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.likes {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 13px;
}

.likes .el-icon {
  color: var(--error-color);
}
</style>
