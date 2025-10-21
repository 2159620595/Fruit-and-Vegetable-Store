<template>
  <div class="logistics-dialog">
    <LogisticsTracker
      :order-id="orderId"
      :tracking-number="trackingNumber"
      :carrier="carrier"
      :order-status="orderStatus"
      :auto-refresh="autoRefresh"
      :refresh-interval="refreshInterval"
      @update="handleUpdate"
      @error="handleError"
    />
  </div>
</template>

<script setup>
import LogisticsTracker from '@/components/LogisticsTracker.vue'

// Props
defineProps({
  orderId: {
    type: [String, Number],
    required: true,
  },
  trackingNumber: {
    type: String,
    default: '',
  },
  carrier: {
    type: String,
    default: '',
  },
  orderStatus: {
    type: String,
    default: 'shipped',
  },
  autoRefresh: {
    type: Boolean,
    default: true,
  },
  refreshInterval: {
    type: Number,
    default: 30000,
  },
})

// Emits
const emit = defineEmits(['update', 'error'])

// Methods
const handleUpdate = data => {
  emit('update', data)
}

const handleError = error => {
  emit('error', error)
}
</script>

<style scoped>
.logistics-dialog {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* 确保对话框内容不被遮挡 */
:deep(.el-message-box) {
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

:deep(.el-message-box__content) {
  padding: 0;
  max-height: 70vh;
  overflow-y: auto;
}

/* 移动端适配 */
@media (max-width: 768px) {
  :deep(.el-message-box) {
    width: 95vw;
    margin: 0 auto;
  }

  :deep(.el-message-box__content) {
    max-height: 80vh;
  }
}

@media (max-width: 480px) {
  :deep(.el-message-box) {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  :deep(.el-message-box__content) {
    max-height: 85vh;
  }
}
</style>
