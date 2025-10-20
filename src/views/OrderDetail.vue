<template>
  <div class="order-detail-page">
    <!-- Breadcrumbs -->
    <Breadcrumb current-page="订单详情" />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <el-icon class="error-icon" :size="64">
        <WarningFilled />
      </el-icon>
      <h2 class="error-title">加载失败</h2>
      <p class="error-message">{{ error }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="loadOrderDetail" :icon="Refresh">
          重试
        </el-button>
        <el-button @click="router.push('/orders')" :icon="Back">
          返回订单列表
        </el-button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="order" class="main-content">
      <!-- Order Header -->
      <div class="order-header">
        <div class="order-info">
          <h1 class="order-number">订单号：{{ order.order_number }}</h1>
          <div class="order-status">
            <span
              class="status-badge"
              :class="orderStatusInfo?.statusClass"
              :style="{ backgroundColor: orderStatusInfo?.statusColor }"
            >
              <component
                v-if="orderStatusInfo?.statusIconComponent"
                :is="orderStatusInfo.statusIconComponent"
                class="status-icon"
              />
              {{ orderStatusInfo?.statusText }}
            </span>
            <span class="order-date">{{ formatDate(order.created_at) }}</span>
          </div>
        </div>
        <div class="order-actions">
          <el-button
            v-if="orderStatusInfo?.canPay"
            type="primary"
            @click="handlePayOrder"
            :icon="Wallet"
          >
            立即支付
          </el-button>
          <el-button
            v-if="order.status === 'delivered'"
            type="success"
            @click="handleReview"
            :icon="Edit"
          >
            评价订单
          </el-button>
          <el-button
            v-if="
              ['processing', 'shipped', 'in_transit', 'delivered'].includes(
                order.status
              )
            "
            plain
            @click="handleTrackOrder"
            :icon="Van"
          >
            查看物流
          </el-button>
          <el-button
            v-if="order.status === 'delivered'"
            plain
            @click="handleBuyAgain"
            :icon="ShoppingCart"
          >
            再次购买
          </el-button>
          <el-button
            v-if="orderStatusInfo?.canCancel"
            type="danger"
            @click="handleCancelOrder"
            :icon="Close"
          >
            取消订单
          </el-button>
        </div>
      </div>

      <!-- Order Progress -->
      <div class="order-progress">
        <h2 class="section-title">订单进度</h2>
        <div class="progress-timeline">
          <div
            v-for="(step, index) in orderSteps"
            :key="index"
            class="timeline-item"
            :class="{
              completed: step.completed,
              current: step.current,
              active: step.active,
            }"
          >
            <div class="timeline-icon">
              <div class="icon-circle">
                <el-icon v-if="step.completed" :size="20">
                  <Checked />
                </el-icon>
                <component v-else :is="step.iconComponent" :size="20" />
              </div>
            </div>
            <div class="timeline-content">
              <div class="timeline-status">{{ step.status }}</div>
              <div class="timeline-date">{{ step.date }}</div>
              <div v-if="step.description" class="timeline-description">
                {{ step.description }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="order-items">
        <h2 class="section-title">商品清单</h2>
        <div class="items-list">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <div class="item-image">
              <img
                v-if="item.product_image"
                :src="item.product_image"
                :alt="item.product_name"
                @error="handleImageError"
              />
              <div v-else class="image-placeholder">
                <el-icon :size="32">
                  <component :is="getProductIconComponent(item.category)" />
                </el-icon>
              </div>
            </div>
            <div class="item-details">
              <h3 class="item-name">{{ item.product_name }}</h3>
              <p class="item-spec">{{ item.specification || '标准规格' }}</p>
              <div class="item-price">
                <span class="current-price">
                  ¥{{ formatPrice(item.price) }}
                </span>
                <span v-if="item.original_price" class="original-price">
                  ¥{{ formatPrice(item.original_price) }}
                </span>
              </div>
            </div>
            <div class="item-quantity">
              <span class="quantity-label">数量：</span>
              <span class="quantity-value">{{ item.quantity }}</span>
            </div>
            <div class="item-total">
              <span class="total-label">小计：</span>
              <span class="total-value">
                ¥{{ formatPrice(item.price * item.quantity) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <h2 class="section-title">订单汇总</h2>
        <div class="summary-content">
          <div class="summary-row">
            <span class="summary-label">商品总价：</span>
            <span class="summary-value">
              ¥{{ priceCalculations?.formattedSubtotal || '0.00' }}
            </span>
          </div>
          <div v-if="priceCalculations?.hasShippingFee" class="summary-row">
            <span class="summary-label">运费：</span>
            <span class="summary-value">
              ¥{{ priceCalculations.formattedShippingFee }}
            </span>
          </div>
          <div
            v-if="priceCalculations?.hasDiscount"
            class="summary-row discount"
          >
            <span class="summary-label">优惠：</span>
            <span class="summary-value">
              -¥{{ priceCalculations.formattedDiscountAmount }}
            </span>
          </div>
          <div class="summary-row total">
            <span class="summary-label">实付金额：</span>
            <span class="summary-value">
              ¥{{ priceCalculations?.formattedTotalAmount || '0.00' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Delivery Information -->
      <div class="delivery-info">
        <h2 class="section-title">配送信息</h2>
        <div class="delivery-content">
          <div class="delivery-row">
            <span class="delivery-label">收货人：</span>
            <span class="delivery-value">
              {{ addressInfo?.name || '未设置' }}
            </span>
          </div>
          <div class="delivery-row">
            <span class="delivery-label">联系电话：</span>
            <span class="delivery-value">
              {{ addressInfo?.displayPhone || '未设置' }}
            </span>
          </div>
          <div class="delivery-row">
            <span class="delivery-label">收货地址：</span>
            <span class="delivery-value">
              {{ addressInfo?.fullAddress || '未设置' }}
            </span>
          </div>
          <div v-if="order.tracking_number" class="delivery-row">
            <span class="delivery-label">快递单号：</span>
            <span class="delivery-value">{{ order.tracking_number }}</span>
          </div>
          <div v-if="order.carrier" class="delivery-row">
            <span class="delivery-label">快递公司：</span>
            <span class="delivery-value">{{ order.carrier }}</span>
          </div>
        </div>
      </div>

      <!-- Logistics Information -->
      <div
        v-if="['shipped', 'in_transit', 'delivered'].includes(order.status)"
        class="logistics-info"
      >
        <h2 class="section-title">物流信息</h2>
        <LogisticsTracker
          :order-id="order.id"
          :tracking-number="order.tracking_number"
          :carrier="order.carrier"
          :order-status="order.status"
          :auto-refresh="true"
          :refresh-interval="30000"
          @update="handleLogisticsUpdate"
          @error="handleLogisticsError"
        />
      </div>

      <!-- Payment Information -->
      <div class="payment-info">
        <h2 class="section-title">支付信息</h2>
        <div class="payment-content">
          <div class="payment-row">
            <span class="payment-label">支付方式：</span>
            <span class="payment-value">
              {{ getPaymentMethod(order.payment_method) }}
            </span>
          </div>
          <div v-if="order.paid_at" class="payment-row">
            <span class="payment-label">支付时间：</span>
            <span class="payment-value">{{ formatDate(order.paid_at) }}</span>
          </div>
          <div v-if="order.payment_transaction_id" class="payment-row">
            <span class="payment-label">交易号：</span>
            <span class="payment-value">
              {{ order.payment_transaction_id }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-container">
      <el-icon class="empty-icon" :size="64">
        <Box />
      </el-icon>
      <h2 class="empty-title">订单不存在</h2>
      <p class="empty-message">该订单可能已被删除或不存在</p>
      <div class="empty-actions">
        <el-button type="primary" @click="router.push('/orders')" :icon="Back">
          返回订单列表
        </el-button>
        <el-button @click="loadOrderDetail" :icon="Refresh">重新加载</el-button>
      </div>
    </div>

    <!-- 支付对话框 -->
    <PaymentDialog
      v-model="paymentDialogVisible"
      :amount="paymentAmount"
      @confirm="handlePaymentConfirm"
      @cancel="handlePaymentCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Back,
  Refresh,
  WarningFilled,
  Box,
  Clock,
  Van,
  Location,
  SuccessFilled,
  CircleCloseFilled,
  QuestionFilled,
  Wallet,
  Edit,
  ShoppingCart,
  Close,
  Checked,
  Apple,
  Orange,
  ForkSpoon,
  Coffee,
  Dish,
} from '@element-plus/icons-vue'
import { useOrderStore } from '@/stores/orderStore'
import { useUserStore } from '@/stores/userStore'
import { useLogisticsStore } from '@/stores/logisticsStore'
import LogisticsTracker from '@/components/LogisticsTracker.vue'
import LogisticsDialog from '@/components/LogisticsDialog.vue'
import PaymentDialog from '@/components/PaymentDialog.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()
const logisticsStore = useLogisticsStore()

// State
const order = ref(null)
const loading = ref(false)
const error = ref(null)

// 支付对话框状态
const paymentDialogVisible = ref(false)
const paymentAmount = computed(() => {
  return order.value ? parseFloat(order.value.total_amount) || 0 : 0
})

// Computed properties
const orderSteps = computed(() => {
  if (!order.value) return []

  const currentStatus = order.value.status
  // const statusInfo = getStatusInfo(currentStatus) // 暂时未使用

  // 定义标准订单流程步骤（与后端状态保持一致）
  const standardSteps = [
    {
      key: 'pending',
      status: '待支付',
      iconComponent: h(Clock),
      statusValue: 'pending',
    },
    {
      key: 'processing',
      status: '待发货',
      iconComponent: h(Box),
      statusValue: 'processing',
    },
    {
      key: 'shipped',
      status: '已发货',
      iconComponent: h(Van),
      statusValue: 'shipped',
    },
    {
      key: 'in_transit',
      status: '运输中',
      iconComponent: h(Location),
      statusValue: 'in_transit',
    },
    {
      key: 'delivered',
      status: '已完成',
      iconComponent: h(SuccessFilled),
      statusValue: 'delivered',
    },
  ]

  // 根据当前状态计算每个步骤的状态
  const steps = standardSteps.map((step, index) => {
    const isCompleted = isStepCompleted(step.statusValue, currentStatus)
    const isCurrent = step.statusValue === currentStatus
    const isActive = isCurrent || (index === 0 && currentStatus === 'pending')

    return {
      ...step,
      completed: isCompleted,
      current: isCurrent,
      active: isActive,
      date: getStepDate(step.statusValue, order.value),
      description: getStepDescription(
        step.statusValue,
        currentStatus,
        order.value
      ),
      progress: ((index + 1) / standardSteps.length) * 100,
    }
  })

  // 特殊处理取消状态
  if (currentStatus === 'cancelled') {
    steps.forEach((step, index) => {
      step.completed = index === 0 // 只有下单步骤完成
      step.current = false
      step.active = false
      if (index === 0) {
        step.description = '订单已取消'
      }
    })
  }

  return steps
})

// 判断步骤是否完成
const isStepCompleted = (stepStatus, currentStatus) => {
  const statusOrder = [
    'pending',
    'processing',
    'shipped',
    'in_transit',
    'delivered',
  ]
  const stepIndex = statusOrder.indexOf(stepStatus)
  const currentIndex = statusOrder.indexOf(currentStatus)

  if (stepIndex === -1) return false // 未知步骤

  // 按顺序判断步骤是否完成
  return currentIndex > stepIndex
}

// 获取步骤日期
const getStepDate = (stepStatus, orderData) => {
  switch (stepStatus) {
    case 'pending':
      return formatDate(orderData.created_at)
    case 'processing':
      return '待发货'
    case 'shipped':
      return orderData.shipped_at ? formatDate(orderData.shipped_at) : '待发货'
    case 'in_transit':
      return '运输中'
    case 'delivered':
      return orderData.delivered_at
        ? formatDate(orderData.delivered_at)
        : '待送达'
    default:
      return '进行中'
  }
}

// 获取步骤描述
const getStepDescription = (stepStatus, currentStatus) => {
  const descriptions = {
    pending: '您的订单已成功提交，请尽快完成支付',
    processing:
      currentStatus === 'processing' ? '商家正在准备您的商品' : '订单已处理',
    shipped: currentStatus === 'shipped' ? '商品正在配送中' : '商品已发出',
    in_transit:
      currentStatus === 'in_transit' ? '商品正在运输途中' : '商品运输中',
    delivered: currentStatus === 'delivered' ? '商品已成功送达' : '等待送达',
  }

  return descriptions[stepStatus] || '进行中'
}

// 订单状态统计
const orderStatusInfo = computed(() => {
  if (!order.value) return null

  const status = order.value.status
  const statusConfig = getStatusInfo(status)
  const createdDate = new Date(order.value.created_at)
  const now = new Date()
  const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24))

  // 计算状态持续时间
  const getStatusDuration = () => {
    let statusStartTime = null

    switch (status) {
      case 'pending':
        statusStartTime = new Date(order.value.created_at)
        break
      case 'processing':
        statusStartTime = order.value.paid_at
          ? new Date(order.value.paid_at)
          : createdDate
        break
      case 'shipped':
        statusStartTime = order.value.shipped_at
          ? new Date(order.value.shipped_at)
          : createdDate
        break
      case 'in_transit':
        statusStartTime = order.value.shipped_at
          ? new Date(order.value.shipped_at)
          : createdDate
        break
      case 'delivered':
        statusStartTime = order.value.delivered_at
          ? new Date(order.value.delivered_at)
          : createdDate
        break
      default:
        statusStartTime = createdDate
    }

    const durationMs = now - statusStartTime
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      return `${Math.floor(hours / 24)}天${hours % 24}小时`
    } else if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    } else {
      return `${minutes}分钟`
    }
  }

  return {
    status,
    statusText: statusConfig.text,
    statusClass: statusConfig.class,
    statusIcon: statusConfig.icon,
    statusColor: statusConfig.color,
    statusDescription: statusConfig.description,
    daysSinceCreated: daysDiff,
    statusDuration: getStatusDuration(),
    isOverdue: status === 'pending' && daysDiff > 7, // 超过7天未支付视为逾期
    estimatedDelivery: status === 'in_transit' ? '预计1-2天内送达' : null,
    canPay: statusConfig.canPay,
    canCancel: statusConfig.canCancel,
    nextAction: getNextAction(status),
  }
})

// 获取下一步操作建议
const getNextAction = status => {
  const actions = {
    pending: '请尽快完成支付',
    processing: '商家正在处理，请耐心等待',
    shipped: '商品已发出，请注意查收',
    in_transit: '商品运输中，即将送达',
    delivered: '订单已完成，感谢您的购买',
    cancelled: '订单已取消',
  }

  return actions[status] || '状态异常，请联系客服'
}

// Helper functions
const formatPrice = price => {
  const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0
  return numPrice.toFixed(2)
}

// 价格计算和格式化
const priceCalculations = computed(() => {
  if (!order.value) return null

  const items = order.value.items || []
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = parseFloat(item.price) || 0
    const itemQuantity = parseInt(item.quantity) || 1
    return sum + itemPrice * itemQuantity
  }, 0)

  const shippingFee = parseFloat(order.value.shipping_fee) || 0
  const discountAmount = parseFloat(order.value.discount_amount) || 0
  const totalAmount = subtotal + shippingFee - discountAmount

  return {
    subtotal,
    shippingFee,
    discountAmount,
    totalAmount,
    hasDiscount: discountAmount > 0,
    hasShippingFee: shippingFee > 0,
    formattedSubtotal: formatPrice(subtotal),
    formattedShippingFee: formatPrice(shippingFee),
    formattedDiscountAmount: formatPrice(discountAmount),
    formattedTotalAmount: formatPrice(totalAmount),
  }
})

const formatDate = date => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 订单状态映射和处理
const orderStatusConfig = {
  pending: {
    text: '待支付',
    class: 'status-pending',
    iconComponent: Clock,
    color: '#f56c6c',
    description: '等待用户支付',
    canPay: true,
    canCancel: true,
  },
  processing: {
    text: '待发货',
    class: 'status-processing',
    iconComponent: Box,
    color: '#e6a23c',
    description: '商家正在准备商品',
    canPay: false,
    canCancel: false,
  },
  shipped: {
    text: '已发货',
    class: 'status-shipped',
    iconComponent: Van,
    color: '#409eff',
    description: '商品已发出，正在配送',
    canPay: false,
    canCancel: false,
  },
  in_transit: {
    text: '运输中',
    class: 'status-transit',
    iconComponent: Location,
    color: '#67c23a',
    description: '商品正在运输途中',
    canPay: false,
    canCancel: false,
  },
  delivered: {
    text: '已完成',
    class: 'status-delivered',
    iconComponent: SuccessFilled,
    color: '#67c23a',
    description: '订单已完成',
    canPay: false,
    canCancel: false,
  },
  cancelled: {
    text: '已取消',
    class: 'status-cancelled',
    iconComponent: CircleCloseFilled,
    color: '#909399',
    description: '订单已取消',
    canPay: false,
    canCancel: false,
  },
}

// const getStatusText = status => {
//   return orderStatusConfig[status]?.text || status || '未知状态'
// }

// const getStatusClass = status => {
//   return orderStatusConfig[status]?.class || 'status-default'
// }

const getStatusInfo = status => {
  return (
    orderStatusConfig[status] || {
      text: status || '未知状态',
      class: 'status-default',
      iconComponent: QuestionFilled,
      color: '#909399',
      description: '状态未知',
      canPay: false,
      canCancel: false,
    }
  )
}

const getPaymentMethod = method => {
  const methodMap = {
    wechat: '微信支付',
    alipay: '支付宝',
    credit_card: '信用卡',
    bank_transfer: '银行转账',
    cash_on_delivery: '货到付款',
  }
  return methodMap[method] || method || '未设置'
}

const getFullAddress = address => {
  if (!address) return '未设置'

  const parts = [
    address.province,
    address.city,
    address.district,
    address.street,
    address.detail,
  ].filter(Boolean)

  return parts.join('')
}

// 地址信息格式化
const addressInfo = computed(() => {
  if (!order.value?.shipping_address) return null

  const addr = order.value.shipping_address
  const fullAddress = getFullAddress(addr)

  return {
    name: addr.name || '收货人',
    phone: addr.phone || '未设置',
    fullAddress,
    province: addr.province || '',
    city: addr.city || '',
    district: addr.district || '',
    street: addr.street || '',
    detail: addr.detail || '',
    postalCode: addr.postal_code || '',
    isComplete: !!(addr.province && addr.city && addr.district && addr.detail),
    displayPhone: addr.phone
      ? addr.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      : '未设置', // 手机号脱敏
  }
})

const getProductIconComponent = category => {
  const icons = {
    水果: Apple,
    蔬菜: Orange,
    肉类: ForkSpoon,
    海鲜: Dish,
    饮品: Coffee,
    零食: Orange,
    其他: Box,
  }
  return icons[category] || Box
}

const handleImageError = event => {
  const img = event.target
  const container = img.parentNode

  // 隐藏图片
  img.style.display = 'none'

  // 创建占位符
  const placeholder = document.createElement('div')
  placeholder.className = 'image-placeholder'
  placeholder.innerHTML = `<svg class="el-icon" style="width: 32px; height: 32px;"><use xlink:href="#icon-box"></use></svg>`
  placeholder.title = '图片加载失败'

  container.appendChild(placeholder)
}

// Action handlers
const handlePayOrder = async () => {
  // 打开支付对话框
  paymentDialogVisible.value = true
}

// 确认支付
const handlePaymentConfirm = async paymentMethod => {
  try {
    loading.value = true

    await orderStore.payOrder(order.value.id, paymentMethod)

    // 如果使用余额支付，刷新用户余额
    if (paymentMethod === 'balance') {
      await userStore.fetchUserBalance()
    }

    ElMessage.success('支付成功！订单状态已更新')

    // 重新加载订单详情
    await loadOrderDetail()
  } catch (error) {
    console.error('支付错误:', error)
    const errorMsg =
      error.response?.data?.message || error.message || '支付失败'

    // 特殊处理余额不足的情况
    if (errorMsg.includes('余额不足')) {
      ElMessage.error('余额不足，请充值或选择其他支付方式')
    } else {
      ElMessage.error(errorMsg)
    }
  } finally {
    loading.value = false
  }
}

// 取消支付
const handlePaymentCancel = () => {
  // 什么也不做，只是关闭对话框
}

const handleReview = () => {
  ElMessageBox.alert('评价功能开发中，敬请期待！', '评价订单', {
    confirmButtonText: '确定',
    type: 'info',
  })
}

const handleTrackOrder = async () => {
  try {
    // 获取物流信息
    const trackingNumber = order.value.tracking_number || `SF${Date.now()}`
    const carrier = order.value.carrier || '顺丰速运'

    // 使用物流store获取数据
    await logisticsStore.fetchLogisticsInfo(
      trackingNumber,
      carrier,
      order.value.id,
      true
    )

    // 显示物流跟踪对话框
    ElMessageBox({
      title: '物流跟踪',
      message: h(LogisticsDialog, {
        orderId: order.value.id,
        trackingNumber: trackingNumber,
        carrier: carrier,
        orderStatus: order.value.status,
        autoRefresh: true,
        refreshInterval: 30000,
        onUpdate: () => {},
        onError: () => {},
      }),
      customClass: 'logistics-dialog',
      showCancelButton: false,
      confirmButtonText: '关闭',
      customStyle: {
        width: '800px',
        borderRadius: '12px',
      },
    })
  } catch {
    ElMessage.error('获取物流信息失败，请重试')
  }
}

const handleBuyAgain = async () => {
  try {
    await orderStore.buyAgain(order.value.id)
    ElMessage.success('商品已添加到购物车！')
    router.push('/cart')
  } catch {
    ElMessage.error('操作失败，请重试')
  }
}

const handleCancelOrder = async () => {
  try {
    await ElMessageBox.confirm('确定要取消这个订单吗？', '取消订单', {
      confirmButtonText: '确定取消',
      cancelButtonText: '不取消',
      type: 'warning',
    })

    await orderStore.cancelOrder(order.value.id)
    ElMessage.success('订单已取消')

    // 重新加载订单详情
    await loadOrderDetail()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('取消订单失败，请重试')
    }
  }
}

// 物流更新事件处理
const handleLogisticsUpdate = () => {
  // 可以在这里更新订单状态或显示通知
}

const handleLogisticsError = () => {
  ElMessage.error('获取物流信息失败')
}

// Load order detail
const loadOrderDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const orderData = await orderStore.fetchOrderById(route.params.id)

    if (orderData) {
      // 数据验证和默认值处理
      // 如果 orderData 包含 order 字段，则使用 order 字段
      const orderInfo = orderData.order || orderData
      order.value = validateAndNormalizeOrderData(orderInfo)
    } else {
      error.value = '订单不存在'
    }
  } catch (err) {
    error.value = err.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 数据验证和标准化处理
const validateAndNormalizeOrderData = orderData => {
  // 确保必要字段存在
  const normalizedOrder = {
    id: orderData.id || null,
    order_number: orderData.order_number || `ORDER_${Date.now()}`,
    status: orderData.status || 'pending',
    created_at: orderData.created_at || new Date().toISOString(),
    updated_at: orderData.updated_at || new Date().toISOString(),
    paid_at: orderData.paid_at || null,
    shipped_at: orderData.shipped_at || null,
    delivered_at: orderData.delivered_at || null,

    // 商品信息
    items: Array.isArray(orderData.items)
      ? orderData.items.map(item => ({
          id: item.id || null,
          product_id: item.product_id || null,
          product_name: item.product_name || '商品名称未知',
          product_image: item.product_image || null,
          category: item.category || '其他',
          specification: item.specification || '标准规格',
          price: parseFloat(item.price) || 0,
          original_price: item.original_price
            ? parseFloat(item.original_price)
            : null,
          quantity: parseInt(item.quantity) || 1,
          subtotal:
            parseFloat(item.subtotal) ||
            (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
        }))
      : [],

    // 价格信息
    subtotal: parseFloat(orderData.subtotal) || 0,
    shipping_fee: parseFloat(orderData.shipping_fee) || 0,
    discount_amount: parseFloat(orderData.discount_amount) || 0,
    total_amount: parseFloat(orderData.total_amount) || 0,

    // 配送信息
    shipping_address: orderData.shipping_address
      ? {
          name: orderData.shipping_address.name || '收货人',
          phone: orderData.shipping_address.phone || '',
          province: orderData.shipping_address.province || '',
          city: orderData.shipping_address.city || '',
          district: orderData.shipping_address.district || '',
          street: orderData.shipping_address.street || '',
          detail: orderData.shipping_address.detail || '',
          postal_code: orderData.shipping_address.postal_code || '',
        }
      : null,

    // 物流信息
    tracking_number: orderData.tracking_number || null,
    carrier: orderData.carrier || null,

    // 支付信息
    payment_method: orderData.payment_method || null,
    payment_transaction_id: orderData.payment_transaction_id || null,

    // 用户信息
    user_id: orderData.user_id || null,
    user_name: orderData.user_name || '用户',

    // 备注信息
    notes: orderData.notes || '',
    remark: orderData.remark || '',
  }

  // 计算总金额（如果后端没有提供）
  if (!orderData.total_amount && normalizedOrder.items.length > 0) {
    const itemsTotal = normalizedOrder.items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    )
    normalizedOrder.subtotal = itemsTotal
    normalizedOrder.total_amount =
      itemsTotal +
      normalizedOrder.shipping_fee -
      normalizedOrder.discount_amount
  }

  return normalizedOrder
}

// Initial load
onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Breadcrumbs */
.breadcrumbs {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fff;
  border-radius: 8px;
  margin-top: 16px;
}

.breadcrumb-link {
  color: #618961;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #4a6d4a;
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #999;
  font-size: 14px;
}

.breadcrumb-current {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

/* Loading State */
.loading-container {
  max-width: 1200px;
  margin: 60px auto;
  padding: 80px 24px;
  text-align: center;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #618961;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #666;
}

/* Error State */
.error-container {
  max-width: 600px;
  margin: 60px auto;
  padding: 60px 24px;
  text-align: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.error-icon {
  color: #f56c6c;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.error-message {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* Empty State */
.empty-container {
  max-width: 600px;
  margin: 60px auto;
  padding: 60px 24px;
  text-align: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  color: #909399;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.empty-message {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* Status Badge Enhancements */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  transition: all 0.3s ease;
}

.status-icon {
  font-size: 18px;
  margin-right: 4px;
}

/* Status Colors */
.status-pending {
  background-color: #f56c6c !important;
}

.status-processing {
  background-color: #e6a23c !important;
}

.status-shipped {
  background-color: #409eff !important;
}

.status-transit {
  background-color: #67c23a !important;
}

.status-delivered {
  background-color: #67c23a !important;
}

.status-cancelled {
  background-color: #909399 !important;
}

.status-default {
  background-color: #909399 !important;
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Order Header */
.order-header {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.order-info {
  flex: 1;
}

.order-number {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.order-status {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-processing {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-shipped {
  background-color: #d4edda;
  color: #155724;
}

.status-transit {
  background-color: #cce5ff;
  color: #004085;
}

.status-delivered {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.order-date {
  font-size: 14px;
  color: #666;
}

.order-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Section Title */
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

/* Order Progress */
.order-progress {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.progress-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 横屏布局 */
@media (min-width: 1024px) {
  .progress-timeline {
    flex-direction: row;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 0;
  }

  .progress-timeline::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #e5e5e5;
    z-index: 0;
  }

  .timeline-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    flex: 1;
    padding: 0;
    margin-bottom: 0;
  }

  .timeline-icon {
    position: relative;
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
    z-index: 1;
  }

  .timeline-content {
    flex: 1;
    width: 100%;
  }

  .timeline-status {
    font-size: 14px;
    margin-bottom: 4px;
  }

  .timeline-date {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .timeline-description {
    font-size: 11px;
    line-height: 1.3;
  }
}

/* 竖屏布局 */
@media (max-width: 1023px) {
  .progress-timeline::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #e5e5e5;
  }

  .timeline-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    margin-bottom: 32px;
    padding-left: 60px;
  }

  .timeline-item:last-child {
    margin-bottom: 0;
  }

  .timeline-icon {
    position: absolute;
    left: 0;
    top: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 2px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  transition: all 0.3s ease;
}

.icon-circle .el-icon {
  font-size: 20px;
}

.timeline-item.completed .icon-circle {
  border-color: #28a745;
  background-color: #28a745;
  color: #ffffff;
}

.timeline-item.current .icon-circle {
  border-color: #007bff;
  background-color: #007bff;
  color: #ffffff;
  animation: pulse 2s infinite;
}

.timeline-item.active .icon-circle {
  border-color: #ffc107;
  background-color: #ffc107;
  color: #000000;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.timeline-content {
  flex: 1;
}

.timeline-status {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.timeline-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.timeline-description {
  font-size: 13px;
  color: #888;
  line-height: 1.4;
}

/* Order Items */
.order-items {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  gap: 20px;
  align-items: center;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.order-item:hover {
  border-color: #618961;
  box-shadow: 0 2px 8px rgba(97, 137, 97, 0.1);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;
  background: #f5f5f5;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.item-spec {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-price {
  font-size: 16px;
  font-weight: 600;
  color: #e74c3c;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.item-quantity,
.item-total {
  text-align: center;
}

.quantity-label,
.total-label {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 4px;
}

.quantity-value,
.total-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

/* Order Summary */
.order-summary {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.summary-row.discount {
  color: #28a745;
}

.summary-row.total {
  border-top: 2px solid #f0f0f0;
  padding-top: 16px;
  margin-top: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #e74c3c;
}

.summary-label {
  font-size: 14px;
  color: #666;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

/* Delivery Info */
.delivery-info {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.delivery-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.delivery-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.delivery-label {
  font-size: 14px;
  color: #666;
  min-width: 100px;
}

.delivery-value {
  font-size: 14px;
  color: #1a1a1a;
  flex: 1;
}

/* Logistics Info */
.logistics-info {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Payment Info */
.payment-info {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.payment-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.payment-label {
  font-size: 14px;
  color: #666;
  min-width: 100px;
}

.payment-value {
  font-size: 14px;
  color: #1a1a1a;
  flex: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }

  .order-number {
    font-size: 24px;
  }

  .order-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .order-item {
    grid-template-columns: 60px 1fr;
    grid-template-rows: auto auto;
    gap: 12px;
  }

  .item-quantity,
  .item-total {
    grid-column: 1 / -1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }

  .order-actions .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .breadcrumbs {
    padding: 16px;
    margin-top: 8px;
  }

  .order-progress,
  .order-items,
  .order-summary,
  .delivery-info,
  .payment-info {
    padding: 20px;
  }

  .timeline-item {
    padding-left: 50px;
  }

  .timeline-icon {
    width: 30px;
    height: 30px;
  }

  .icon-circle {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }

  .progress-timeline::before {
    left: 15px;
  }
}
</style>
