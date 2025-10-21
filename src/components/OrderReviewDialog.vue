<template>
  <el-dialog
    v-model="visible"
    title="订单评价"
    width="500px"
    :before-close="handleClose"
  >
    <div class="review-dialog">
      <!-- 订单信息 -->
      <div class="order-info" v-if="order && order.order_number">
        <h4>订单信息</h4>
        <p>
          <strong>订单号：</strong>
          {{ order.order_number }}
        </p>
        <p>
          <strong>订单状态：</strong>
          {{ getStatusText(order.status) }}
        </p>
      </div>

      <!-- 商品列表 -->
      <div
        class="product-list"
        v-if="order && order.items && order.items.length > 0"
      >
        <h4>商品列表</h4>
        <div class="product-item" v-for="item in order.items" :key="item.id">
          <img
            :src="item.product_image"
            :alt="item.product_name"
            class="product-image"
            @error="handleImageError"
          />
          <div class="product-info">
            <div class="product-name">{{ item.product_name }}</div>
            <div class="product-spec">数量：{{ item.quantity }}</div>
          </div>
        </div>
      </div>

      <!-- 评价表单 -->
      <el-form
        :model="reviewForm"
        :rules="rules"
        ref="reviewFormRef"
        label-width="80px"
      >
        <el-form-item label="整体评分" prop="rating" required>
          <el-rate
            v-model="reviewForm.rating"
            :max="5"
            show-text
            :texts="['极差', '失望', '一般', '满意', '惊喜']"
            text-color="#ff9900"
          />
        </el-form-item>

        <el-form-item label="评价内容" prop="comment">
          <el-input
            v-model="reviewForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请分享您的购物体验，帮助其他用户做出更好的选择..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- 商品评价 -->
        <div
          v-if="order && order.items && order.items.length > 0"
          class="product-reviews"
        >
          <h4>商品评价</h4>
          <div
            class="product-review-item"
            v-for="item in order.items"
            :key="item.id"
          >
            <div class="product-review-header">
              <img
                :src="item.product_image"
                :alt="item.product_name"
                class="product-review-image"
                @error="handleImageError"
              />
              <span class="product-review-name">{{ item.product_name }}</span>
            </div>
            <el-rate
              v-model="item.rating"
              :max="5"
              size="small"
              show-text
              :texts="['', '', '', '', '']"
            />
          </div>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          提交评价
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Object,
    default: () => null,
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = ref(false)
const loading = ref(false)
const reviewFormRef = ref()

// 评价表单数据
const reviewForm = reactive({
  rating: 5,
  comment: '',
})

// 表单验证规则
const rules = {
  rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
}

// 监听显示状态
watch(
  () => props.modelValue,
  newVal => {
    visible.value = newVal
    if (newVal) {
      // 重置表单
      reviewForm.rating = 5
      reviewForm.comment = ''

      // 重置商品评分
      if (props.order && props.order.items) {
        props.order.items.forEach(item => {
          item.rating = 5
        })
      }
    }
  }
)

watch(visible, newVal => {
  emit('update:modelValue', newVal)
})

// 获取状态文本
const getStatusText = status => {
  const statusMap = {
    pending: '待支付',
    processing: '待发货',
    shipped: '已发货',
    in_transit: '运输中',
    delivered: '已完成',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

// 处理图片加载错误
const handleImageError = event => {
  const img = event.target
  img.style.display = 'none'
  const placeholder = document.createElement('div')
  placeholder.className = 'product-image-placeholder'
  placeholder.textContent = '🍎'
  img.parentNode.appendChild(placeholder)
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 提交评价
const handleSubmit = async () => {
  try {
    await reviewFormRef.value.validate()

    loading.value = true

    // 检查order是否存在
    if (!props.order || !props.order.items) {
      ElMessage.error('订单信息不完整')
      loading.value = false
      return
    }

    // 准备评价数据
    const reviewData = {
      rating: reviewForm.rating,
      comment: reviewForm.comment || '',
      images: [],
      product_reviews: props.order.items.map(item => ({
        product_id: item.product_id,
        rating: item.rating || reviewForm.rating || 5,
      })),
    }

    emit('submit', reviewData)

    // 关闭对话框
    visible.value = false
    loading.value = false
  } catch {
    // 表单验证失败
    ElMessage.error('请完善评价信息')
    loading.value = false
  }
}
</script>

<style scoped>
.review-dialog {
  max-height: 60vh;
  overflow-y: auto;
}

.order-info {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 6px;
}

.order-info h4 {
  margin: 0 0 12px 0;
  color: var(--text-color);
  font-size: 16px;
}

.order-info p {
  margin: 6px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.product-list {
  margin-bottom: 20px;
}

.product-list h4 {
  margin: 0 0 12px 0;
  color: var(--text-color);
  font-size: 16px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 8px;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.product-image-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 4px;
  margin-right: 12px;
  font-size: 24px;
  color: var(--text-secondary);
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 4px;
}

.product-spec {
  font-size: 13px;
  color: var(--text-secondary);
}

.product-reviews {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.product-reviews h4 {
  margin: 0 0 16px 0;
  color: var(--text-color);
  font-size: 16px;
}

.product-review-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.product-review-item:last-child {
  border-bottom: none;
}

.product-review-header {
  display: flex;
  align-items: center;
  flex: 1;
}

.product-review-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.product-review-name {
  font-size: 14px;
  color: var(--text-color);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-image {
    margin-right: 0;
    margin-bottom: 8px;
  }

  .product-review-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
