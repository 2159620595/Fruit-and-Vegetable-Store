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
          <div class="order-number-container">
            <h1 class="order-number">订单号：{{ order.order_number }}</h1>
            <div class="order-number-actions">
              <el-button
                text
                @click="copyOrderNumber"
                :icon="CopyDocument"
                title="复制订单号"
              >
                复制
              </el-button>
              <el-button
                text
                @click="shareOrder"
                :icon="Share"
                title="分享订单"
              >
                分享
              </el-button>
            </div>
          </div>
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
            <!-- 待支付倒计时 -->
            <span
              v-if="order.status === 'pending' && countdown > 0"
              class="countdown-badge"
            >
              <el-icon :size="14"><Timer /></el-icon>
              {{ countdownText }}后自动取消
            </span>
          </div>
        </div>
        <div class="order-actions">
          <!-- 立即支付 -->
          <el-button
            v-if="orderStatusInfo?.canPay"
            type="primary"
            @click="handlePayOrder"
            :icon="Wallet"
          >
            立即支付
          </el-button>

          <!-- 确认收货 -->
          <el-button
            v-if="['shipped', 'in_transit'].includes(order.status)"
            type="success"
            @click="handleConfirmReceipt"
            :icon="SuccessFilled"
          >
            确认收货
          </el-button>

          <!-- 申请售后 -->
          <el-button
            v-if="
              ['delivered', 'completed'].includes(order.status) &&
              canApplyAfterSale
            "
            type="warning"
            plain
            @click="handleAfterSale"
            :icon="QuestionFilled"
          >
            申请售后
          </el-button>

          <!-- 评价订单 / 查看评价 -->
          <template v-if="['delivered', 'completed'].includes(order.status)">
            <el-button
              v-if="!order.is_reviewed"
              type="success"
              plain
              @click="handleReview"
              :icon="Edit"
            >
              评价订单
            </el-button>
            <el-button
              v-else
              type="info"
              plain
              @click="handleViewReview"
              :icon="View"
            >
              查看我的评价
            </el-button>
          </template>

          <!-- 查看物流 -->
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

          <!-- 联系客服 -->
          <el-button plain @click="handleContactService" :icon="ChatDotRound">
            联系客服
          </el-button>

          <!-- 再次购买 -->
          <el-button
            v-if="['delivered', 'completed'].includes(order.status)"
            plain
            @click="handleBuyAgain"
            :icon="ShoppingCart"
          >
            再次购买
          </el-button>

          <!-- 取消订单 -->
          <el-button
            v-if="orderStatusInfo?.canCancel"
            type="danger"
            @click="handleCancelOrder"
            :icon="Close"
          >
            取消订单
          </el-button>

          <!-- 删除订单 -->
          <el-button
            v-if="['completed', 'cancelled'].includes(order.status)"
            type="danger"
            plain
            @click="handleDeleteOrder"
            :icon="Delete"
          >
            删除订单
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
        <h2 class="section-title">
          <el-icon :size="20" style="vertical-align: middle; margin-right: 8px">
            <Document />
          </el-icon>
          订单汇总
        </h2>
        <div class="summary-content">
          <!-- 价格信息 -->
          <div class="summary-row">
            <span class="summary-label">
              <el-icon :size="16"><ShoppingBag /></el-icon>
              商品总价
            </span>
            <span class="summary-value">
              ¥{{ priceCalculations?.formattedSubtotal || '0.00' }}
            </span>
          </div>
          <div v-if="priceCalculations?.hasShippingFee" class="summary-row">
            <span class="summary-label">
              <el-icon :size="16"><Van /></el-icon>
              运费
            </span>
            <span class="summary-value">
              ¥{{ priceCalculations.formattedShippingFee }}
            </span>
          </div>
          <div
            v-if="priceCalculations?.hasDiscount"
            class="summary-row discount"
          >
            <span class="summary-label">
              <el-icon :size="16"><Discount /></el-icon>
              优惠
            </span>
            <span class="summary-value">
              -¥{{ priceCalculations.formattedDiscountAmount }}
            </span>
          </div>
          <div class="summary-row total">
            <span class="summary-label">
              <el-icon :size="18"><Wallet /></el-icon>
              实付金额
            </span>
            <span class="summary-value">
              ¥{{ priceCalculations?.formattedTotalAmount || '0.00' }}
            </span>
          </div>

          <!-- 分隔线 -->
          <div class="summary-divider">
            <span class="divider-text">支付信息</span>
          </div>

          <!-- 支付和配送信息 -->
          <div class="summary-row info-row">
            <span class="summary-label">
              <el-icon :size="16"><Location /></el-icon>
              配送方式
            </span>
            <span class="summary-value">
              {{ getDeliveryMethod(order.delivery_method) }}
            </span>
          </div>
          <div class="summary-row info-row">
            <span class="summary-label">
              <el-icon :size="16"><CreditCard /></el-icon>
              支付方式
            </span>
            <span class="summary-value">
              {{ getPaymentMethod(order.payment_method) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Order Timeline -->
      <div v-if="orderTimelineInfo.length > 0" class="order-timeline-info">
        <h2 class="section-title">
          <el-icon :size="20" style="vertical-align: middle; margin-right: 8px">
            <Clock />
          </el-icon>
          订单时间记录
        </h2>
        <div class="timeline-content">
          <div
            v-for="(time, index) in orderTimelineInfo"
            :key="index"
            class="timeline-row"
          >
            <span class="timeline-label">
              <el-icon :size="16">
                <component :is="time.icon" />
              </el-icon>
              {{ time.label }}
            </span>
            <span class="timeline-value">{{ time.value }}</span>
          </div>
        </div>
      </div>

      <!-- Delivery Information -->
      <div class="delivery-info">
        <h2 class="section-title">
          <el-icon :size="20" style="vertical-align: middle; margin-right: 8px">
            <Location />
          </el-icon>
          配送信息
        </h2>
        <div class="delivery-content">
          <div class="delivery-row">
            <span class="delivery-label">
              <el-icon :size="16"><User /></el-icon>
              收货人
            </span>
            <span class="delivery-value">
              {{ addressInfo?.name || '未设置' }}
            </span>
          </div>
          <div class="delivery-row">
            <span class="delivery-label">
              <el-icon :size="16"><Phone /></el-icon>
              联系电话
            </span>
            <span class="delivery-value">
              {{ addressInfo?.displayPhone || '未设置' }}
            </span>
          </div>
          <div class="delivery-row address-row">
            <span class="delivery-label">
              <el-icon :size="16"><MapLocation /></el-icon>
              收货地址
            </span>
            <span class="delivery-value">
              {{ addressInfo?.fullAddress || '未设置' }}
            </span>
          </div>
          <div v-if="order.tracking_number" class="delivery-row tracking-row">
            <span class="delivery-label">
              <el-icon :size="16"><Postcard /></el-icon>
              快递单号
            </span>
            <span class="delivery-value tracking-number">
              {{ order.tracking_number }}
            </span>
          </div>
          <div v-if="order.carrier" class="delivery-row carrier-row">
            <span class="delivery-label">
              <el-icon :size="16"><Van /></el-icon>
              快递公司
            </span>
            <span class="delivery-value">{{ order.carrier }}</span>
          </div>
        </div>
      </div>

      <!-- Order Remark -->
      <div v-if="order.remark" class="order-remark">
        <h2 class="section-title">订单备注</h2>
        <div class="remark-content">
          <p class="remark-text">{{ order.remark }}</p>
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

    <!-- 评价对话框 -->
    <OrderReviewDialog
      v-model="reviewDialogVisible"
      :order="order"
      @submit="handleReviewSubmit"
    />

    <!-- 查看评价对话框 -->
    <ReviewDetailDialog
      v-model="reviewDetailDialogVisible"
      :order="currentReviewData"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
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
  View,
  ShoppingCart,
  Close,
  Checked,
  Apple,
  Orange,
  ForkSpoon,
  Coffee,
  Dish,
  Document,
  ShoppingBag,
  Discount,
  CreditCard,
  User,
  Phone,
  MapLocation,
  Postcard,
  Delete,
  ChatDotRound,
  CopyDocument,
  Share,
  Timer,
  CircleCheck,
} from '@element-plus/icons-vue'
import { useOrderStore } from '@/stores/orderStore'
import { useUserStore } from '@/stores/userStore'
import { useLogisticsStore } from '@/stores/logisticsStore'
import LogisticsDialog from '@/components/LogisticsDialog.vue'
import PaymentDialog from '@/components/PaymentDialog.vue'
import OrderReviewDialog from '@/components/OrderReviewDialog.vue'
import ReviewDetailDialog from '@/components/ReviewDetailDialog.vue'
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

// 评价对话框状态
const reviewDialogVisible = ref(false)
const reviewDetailDialogVisible = ref(false)
const currentReviewData = ref(null)

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

const getDeliveryMethod = method => {
  const methodMap = {
    standard: '标准配送',
    express: '快速配送',
  }
  return methodMap[method] || method || '未设置'
}

const getPaymentMethod = method => {
  const methodMap = {
    wechat: '微信支付',
    alipay: '支付宝',
    credit_card: '信用卡',
    balance: '余额支付',
    bank_transfer: '银行转账',
    cash_on_delivery: '货到付款',
  }
  return methodMap[method] || method || '未设置'
}

const getFullAddress = address => {
  if (!address) return '未设置'

  // 如果有完整的 region + address 字段（新格式）
  if (address.region || address.address) {
    const parts = [
      address.region, // 省市区
      address.address, // 详细地址
    ].filter(Boolean)
    return parts.length > 0 ? parts.join('') : '未设置'
  }

  // 如果是分开的字段（旧格式）
  const parts = [
    address.province,
    address.city,
    address.district || address.area,
    address.street,
    address.detail,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join('') : '未设置'
}

// 地址信息格式化
const addressInfo = computed(() => {
  if (!order.value?.shipping_address) return null

  const addr = order.value.shipping_address

  const fullAddress = getFullAddress(addr)

  return {
    name: addr.name || addr.receiver || addr.recipient_name || '收货人',
    phone: addr.phone || addr.mobile || '未设置',
    fullAddress,
    region: addr.region || '',
    address: addr.address || addr.detailed_address || '',
    province: addr.province || '',
    city: addr.city || '',
    district: addr.district || addr.area || '',
    street: addr.street || '',
    detail: addr.detail || '',
    postalCode: addr.postal_code || addr.postalCode || '',
    isComplete: !!(
      (addr.region && addr.address) ||
      (addr.province && addr.city && addr.detail)
    ),
    displayPhone:
      addr.phone || addr.mobile
        ? (addr.phone || addr.mobile).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        : '未设置', // 手机号脱敏
  }
})

// 订单时间记录
const orderTimelineInfo = computed(() => {
  if (!order.value) return []

  const timeline = []

  // 创建时间
  if (order.value.created_at) {
    timeline.push({
      label: '下单时间',
      value: formatDate(order.value.created_at),
      icon: Clock,
    })
  }

  // 支付时间
  if (order.value.paid_at) {
    timeline.push({
      label: '支付时间',
      value: formatDate(order.value.paid_at),
      icon: Wallet,
    })
  }

  // 发货时间
  if (order.value.shipped_at) {
    timeline.push({
      label: '发货时间',
      value: formatDate(order.value.shipped_at),
      icon: Van,
    })
  }

  // 完成时间
  if (order.value.delivered_at || order.value.completed_at) {
    timeline.push({
      label: '完成时间',
      value: formatDate(order.value.delivered_at || order.value.completed_at),
      icon: CircleCheck,
    })
  }

  // 取消时间
  if (order.value.status === 'cancelled' && order.value.cancelled_at) {
    timeline.push({
      label: '取消时间',
      value: formatDate(order.value.cancelled_at),
      icon: Close,
    })
  }

  return timeline
})

// 是否可以申请售后（7天内）
const canApplyAfterSale = computed(() => {
  if (!order.value) return false

  const deliveredTime = order.value.delivered_at || order.value.completed_at
  if (!deliveredTime) return false

  const now = new Date()
  const deliveredDate = new Date(deliveredTime)
  const daysDiff = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24))

  return daysDiff <= 7 // 7天内可以申请售后
})

// 待支付订单倒计时（30分钟自动取消）
const countdown = ref(0)
const countdownTimer = ref(null)

const countdownText = computed(() => {
  if (countdown.value <= 0) return ''

  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// 启动倒计时
const startCountdown = () => {
  if (order.value?.status !== 'pending' || !order.value?.created_at) return

  const createdAt = new Date(order.value.created_at)
  const expireAt = new Date(createdAt.getTime() + 30 * 60 * 1000) // 30分钟后
  const now = new Date()

  countdown.value = Math.max(0, Math.floor((expireAt - now) / 1000))

  if (countdown.value > 0) {
    countdownTimer.value = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer.value)
        // 倒计时结束，刷新订单状态
        loadOrderDetail()
      }
    }, 1000)
  }
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

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

// 评价订单
const handleReview = () => {
  if (!order.value) {
    ElMessage.error('订单信息不存在')
    return
  }

  // 检查订单状态
  if (
    order.value.status !== 'delivered' &&
    order.value.status !== 'completed'
  ) {
    ElMessage.warning('只有已送达或已完成的订单可以评价')
    return
  }

  // 打开评价对话框
  reviewDialogVisible.value = true
}

// 处理评价提交
const handleReviewSubmit = async reviewData => {
  try {
    const loadingMsg = ElMessage({
      message: '正在提交评价...',
      type: 'info',
      duration: 0,
      icon: 'Loading',
    })

    // 调用评价API
    const result = await orderStore.reviewOrder(order.value.id, reviewData)

    loadingMsg.close()

    // 检查是否是已评价的情况
    if (result && result.alreadyReviewed) {
      ElMessage.warning({
        message: '您已评价过此商品',
        duration: 3000,
        showClose: true,
      })
    } else {
      ElMessage.success({
        message: '评价提交成功！感谢您的反馈',
        duration: 3000,
        showClose: true,
      })
    }

    // 关闭对话框
    reviewDialogVisible.value = false

    // 刷新订单详情
    await loadOrderDetail()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ 评价失败:', error)
    const errorMsg =
      error.response?.data?.message || error.message || '评价提交失败，请重试'
    ElMessage.error(errorMsg)
  }
}

// 查看评价
const handleViewReview = () => {
  if (!order.value) {
    ElMessage.error('订单信息不存在')
    return
  }

  if (!order.value.is_reviewed) {
    ElMessage.warning('该订单还未评价')
    return
  }

  // 设置当前评价数据并打开对话框
  currentReviewData.value = order.value
  reviewDetailDialogVisible.value = true
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

// 确认收货
const handleConfirmReceipt = async () => {
  try {
    await ElMessageBox.confirm(
      '确认已经收到商品了吗？确认后订单将完成。',
      '确认收货',
      {
        confirmButtonText: '确认收货',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    await orderStore.confirmOrder(order.value.id)
    ElMessage.success('确认收货成功！')

    // 重新加载订单详情
    await loadOrderDetail()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('确认收货失败，请重试')
    }
  }
}

// 删除订单
const handleDeleteOrder = async () => {
  try {
    await ElMessageBox.confirm(
      '删除后订单将无法恢复，确定要删除吗？',
      '删除订单',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      }
    )

    await orderStore.deleteOrder(order.value.id)
    ElMessage.success('订单已删除')

    // 返回订单列表
    router.push('/orders')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('删除订单失败，请重试')
    }
  }
}

// 申请售后
const handleAfterSale = () => {
  ElMessageBox.alert('售后功能正在开发中，如需帮助请联系客服。', '申请售后', {
    confirmButtonText: '联系客服',
    callback: action => {
      if (action === 'confirm') {
        handleContactService()
      }
    },
  })
}

// 联系客服
const handleContactService = () => {
  ElMessageBox.alert(
    '客服热线：400-123-4567\n在线客服：周一至周日 9:00-22:00\n或添加微信客服：FreshHarvest_Service',
    '联系客服',
    {
      confirmButtonText: '好的',
      dangerouslyUseHTMLString: false,
    }
  )
}

// 复制订单号
const copyOrderNumber = async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(order.value.order_number)
      ElMessage.success('订单号已复制到剪贴板')
    } else {
      // 降级方案：使用传统的 document.execCommand 方法
      const textArea = document.createElement('textarea')
      textArea.value = order.value.order_number
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        ElMessage.success('订单号已复制到剪贴板')
      } catch {
        ElMessage.error('复制失败，请手动复制')
      }
      document.body.removeChild(textArea)
    }
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 分享订单
const shareOrder = () => {
  ElMessage.success('分享成功')
}

// Load order detail
const loadOrderDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const orderData = await orderStore.fetchOrderById(route.params.id)

    if (orderData) {
      // 数据验证和默认值处理
      // 后端返回格式: { order: {...}, items: [...], status_history: [...] }
      // orderStore 已经解析了 shipping_address JSON 字符串
      const orderInfo = orderData.order || orderData

      // 如果后端返回了独立的 items 字段，将其合并到 orderInfo
      if (orderData.items && Array.isArray(orderData.items)) {
        orderInfo.items = orderData.items
      }

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

    // 配送信息（保留原始数据，支持新旧两种格式）
    shipping_address: orderData.shipping_address || null,

    // 物流信息
    tracking_number: orderData.tracking_number || null,
    carrier: orderData.carrier || null,

    // 配送方式
    delivery_method: orderData.delivery_method || 'standard',

    // 支付信息
    payment_method: orderData.payment_method || null,
    payment_transaction_id: orderData.payment_transaction_id || null,

    // 用户信息
    user_id: orderData.user_id || null,
    user_name: orderData.user_name || '用户',

    // 评价状态
    is_reviewed: orderData.is_reviewed || false,

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
onMounted(async () => {
  await loadOrderDetail()
  startCountdown()
})

onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
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
  background-color: var(--bg-secondary);
  border-radius: 8px;
  margin-top: 16px;
}

.breadcrumb-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.breadcrumb-separator {
  color: var(--text-light);
  font-size: 14px;
}

.breadcrumb-current {
  color: var(--text-color);
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
  border-top: 4px solid var(--primary-color);
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
  color: var(--text-secondary);
}

/* Error State */
.error-container {
  max-width: 600px;
  margin: 60px auto;
  padding: 60px 24px;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.error-icon {
  color: var(--error-color);
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 12px 0;
}

.error-message {
  font-size: 16px;
  color: var(--text-secondary);
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
  background: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  color: var(--text-light);
  margin-bottom: 20px;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 12px 0;
}

.empty-message {
  font-size: 16px;
  color: var(--text-secondary);
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
  transition: all 0.3s ease;
}

.status-icon {
  font-size: 18px;
  margin-right: 4px;
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
  background: var(--bg-secondary);
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

.order-number-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.order-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}

.order-number-actions {
  display: flex;
  gap: 8px;
}

.order-status {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.countdown-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: var(--text-inverse);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid transparent;
}

/* 待支付 - 橙红色 */
.status-pending {
  background-color: rgba(255, 149, 0, 0.2);
  color: #ffb84d;
  border-color: rgba(255, 149, 0, 0.5);
  font-weight: 700;
}

/* 待发货 - 橙色 */
.status-processing {
  background-color: rgba(250, 173, 20, 0.2);
  color: #ffc53d;
  border-color: rgba(250, 173, 20, 0.5);
  font-weight: 700;
}

/* 已发货 - 绿色 */
.status-shipped {
  background-color: rgba(82, 196, 26, 0.2);
  color: #73d13d;
  border-color: rgba(82, 196, 26, 0.5);
  font-weight: 700;
}

/* 运输中 - 蓝色 */
.status-transit {
  background-color: rgba(24, 144, 255, 0.2);
  color: #40a9ff;
  border-color: rgba(24, 144, 255, 0.5);
  font-weight: 700;
}

/* 已送达 - 深绿色 */
.status-delivered {
  background-color: rgba(82, 196, 26, 0.2);
  color: #95de64;
  border-color: rgba(82, 196, 26, 0.5);
  font-weight: 700;
}

/* 已取消 - 灰色 */
.status-cancelled {
  background-color: rgba(144, 147, 153, 0.2);
  color: #bfbfbf;
  border-color: rgba(144, 147, 153, 0.5);
  font-weight: 700;
}

/* 已完成 - 主题绿色 */
.status-completed {
  background-color: rgba(74, 129, 87, 0.2);
  color: #6aaa77;
  border-color: rgba(74, 129, 87, 0.5);
  font-weight: 700;
}

.order-date {
  font-size: 14px;
  color: var(--text-secondary);
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
  color: var(--text-color);
  margin: 0 0 20px 0;
}

/* Order Progress */
.order-progress {
  background: var(--bg-secondary);
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
    background-color: var(--border-light);
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
    background-color: var(--border-light);
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
  background-color: var(--bg-card);
  border: 2px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary) 666;
  transition: all 0.3s ease;
}

.icon-circle .el-icon {
  font-size: 20px;
}

.timeline-item.completed .icon-circle {
  border-color: var(--success-color);
  background-color: var(--success-color);
  color: var(--bg-card);
}

.timeline-item.current .icon-circle {
  border-color: var(--info-color);
  background-color: var(--info-color);
  color: var(--bg-card);
  animation: pulse 2s infinite;
}

.timeline-item.active .icon-circle {
  border-color: var(--gold-color);
  background-color: var(--gold-color);
  color: var(--text-inverse);
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
  color: var(--text-color);
  margin-bottom: 4px;
}

.timeline-date {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.timeline-description {
  font-size: 13px;
  color: var(--text-light);
  line-height: 1.4;
}

/* Order Items */
.order-items {
  background: var(--bg-secondary);
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
  border: 1px solid var(--border-light);
  border-radius: 8px;
  transition: all 0.2s;
}

.order-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(97, 137, 97, 0.1);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-tertiary);
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
  color: var(--text-light);
  background: var(--bg-input);
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.item-spec {
  font-size: 14px;
  color: var(--text-secondary);
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
  color: var(--error-color);
}

.original-price {
  font-size: 14px;
  color: var(--text-light);
  text-decoration: line-through;
}

.item-quantity,
.item-total {
  text-align: center;
}

.quantity-label,
.total-label {
  font-size: 12px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 4px;
}

.quantity-value,
.total-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

/* Order Summary */
.order-summary {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.summary-row:hover {
  background-color: var(--bg-tertiary);
}

.summary-row.discount {
  background-color: rgba(82, 196, 26, 0.1);
}

.summary-row.discount .summary-label,
.summary-row.discount .summary-value {
  color: var(--success-color);
}

.summary-row.total {
  background: rgba(245, 34, 45, 0.05);
  border: 2px solid rgba(245, 34, 45, 0.2);
  padding: 10px 12px;
  margin-top: 8px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 8px;
}

.summary-row.total .summary-label {
  color: var(--text-color);
  font-weight: 700;
}

.summary-row.total .summary-value {
  color: var(--error-color);
  font-size: 20px;
}

.summary-row.info-row {
  background-color: var(--bg-input);
  border-left: 3px solid var(--primary-color);
}

.summary-divider {
  position: relative;
  height: 1px;
  background: linear-gradient(to right, #e5e7eb 0%, #9ca3af 50%, #e5e7eb 100%);
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.divider-text {
  position: absolute;
  background: var(--bg-card);
  padding: 0 12px;
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 1px;
}

.summary-label {
  font-size: 14px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.summary-label .el-icon {
  color: var(--primary-color);
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

/* Order Timeline Info */
.order-timeline-info {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-input);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.timeline-row:hover {
  background: var(--bg-tertiary);
  transform: translateX(4px);
}

.timeline-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color);
}

.timeline-value {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 400;
}

/* Delivery Info */
.delivery-info {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.delivery-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.delivery-row {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  background-color: var(--bg-input);
  border-left: 3px solid transparent;
}

.delivery-row:hover {
  background-color: var(--bg-tertiary);
  border-left-color: var(--primary-color);
  transform: translateX(2px);
}

.delivery-row.address-row {
  background: rgba(250, 173, 20, 0.1);
  border-left-color: var(--warning-color);
  padding: 12px;
}

.delivery-row.address-row:hover {
  background: rgba(250, 173, 20, 0.15);
}

.delivery-row.tracking-row {
  background-color: rgba(139, 92, 246, 0.1);
  border-left-color: rgba(139, 92, 246, 0.8);
}

.delivery-row.tracking-row:hover {
  background-color: rgba(139, 92, 246, 0.15);
}

.delivery-row.carrier-row {
  background-color: rgba(24, 144, 255, 0.1);
  border-left-color: var(--info-color);
}

.delivery-row.carrier-row:hover {
  background-color: rgba(24, 144, 255, 0.15);
}

.delivery-label {
  font-size: 14px;
  color: var(--text-secondary);
  min-width: 100px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.delivery-label .el-icon {
  color: var(--primary-color);
}

.delivery-value {
  font-size: 14px;
  color: var(--text-color);
  flex: 1;
  font-weight: 500;
}

.tracking-number {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--info-color);
  letter-spacing: 1px;
}

/* Order Remark */
.order-remark {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.remark-content {
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.remark-text {
  font-size: 14px;
  color: var(--text-color);
  line-height: 1.6;
  margin: 0;
  word-wrap: break-word;
  white-space: pre-wrap;
}

/* Responsive Design */
@media (max-width: 768px) {
  .order-detail-page {
    padding: 16px;
  }

  .main-content {
    padding: 16px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    gap: 12px;
  }

  .order-number {
    font-size: 22px;
  }

  .order-date,
  .order-status {
    font-size: 13px;
  }

  .order-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 8px;
  }

  .order-actions .el-button {
    flex: 1;
    min-width: 120px;
  }

  .order-progress,
  .order-items,
  .order-summary,
  .delivery-info,
  .payment-info {
    padding: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .order-item {
    grid-template-columns: 80px 1fr;
    gap: 12px;
  }

  .item-image {
    width: 80px;
    height: 80px;
  }

  .item-name {
    font-size: 14px;
  }

  .item-price {
    font-size: 14px;
  }

  .timeline-item {
    padding-left: 60px;
  }

  .timeline-icon {
    width: 36px;
    height: 36px;
  }

  .icon-circle {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .summary-row {
    font-size: 14px;
  }

  .summary-total {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .order-detail-page {
    padding: 12px;
  }

  .main-content {
    padding: 12px;
  }

  .order-header {
    padding: 12px;
  }

  .order-number {
    font-size: 18px;
  }

  .order-date,
  .order-status {
    font-size: 12px;
  }

  .order-actions {
    flex-direction: column;
  }

  .order-actions .el-button {
    width: 100%;
    min-width: auto;
  }

  .order-progress,
  .order-items,
  .order-summary,
  .delivery-info,
  .payment-info {
    padding: 12px;
  }

  .section-title {
    font-size: 16px;
  }

  .order-item {
    grid-template-columns: 60px 1fr;
    gap: 10px;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }

  .item-name {
    font-size: 13px;
  }

  .item-price {
    font-size: 13px;
  }

  .item-quantity,
  .item-total {
    font-size: 12px;
  }

  .timeline-item {
    padding-left: 45px;
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

  .timeline-time {
    font-size: 12px;
  }

  .timeline-title {
    font-size: 14px;
  }

  .timeline-description {
    font-size: 12px;
  }

  .summary-row {
    font-size: 13px;
  }

  .summary-total {
    font-size: 18px;
  }

  .info-row {
    font-size: 13px;
  }
}
</style>
