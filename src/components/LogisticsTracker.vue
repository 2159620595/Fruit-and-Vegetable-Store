<template>
  <div class="logistics-container">
    <!-- 物流信息卡片 -->
    <div class="logistics-card">
      <!-- 头部信息 -->
      <div class="logistics-header">
        <div class="header-main">
          <div class="tracking-info">
            <h3 class="tracking-title">
              <span class="title-icon">📦</span>
              物流跟踪
            </h3>
            <div class="tracking-details">
              <div class="detail-row">
                <span class="detail-label">快递单号：</span>
                <span class="detail-value">{{ trackingNumber || '暂无' }}</span>
                <button
                  v-if="trackingNumber"
                  class="copy-btn"
                  @click="copyTrackingNumber"
                  title="复制单号"
                >
                  📋
                </button>
              </div>
              <div class="detail-row">
                <span class="detail-label">承运商：</span>
                <span class="detail-value">{{ carrier || '暂无' }}</span>
              </div>
              <div v-if="estimatedDelivery" class="detail-row">
                <span class="detail-label">预计送达：</span>
                <span class="detail-value">{{ estimatedDelivery }}</span>
              </div>
            </div>
          </div>
          <div class="refresh-section">
            <button
              class="refresh-btn"
              @click="refreshLogistics"
              :disabled="loading"
              :class="{ refreshing: loading }"
            >
              <span class="refresh-icon" :class="{ spinning: loading }">
                🔄
              </span>
              {{ loading ? '更新中...' : '刷新' }}
            </button>
            <div class="last-update">
              最后更新：{{ lastUpdateTime }}
              <span v-if="isRealTimeEnabled" class="real-time-indicator">
                <span class="indicator-dot"></span>
                实时更新中
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 收货地址信息 -->
      <div v-if="deliveryAddress" class="delivery-address">
        <div class="address-header">
          <span class="address-icon">📍</span>
          <span class="address-title">收货地址</span>
        </div>
        <div class="address-content">
          <div class="address-info">
            <div class="recipient-info">
              <span class="recipient-name">{{ deliveryAddress.name }}</span>
              <span class="recipient-phone">{{ deliveryAddress.phone }}</span>
            </div>
            <div class="address-detail">
              {{ deliveryAddress.province }} {{ deliveryAddress.city }}
              {{ deliveryAddress.district }} {{ deliveryAddress.detail }}
            </div>
          </div>
        </div>
      </div>

      <!-- 发货地址信息 -->
      <div v-if="originAddress" class="origin-address">
        <div class="address-header">
          <span class="address-icon">🏭</span>
          <span class="address-title">发货地址</span>
        </div>
        <div class="address-content">
          <div class="address-info">
            <div class="address-detail">
              {{ originAddress.province }} {{ originAddress.city }}
              {{ originAddress.district }} {{ originAddress.detail }}
            </div>
          </div>
        </div>
      </div>

      <!-- 当前状态 -->
      <div v-if="currentStatus" class="current-status">
        <div class="status-header">
          <span class="status-icon">{{ currentStatus.icon }}</span>
          <span class="status-title">当前状态</span>
        </div>
        <div class="status-content">
          <div class="status-text">{{ currentStatus.text }}</div>
          <div class="status-description">{{ currentStatus.description }}</div>
          <div class="status-time">{{ currentStatus.time }}</div>
        </div>
      </div>

      <!-- 物流进度时间线 -->
      <div v-if="logisticsSteps.length > 0" class="logistics-timeline">
        <div class="timeline-header">
          <span class="timeline-icon">🚚</span>
          <span class="timeline-title">物流轨迹</span>
        </div>
        <div class="timeline-content">
          <div
            v-for="(step, index) in logisticsSteps"
            :key="index"
            class="timeline-step"
            :class="{
              completed: step.completed,
              current: step.current,
              pending: step.pending,
            }"
          >
            <div class="step-indicator">
              <div class="step-icon">
                <span v-if="step.completed">✓</span>
                <span v-else>{{ step.icon }}</span>
              </div>
              <div
                v-if="index < logisticsSteps.length - 1"
                class="step-line"
              ></div>
            </div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-description">{{ step.description }}</div>
              <div class="step-time">{{ step.time }}</div>
              <div v-if="step.location" class="step-location">
                <span class="location-icon">📍</span>
                {{ step.location }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">正在获取物流信息...</div>
      </div>

      <!-- 错误状态 -->
      <div v-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-text">{{ error }}</div>
        <button class="retry-btn" @click="refreshLogistics">重试</button>
      </div>

      <!-- 空状态 -->
      <div
        v-if="!loading && !error && !logisticsSteps.length"
        class="empty-state"
      >
        <div class="empty-icon">📦</div>
        <div class="empty-text">暂无物流信息</div>
        <div class="empty-description">订单可能还未发货或物流信息尚未更新</div>
      </div>

      <!-- 温馨提示 -->
      <div v-if="logisticsSteps.length > 0" class="tips-section">
        <div class="tips-content">
          <span class="tips-icon">💡</span>
          <span class="tips-text">
            如有疑问请联系客服 400-123-4567，或通过在线客服咨询
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import logisticsRealTimeService from '@/services/logisticsRealTimeService'
import { useAddressStore } from '@/stores/addressStore'
import { getLogistics } from '@/api/order' // 🆕 导入新的物流接口

// Props
const props = defineProps({
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
    default: 30000, // 30秒
  },
})

// Emits
const emit = defineEmits(['update', 'error'])

// Stores
const addressStore = useAddressStore()

// State
const loading = ref(false)
const error = ref(null)
const logisticsSteps = ref([])
const lastUpdateTime = ref('')
const refreshTimer = ref(null)
const subscriptionId = ref(null)
const isRealTimeEnabled = ref(false)
const deliveryAddress = ref(null)
const originAddress = ref(null)

// 计算属性
const currentStatus = computed(() => {
  if (!logisticsSteps.value.length) return null

  const currentStep = logisticsSteps.value.find(step => step.current)
  const latestStep = logisticsSteps.value[0]

  const step = currentStep || latestStep

  return {
    icon: step.icon,
    text: step.title,
    description: step.description,
    time: step.time,
    statusClass: step.completed
      ? 'completed'
      : step.current
        ? 'current'
        : 'pending',
  }
})

const estimatedDelivery = computed(() => {
  if (!deliveryAddress.value) return null

  // 根据收货地址和当前状态计算预计送达时间
  const now = new Date()
  const deliveryTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // 默认2天后

  return deliveryTime.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// 🆕 方法（已优化 - 优先使用后端 API）
const refreshLogistics = async () => {
  if (loading.value) return

  try {
    loading.value = true
    error.value = null

    // 优先尝试从后端API获取物流信息
    try {
      const response = await getLogistics(props.orderId)
      const result = response.data?.data || response.data

      if (result && result.traces) {
        // 将后端返回的数据转换为前端需要的格式
        logisticsSteps.value = result.traces.map((trace, index) => ({
          title: trace.status || trace.title,
          description: trace.description,
          time: new Date(trace.time).toLocaleString('zh-CN'),
          location: trace.location || '',
          icon: index === 0 ? '📍' : '📦',
          completed: index > 0,
          current: index === 0,
          pending: false,
        }))

        lastUpdateTime.value = new Date().toLocaleString('zh-CN')

        // 如果有发货地址信息
        if (result.origin_address) {
          originAddress.value = result.origin_address
        }

        emit('update', result)
        return
      }
    } catch (apiError) {
      // API 失败，fallback 到模拟数据
      // eslint-disable-next-line no-console
      console.warn('后端物流API调用失败，使用模拟数据:', apiError)
    }

    // Fallback: 使用模拟数据服务
    const logisticsData =
      await logisticsRealTimeService.generateMockLogisticsData(
        props.trackingNumber,
        props.carrier,
        deliveryAddress.value,
        props.orderStatus
      )

    logisticsSteps.value = logisticsData.steps || []
    lastUpdateTime.value = new Date().toLocaleString('zh-CN')
    originAddress.value = logisticsData.originAddress

    emit('update', logisticsData)
  } catch (err) {
    error.value = err.message || '获取物流信息失败'
    emit('error', err)
  } finally {
    loading.value = false
  }
}

const copyTrackingNumber = async () => {
  try {
    await navigator.clipboard.writeText(props.trackingNumber)
    ElMessage.success('快递单号已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const startRealTimeUpdates = () => {
  if (!props.autoRefresh || subscriptionId.value) return

  subscriptionId.value = logisticsRealTimeService.subscribe(
    props.trackingNumber,
    props.carrier,
    data => {
      logisticsSteps.value = data.steps || []
      lastUpdateTime.value = new Date().toLocaleString('zh-CN')
      originAddress.value = data.originAddress
      emit('update', data)
    },
    {
      interval: props.refreshInterval,
      useMock: true,
      autoStart: true,
      deliveryAddress: deliveryAddress.value,
      orderStatus: props.orderStatus,
    }
  )

  isRealTimeEnabled.value = true
}

const stopRealTimeUpdates = () => {
  if (subscriptionId.value) {
    logisticsRealTimeService.unsubscribe(subscriptionId.value)
    subscriptionId.value = null
    isRealTimeEnabled.value = false
  }
}

// 获取收货地址
const getDeliveryAddress = async () => {
  try {
    // 从地址store获取默认地址或订单关联的地址
    const addresses = addressStore.addresses
    if (addresses && addresses.length > 0) {
      deliveryAddress.value =
        addresses.find(addr => addr.isDefault) || addresses[0]
    }
  } catch (err) {
    console.warn('获取收货地址失败:', err)
  }
}

// 监听器
watch(
  () => props.trackingNumber,
  newTrackingNumber => {
    if (newTrackingNumber) {
      refreshLogistics()
      startRealTimeUpdates()
    }
  },
  { immediate: true }
)

watch(
  () => props.autoRefresh,
  newAutoRefresh => {
    if (newAutoRefresh) {
      startRealTimeUpdates()
    } else {
      stopRealTimeUpdates()
    }
  }
)

// 生命周期
onMounted(async () => {
  await getDeliveryAddress()
  if (props.trackingNumber) {
    await refreshLogistics()
    startRealTimeUpdates()
  }
})

onUnmounted(() => {
  stopRealTimeUpdates()
})
</script>

<style scoped>
.logistics-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.logistics-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 头部信息 */
.logistics-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.tracking-info {
  flex: 1;
}

.tracking-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.title-icon {
  font-size: 24px;
}

.tracking-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.detail-label {
  opacity: 0.9;
  min-width: 80px;
}

.detail-value {
  font-weight: 600;
}

.copy-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.refresh-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 16px;
  transition: transform 0.3s;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.last-update {
  font-size: 12px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 6px;
}

.real-time-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  background: #4ade80;
  border-radius: 50%;
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

/* 收货地址 */
.delivery-address {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

/* 发货地址 */
.origin-address {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #f0f9ff;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.address-icon {
  font-size: 16px;
}

.address-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.address-content {
  margin-left: 24px;
}

.address-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recipient-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.recipient-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.recipient-phone {
  font-size: 14px;
  color: #666;
}

.address-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* 当前状态 */
.current-status {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #f8f9ff;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.status-icon {
  font-size: 20px;
}

.status-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.status-content {
  margin-left: 28px;
}

.status-text {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
}

.status-description {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 6px;
  line-height: 1.4;
}

.status-time {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

/* 物流时间线 */
.logistics-timeline {
  padding: 20px 24px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.timeline-icon {
  font-size: 18px;
}

.timeline-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.timeline-content {
  position: relative;
  padding-left: 20px;
}

.timeline-step {
  position: relative;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
}

.timeline-step:last-child {
  margin-bottom: 0;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  border: 3px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #64748b;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 2;
  position: relative;
}

.timeline-step.completed .step-icon {
  background: #4ade80;
  color: white;
}

.timeline-step.current .step-icon {
  background: #667eea;
  color: white;
  animation: pulse-current 2s infinite;
}

@keyframes pulse-current {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.step-line {
  width: 2px;
  height: 40px;
  background: #e2e8f0;
  margin-top: 8px;
}

.timeline-step.completed .step-line {
  background: #4ade80;
}

.step-content {
  flex: 1;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
}

.timeline-step.completed .step-content {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.timeline-step.current .step-content {
  background: #f0f9ff;
  border-color: #bae6fd;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.step-description {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
  line-height: 1.4;
}

.step-time {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
  font-weight: 500;
}

.step-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.location-icon {
  font-size: 12px;
  color: #667eea;
}

/* 状态样式 */
.loading-state,
.error-state,
.empty-state {
  padding: 40px 24px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.loading-text {
  font-size: 14px;
  color: #64748b;
}

.error-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.error-text {
  font-size: 14px;
  color: #ef4444;
  margin-bottom: 16px;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #5a67d8;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #94a3b8;
}

/* 温馨提示 */
.tips-section {
  padding: 16px 24px;
  background: #fef3c7;
  border-top: 1px solid #f59e0b;
}

.tips-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tips-icon {
  font-size: 16px;
}

.tips-text {
  font-size: 13px;
  color: #92400e;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .logistics-container {
    margin: 0;
    border-radius: 0;
  }

  .logistics-card {
    border-radius: 0;
    box-shadow: none;
  }

  .logistics-header {
    padding: 20px;
  }

  .header-main {
    flex-direction: column;
    gap: 16px;
  }

  .refresh-section {
    align-items: flex-start;
  }

  .delivery-address,
  .current-status,
  .logistics-timeline {
    padding: 16px 20px;
  }

  .timeline-content {
    padding-left: 16px;
  }

  .step-icon {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .step-content {
    padding: 10px 12px;
  }

  .tips-section {
    padding: 12px 20px;
  }
}

@media (max-width: 480px) {
  .logistics-header {
    padding: 16px;
  }

  .tracking-title {
    font-size: 18px;
  }

  .detail-row {
    font-size: 13px;
  }

  .delivery-address,
  .current-status,
  .logistics-timeline {
    padding: 12px 16px;
  }

  .timeline-content {
    padding-left: 12px;
  }

  .step-icon {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }

  .step-content {
    padding: 8px 10px;
  }

  .tips-section {
    padding: 10px 16px;
  }
}
</style>
