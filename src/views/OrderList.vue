<template>
  <div class="order-list-page">
    <div class="container">
      <!-- 面包屑导航 -->
      <Breadcrumb current-page="我的订单" />

      <div class="page-header">
        <h1 class="page-title">我的订单</h1>
        <div class="header-actions">
          <!-- 🆕 搜索框（支持模糊搜索和拼音搜索） -->
          <el-input
            v-model="searchKeyword"
            placeholder="搜索订单号/商品名称/收货人（支持拼音）"
            class="search-input"
            clearable
            @clear="handleSearchClear"
            @keyup.enter="handleSearch"
            @input="handleSearchInput"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button
                :icon="Search"
                @click="handleSearch"
                :loading="loading"
              />
            </template>
          </el-input>
          <el-text
            v-if="searchKeyword && !isSearching"
            type="info"
            size="small"
            style="margin-left: 8px"
          >
            {{ searchTipText }}
          </el-text>
          <el-button
            type="primary"
            :icon="loading ? 'Loading' : 'Refresh'"
            :loading="loading"
            @click="refreshOrders"
          >
            刷新
          </el-button>
        </div>
      </div>

      <!-- 订单状态筛选标签 -->
      <div class="order-tabs">
        <el-tabs
          v-model="activeTab"
          @tab-change="handleTabChange"
          :before-leave="beforeTabLeave"
        >
          <el-tab-pane label="全部订单" name="all">
            <template #label>
              <span class="tab-label">
                全部订单
                <el-badge
                  :value="allOrdersCount || 0"
                  :max="99"
                  class="tab-badge"
                />
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="待支付" name="pending">
            <template #label>
              <span class="tab-label">
                待支付
                <el-badge
                  :value="orderCounts.to_pay || 0"
                  :max="99"
                  class="tab-badge"
                />
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="待发货" name="processing">
            <template #label>
              <span class="tab-label">
                待发货
                <el-badge
                  :value="orderCounts.to_ship || 0"
                  :max="99"
                  class="tab-badge"
                />
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="已发货" name="shipped">
            <template #label>
              <span class="tab-label">
                已发货
                <el-badge
                  :value="orderCounts.shipped || 0"
                  :max="99"
                  class="tab-badge"
                />
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="运输中" name="in_transit">
            <template #label>
              <span class="tab-label">
                运输中
                <el-badge
                  :value="orderCounts.in_transit || 0"
                  :max="99"
                  class="tab-badge"
                />
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="已完成" name="delivered">
            <template #label>
              <span class="tab-label">
                已完成
                <el-badge
                  :value="orderCounts.to_review || 0"
                  :max="99"
                  class="tab-badge"
                />
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="已取消" name="cancelled">
            <template #label>
              <span class="tab-label">
                已取消
                <el-badge
                  :value="orderCounts.cancelled || 0"
                  :max="99"
                  class="tab-badge"
                />
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="filteredOrders.length === 0"
        :description="getEmptyDescription()"
        :image-size="120"
      >
        <template v-if="activeTab === 'all'">
          <el-button type="primary" @click="goToShop">去购物</el-button>
        </template>
        <template v-else>
          <el-space>
            <el-button @click="activeTab = 'all'">查看全部订单</el-button>
            <el-button type="primary" @click="goToShop">去购物</el-button>
          </el-space>
        </template>
      </el-empty>

      <!-- 订单列表 -->
      <div
        v-if="filteredOrders.length > 0"
        class="order-list"
        :key="forceUpdateKey"
      >
        <transition-group name="order-list" tag="div" :key="activeTab">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="order-card"
          >
            <!-- 订单头部 -->
            <div class="order-header">
              <div class="order-info">
                <span class="order-number">
                  订单号: {{ order.order_number }}
                </span>
                <span class="order-date">
                  {{ formatDate(order.created_at) }}
                </span>
              </div>
              <el-tag
                :type="getStatusType(order.status)"
                effect="light"
                size="large"
              >
                {{ getStatusText(order.status) }}
              </el-tag>
            </div>

            <!-- 订单商品列表 -->
            <div class="order-items" @click="goToOrderDetail(order.id)">
              <div class="order-products">
                <!-- 商品图片展示 -->
                <div
                  class="order-product-images"
                  v-if="getOrderItems(order).length > 0"
                >
                  <div class="product-images-container">
                    <div
                      v-for="(item, index) in getOrderItems(order).slice(0, 4)"
                      :key="item.id || index"
                      class="product-image-item"
                    >
                      <img
                        v-if="item.product_image"
                        :src="item.product_image"
                        :alt="item.product_name || '商品图片'"
                        class="product-image"
                        @error="handleImageError"
                      />
                      <div v-else class="product-image-placeholder">🍎</div>
                    </div>
                    <!-- 显示更多商品数量 -->
                    <div
                      v-if="getOrderItems(order).length > 4"
                      class="product-image-more"
                    >
                      <span class="more-count">
                        +{{ getOrderItems(order).length - 4 }}
                      </span>
                    </div>
                  </div>
                  <div
                    class="product-names"
                    v-if="getOrderItems(order).length > 0"
                  >
                    <span class="product-names-text">
                      {{
                        getOrderItems(order)
                          .slice(0, 2)
                          .map(item => item.product_name)
                          .join('、')
                      }}
                      <span v-if="getOrderItems(order).length > 2">
                        等{{ getOrderItems(order).length }}件商品
                      </span>
                    </span>
                  </div>
                </div>

                <!-- 订单摘要信息 -->
                <div class="order-summary">
                  <div class="summary-item">
                    <span class="label">配送方式:</span>
                    <span class="value">
                      {{ getDeliveryMethodText(order.delivery_method) }}
                    </span>
                  </div>
                  <div class="summary-item">
                    <span class="label">支付方式:</span>
                    <span class="value">
                      {{ getPaymentMethodText(order.payment_method) }}
                    </span>
                  </div>
                  <div class="summary-item" v-if="order.remark">
                    <span class="label">备注:</span>
                    <span class="value remark-text">{{ order.remark }}</span>
                  </div>
                </div>
              </div>
              <div class="order-total">
                <div class="total-label">订单总额</div>
                <div class="total-amount">
                  ¥{{ formatPrice(order.total_amount) }}
                </div>
                <div class="shipping-fee" v-if="order.shipping_fee">
                  (含运费 ¥{{ formatPrice(order.shipping_fee) }})
                </div>
              </div>
            </div>

            <!-- 订单操作按钮 -->
            <div class="order-actions">
              <el-button size="small" @click.stop="goToOrderDetail(order.id)">
                查看详情
              </el-button>

              <!-- 待支付状态 -->
              <template v-if="order.status === 'pending'">
                <el-button
                  type="primary"
                  size="small"
                  :loading="actionLoading"
                  @click.stop="handlePayOrder(order.id, $event)"
                >
                  立即支付
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  :loading="actionLoading"
                  @click.stop="handleCancelOrder(order.id, $event)"
                >
                  取消订单
                </el-button>
              </template>

              <!-- 待发货状态 -->
              <template v-if="order.status === 'processing'">
                <!-- 🆕 自动流转按钮（已优化） -->
                <el-button
                  type="success"
                  size="small"
                  @click.stop="startAutoStatusFlow(order)"
                  :disabled="actionLoading"
                  :loading="actionLoading"
                >
                  流转到下一状态
                </el-button>
                <el-button
                  type="info"
                  size="small"
                  @click.stop="handleContactSeller(order.id, $event)"
                >
                  联系商家
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  :loading="actionLoading"
                  @click.stop="handleCancelOrder(order.id, $event)"
                >
                  取消订单
                </el-button>
              </template>

              <!-- 已发货状态 -->
              <template v-if="order.status === 'shipped'">
                <!-- 🆕 流转到运输中 -->
                <el-button
                  type="success"
                  size="small"
                  @click.stop="startAutoStatusFlow(order)"
                  :disabled="actionLoading"
                  :loading="actionLoading"
                >
                  标记为运输中
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  :loading="actionLoading"
                  @click.stop="handleConfirmOrder(order.id, $event)"
                >
                  确认收货
                </el-button>
                <el-button
                  type="info"
                  size="small"
                  @click.stop="handleTrackOrder(order.id, $event)"
                >
                  查看物流
                </el-button>
              </template>

              <!-- 运输中状态 -->
              <template v-if="order.status === 'in_transit'">
                <!-- 🆕 流转到已送达 -->
                <el-button
                  type="success"
                  size="small"
                  @click.stop="startAutoStatusFlow(order)"
                  :disabled="actionLoading"
                  :loading="actionLoading"
                >
                  标记为已送达
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  :loading="actionLoading"
                  @click.stop="handleConfirmOrder(order.id, $event)"
                >
                  确认收货
                </el-button>
                <el-button
                  type="info"
                  size="small"
                  @click.stop="handleTrackOrder(order.id, $event)"
                >
                  查看物流
                </el-button>
              </template>

              <!-- 已完成状态 -->
              <template v-if="order.status === 'delivered'">
                <!-- 根据是否已评价显示不同按钮 -->
                <el-button
                  v-if="!order.is_reviewed"
                  type="primary"
                  size="small"
                  @click.stop="handleReview(order.id, $event)"
                >
                  评价
                </el-button>
                <el-button
                  v-else
                  type="success"
                  size="small"
                  plain
                  @click.stop="handleViewReview(order.id, $event)"
                >
                  查看我的评价
                </el-button>
                <el-button
                  type="info"
                  size="small"
                  @click.stop="handleTrackOrder(order.id, $event)"
                >
                  查看物流
                </el-button>
                <el-button
                  type="info"
                  size="small"
                  @click.stop="handleBuyAgain(order.id, $event)"
                >
                  再次购买
                </el-button>
              </template>

              <!-- 已取消状态 -->
              <template v-if="order.status === 'cancelled'">
                <el-button
                  type="info"
                  size="small"
                  :loading="actionLoading"
                  @click.stop="handleDeleteOrder(order.id, $event)"
                >
                  删除订单
                </el-button>
              </template>
            </div>
          </div>
        </transition-group>
      </div>

      <!-- 分页 -->
      <div v-if="orders.length > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50, 100]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <Footer />

    <!-- 评价对话框 -->
    <OrderReviewDialog
      v-model="reviewDialogVisible"
      :order="currentReviewOrder"
      @submit="handleReviewSubmit"
    />

    <!-- 查看评价对话框 -->
    <ReviewDetailDialog
      v-model="reviewDetailDialogVisible"
      :order-id="currentReviewOrderId"
      :order="currentReviewOrder"
    />

    <!-- 支付对话框 -->
    <PaymentDialog
      v-model="paymentDialogVisible"
      :amount="currentPaymentAmount"
      @confirm="handlePaymentConfirm"
      @cancel="handlePaymentCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useOrderStore } from '@/stores/orderStore'
import { useLogisticsStore } from '@/stores/logisticsStore'
import Footer from '@/components/Footer.vue'
import OrderReviewDialog from '@/components/OrderReviewDialog.vue'
import ReviewDetailDialog from '@/components/ReviewDetailDialog.vue'
import LogisticsDialog from '@/components/LogisticsDialog.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import PaymentDialog from '@/components/PaymentDialog.vue'
import { h } from 'vue'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()
const logisticsStore = useLogisticsStore()

// 状态
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const actionLoading = ref(false) // 操作加载状态
const searchKeyword = ref('') // 🆕 搜索关键词
const isSearching = ref(false) // 🆕 是否处于搜索模式
const searchTipText = computed(() => {
  if (!searchKeyword.value) return ''
  const keyword = searchKeyword.value.trim()
  if (/^[a-zA-Z]+$/.test(keyword)) {
    return '检测到拼音输入，将自动匹配中文商品名'
  }
  if (/^\d+$/.test(keyword)) {
    return '搜索订单号'
  }
  return '按 Enter 搜索'
})

// 评价对话框状态
const reviewDialogVisible = ref(false)
const currentReviewOrder = ref(null)

// 查看评价对话框状态
const reviewDetailDialogVisible = ref(false)
const currentReviewOrderId = ref(null)

// 支付对话框状态
const paymentDialogVisible = ref(false)
const currentPaymentOrderId = ref(null)
const currentPaymentAmount = ref(0)

// 自动状态流转相关
const autoStatusTimers = ref(new Map()) // 存储每个订单的定时器

// 直接使用组合式 store 的 ref
const loading = orderStore.loading
const orders = orderStore.orders

// 计算"全部订单"徽章数量
// 从后端 counts 累加所有状态订单数（无论当前在哪个标签）
const allOrdersCount = computed(() => {
  const counts = orderCounts.value
  // 累加所有状态的订单数量（每个状态独立统计，不重复）
  return (
    counts.to_pay +
    counts.to_ship +
    counts.shipped +
    counts.in_transit +
    counts.to_review +
    counts.cancelled
  )
})

// 各状态的订单数量
// 注意：后端 counts 使用业务状态名称（to_pay, to_ship等），需要映射到订单状态（pending, processing等）
const orderCounts = computed(() => {
  const backendCounts = orderStore.orderCounts || {}

  // 后端返回的 counts 映射：
  // to_pay → pending (待支付)
  // to_ship → processing (待发货)
  // shipped → shipped (已发货)
  // in_transit → in_transit (运输中)
  // to_review → delivered (待评价)
  // cancelled → cancelled (已取消)

  return {
    to_pay: backendCounts.to_pay || 0,
    to_ship: backendCounts.to_ship || 0,
    shipped: backendCounts.shipped || 0,
    in_transit: backendCounts.in_transit || 0,
    to_review: backendCounts.to_review || 0,
    cancelled: backendCounts.cancelled || 0,
  }
})

// 获取订单状态文本
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

// 获取订单状态类型（Element Plus Tag type）
const getStatusType = status => {
  const typeMap = {
    pending: 'warning',
    processing: 'primary',
    shipped: 'success',
    in_transit: 'success',
    delivered: 'info',
    cancelled: 'danger',
  }
  return typeMap[status] || 'info'
}

// 获取配送方式文本
const getDeliveryMethodText = method => {
  const methodMap = {
    standard: '标准配送',
    express: '快速配送',
  }
  return methodMap[method] || method
}

// 获取支付方式文本
const getPaymentMethodText = method => {
  const methodMap = {
    wechat: '微信支付',
    alipay: '支付宝',
    credit_card: '信用卡',
  }
  return methodMap[method] || method
}

// 计算属性 - 获取要显示的订单
// loadOrders 已经根据 activeTab 向后端传递了 status 参数
// 后端返回的就是筛选后的订单，前端再做一次防御性筛选确保数据准确
const filteredOrders = computed(() => {
  const allOrders = orders.value || []

  // 🆕 如果处于搜索模式，显示所有搜索结果，不进行状态筛选
  if (isSearching.value) {
    return allOrders
  }

  // 如果是"全部订单"标签，显示所有订单
  if (activeTab.value === 'all') {
    return allOrders
  }

  // 否则，筛选出与当前标签匹配的订单（防御性筛选）
  return allOrders.filter(order => {
    return order.status === activeTab.value
  })
})

// 强制更新key
const forceUpdateKey = ref(0)

// 强制重新渲染
const forceUpdate = () => {
  forceUpdateKey.value++
}
// 格式化价格
const formatPrice = price => {
  const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0
  return numPrice.toFixed(2)
}

// 格式化日期
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

// 加载所有订单（不进行状态筛选）- 已弃用，使用 loadOrders 代替
// eslint-disable-next-line no-unused-vars
const loadAllOrders = async (showLoading = false) => {
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      // 不传status参数，加载所有订单
    }

    const result = await orderStore.fetchOrders(params)

    // 强制触发响应式更新
    await nextTick()

    // 后端返回格式: { orders: [...], counts: {...}, total: xxx }
    if (result.total !== undefined) {
      totalCount.value = result.total
    } else {
      totalCount.value = orders.value.length
    }

    // 检查并启动待发货订单的自动流转（已禁用，避免每次刷新订单状态都变化）
    // checkAndStartAutoFlow()

    // 强制更新页面
    forceUpdate()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('加载所有订单失败:', error)
    ElMessage.error('加载订单失败')
  }
  // 注意: loading 是计算属性，不需要手动设置
}

// 加载订单列表
const loadOrders = async () => {
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
    }

    // 根据选项卡筛选状态（注意：'all' 不传 status 参数）
    if (activeTab.value !== 'all') {
      // 将标签名称映射到API状态名称
      const statusMapping = {
        pending: 'pending',
        processing: 'processing',
        shipped: 'shipped',
        in_transit: 'in_transit',
        delivered: 'delivered',
        cancelled: 'cancelled',
      }
      params.status = statusMapping[activeTab.value] || activeTab.value
    }

    const result = await orderStore.fetchOrders(params)

    // 强制触发响应式更新
    await nextTick()

    // 后端返回格式: { orders: [...], counts: {...}, total: xxx }
    // 如果后端正确返回了 total，使用后端的值
    if (result.total !== undefined) {
      totalCount.value = result.total
    } else {
      // 如果后端没有返回 total，前端计算当前标签下的订单总数
      totalCount.value = orders.value.filter(
        order => activeTab.value === 'all' || order.status === activeTab.value
      ).length
    }

    // 检查并启动待发货订单的自动流转（已禁用，避免每次刷新订单状态都变化）
    // checkAndStartAutoFlow()

    // 强制更新页面
    forceUpdate()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('加载订单列表失败:', error)

    // 更详细的错误提示
    let errorMsg = '加载订单列表失败'

    if (error.response?.data?.message) {
      errorMsg = error.response.data.message
    } else if (error.message) {
      errorMsg = error.message
    }

    ElMessage.error(errorMsg)

    // 如果是认证错误，跳转到登录页
    if (error.response?.status === 401) {
      ElMessage.warning('登录已过期，请重新登录')
      setTimeout(() => {
        router.push({ path: '/login', query: { redirect: route.fullPath } })
      }, 1500)
    }
  }
}

// 刷新订单列表
const refreshOrders = async () => {
  ElMessage.info('正在刷新...')
  await loadOrders()
  ElMessage.success('刷新成功')
}

// 标签切换前的处理
const beforeTabLeave = () => {
  // 如果正在加载，阻止切换
  if (loading.value) {
    return false
  }
  return true
}

// 防抖函数
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// 切换标签（每次切换必定触发一次请求，保留现有列表避免抖动）
const handleTabChange = () => {
  currentPage.value = 1
  // 使用防抖加载数据
  debouncedLoadOrders()
}

// 防抖的加载函数
const debouncedLoadOrders = debounce(() => {
  loadOrders()
}, 50) // 减少延迟时间

// 分页变化
const handlePageChange = page => {
  currentPage.value = page
  loadOrders()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 每页数量变化
const handleSizeChange = size => {
  pageSize.value = size
  currentPage.value = 1
  loadOrders()
}

// 保存搜索前的标签状态
const previousTab = ref('all')

// 🆕 搜索输入防抖
let searchDebounceTimer = null
const handleSearchInput = () => {
  clearTimeout(searchDebounceTimer)
  if (!searchKeyword.value.trim()) {
    return
  }
  // 输入停止 800ms 后自动搜索
  searchDebounceTimer = setTimeout(() => {
    handleSearch()
  }, 800)
}

// 🆕 搜索订单（支持模糊搜索和拼音搜索）
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  try {
    // 保存当前标签，切换到"全部订单"以显示所有搜索结果
    if (!isSearching.value) {
      previousTab.value = activeTab.value
      activeTab.value = 'all'
    }

    isSearching.value = true
    const params = {
      keyword: searchKeyword.value.trim(),
      page: currentPage.value,
      page_size: pageSize.value,
    }

    console.log('🔍 开始搜索:', params)
    const result = await orderStore.searchOrders(params)
    console.log('🔍 搜索结果:', result)
    console.log('🔍 订单列表:', orders.value)
    console.log('🔍 isSearching:', isSearching.value)
    console.log('🔍 filteredOrders 长度:', filteredOrders.value?.length)

    // 更新总数
    if (result.total !== undefined) {
      totalCount.value = result.total
    } else {
      totalCount.value = orders.value.length
    }

    if (orders.value.length === 0) {
      ElMessage.info({
        message: '未找到相关订单，请尝试其他关键词或使用拼音搜索',
        duration: 3000,
      })
    } else {
      const keyword = searchKeyword.value.trim()
      const isPinyin = /^[a-zA-Z]+$/.test(keyword)
      ElMessage.success({
        message: `找到 ${totalCount.value} 条相关订单${isPinyin ? '（拼音匹配）' : ''}`,
        duration: 2000,
      })
    }
  } catch (error) {
    console.error('❌ 搜索失败:', error)
    ElMessage.error(error.message || '搜索失败')
  }
}

// 🆕 清除搜索
const handleSearchClear = () => {
  searchKeyword.value = ''
  if (isSearching.value) {
    isSearching.value = false
    // 恢复到搜索前的标签
    activeTab.value = previousTab.value
    currentPage.value = 1
    loadOrders()
  }
}

// 跳转到订单详情
const goToOrderDetail = orderId => {
  router.push(`/orders/${orderId}`)
}

// 跳转到商城
const goToShop = () => {
  router.push('/shop')
}

// 获取空状态描述
const getEmptyDescription = () => {
  const descriptions = {
    all: '暂无订单，快去选购商品吧',
    pending: '暂无待支付订单',
    processing: '暂无待发货订单',
    shipped: '暂无已发货订单',
    in_transit: '暂无运输中订单',
    delivered: '暂无已完成订单',
    cancelled: '暂无已取消订单',
  }
  return descriptions[activeTab.value] || '暂无订单'
}

// 取消订单
const handleCancelOrder = async (orderId, event) => {
  // 阻止事件冒泡，避免触发查看详情
  if (event) {
    event.stopPropagation()
  }

  // 防止重复操作
  if (actionLoading.value) {
    ElMessage.warning('请等待当前操作完成')
    return
  }

  try {
    await ElMessageBox.confirm(
      '取消订单后将无法恢复，确定要取消吗？',
      '取消订单',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '再想想',
        type: 'warning',
        distinguishCancelAndClose: true,
      }
    )

    actionLoading.value = true

    // 显示加载提示
    const loading = ElMessage({
      message: '正在取消订单...',
      type: 'info',
      duration: 0,
      icon: 'Loading',
    })

    await orderStore.cancelOrder(orderId)

    loading.close()
    ElMessage.success('订单已取消')

    // 刷新列表 - 根据当前标签加载订单
    await loadOrders()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      // eslint-disable-next-line no-console
      console.error('❌ 取消订单失败:', error)
      const errorMsg =
        error.response?.data?.message || error.message || '取消订单失败'
      ElMessage.error(errorMsg)
    }
  } finally {
    actionLoading.value = false
  }
}

// 确认收货
const handleConfirmOrder = async (orderId, event) => {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation()
  }

  // 防止重复操作
  if (actionLoading.value) {
    ElMessage.warning('请等待当前操作完成')
    return
  }

  try {
    await ElMessageBox.confirm('请确认您已收到商品并验货完毕', '确认收货', {
      confirmButtonText: '确认收货',
      cancelButtonText: '暂不确认',
      type: 'success',
      distinguishCancelAndClose: true,
    })

    actionLoading.value = true

    const loading = ElMessage({
      message: '正在确认收货...',
      type: 'info',
      duration: 0,
      icon: 'Loading',
    })

    await orderStore.confirmOrder(orderId)

    loading.close()
    ElMessage.success({
      message: '确认收货成功！感谢您的购买',
      duration: 3000,
      showClose: true,
      icon: h('el-icon', { size: 20 }, h(ElementPlusIconsVue.CircleCheck)),
    })

    // 刷新列表 - 根据当前标签加载订单
    await loadOrders()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      // eslint-disable-next-line no-console
      console.error('❌ 确认收货失败:', error)
      const errorMsg =
        error.response?.data?.message || error.message || '确认收货失败'
      ElMessage.error(errorMsg)
    }
  } finally {
    actionLoading.value = false
  }
}

// 删除订单
const handleDeleteOrder = async (orderId, event) => {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation()
  }

  // 防止重复操作
  if (actionLoading.value) {
    ElMessage.warning('请等待当前操作完成')
    return
  }

  try {
    await ElMessageBox.confirm(
      '删除后将无法恢复，确定要删除这个订单吗？',
      '删除订单',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        distinguishCancelAndClose: true,
      }
    )

    actionLoading.value = true

    const loading = ElMessage({
      message: '正在删除订单...',
      type: 'info',
      duration: 0,
      icon: 'Loading',
    })

    await orderStore.deleteOrder(orderId)

    loading.close()
    ElMessage.success('订单已删除')

    // 刷新列表 - 根据当前标签加载订单
    await loadOrders()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      // eslint-disable-next-line no-console
      console.error('❌ 删除订单失败:', error)
      const errorMsg =
        error.response?.data?.message || error.message || '删除订单失败'
      ElMessage.error(errorMsg)
    }
  } finally {
    actionLoading.value = false
  }
}

// 评价订单
const handleReview = async (orderId, event) => {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation()
  }

  // 防止重复操作
  if (actionLoading.value) {
    ElMessage.warning('请等待当前操作完成')
    return
  }

  try {
    // 获取订单信息
    const order = orders.value.find(o => o.id === orderId)
    if (!order) {
      ElMessage.error('订单不存在')
      return
    }

    // 设置当前评价订单并显示对话框
    currentReviewOrder.value = order
    reviewDialogVisible.value = true
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ 打开评价对话框失败:', error)
    ElMessage.error('打开评价对话框失败')
  }
}

// 处理评价提交
const handleReviewSubmit = async reviewData => {
  try {
    actionLoading.value = true

    const loading = ElMessage({
      message: '正在提交评价...',
      type: 'info',
      duration: 0,
      icon: 'Loading',
    })

    // 调用评价API
    const result = await orderStore.reviewOrder(
      currentReviewOrder.value.id,
      reviewData
    )

    loading.close()

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
        icon: h('el-icon', { size: 20 }, h(ElementPlusIconsVue.CircleCheck)),
      })
    }

    // 关闭对话框
    reviewDialogVisible.value = false
    currentReviewOrder.value = null

    // 刷新列表 - 根据当前标签加载订单
    await loadOrders()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ 评价失败:', error)
    const errorMsg =
      error.response?.data?.message || error.message || '评价失败'
    ElMessage.error(errorMsg)
  } finally {
    actionLoading.value = false
  }
}

// 查看我的评价
const handleViewReview = async (orderId, event) => {
  if (event) {
    event.stopPropagation()
  }

  try {
    // 找到对应的订单
    const order = orders.value.find(o => o.id === orderId)
    if (!order) {
      ElMessage.error('订单不存在')
      return
    }

    currentReviewOrderId.value = orderId
    currentReviewOrder.value = order
    reviewDetailDialogVisible.value = true
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('打开评价详情失败:', error)
    ElMessage.error('打开评价详情失败')
  }
}

// 查看物流
const handleTrackOrder = async (orderId, event) => {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation()
  }

  try {
    // 获取订单信息
    const order = orders.value.find(o => o.id === orderId)
    if (!order) {
      ElMessage.error('订单不存在')
      return
    }

    // 获取物流信息
    const trackingNumber = order.tracking_number || `SF${Date.now()}`
    const carrier = order.carrier || '顺丰速运'

    // 使用物流store获取数据
    await logisticsStore.fetchLogisticsInfo(
      trackingNumber,
      carrier,
      order.id,
      true
    )

    // 显示物流跟踪对话框
    ElMessageBox({
      title: '物流跟踪',
      message: h(LogisticsDialog, {
        orderId: order.id,
        trackingNumber: trackingNumber,
        carrier: carrier,
        orderStatus: order.status,
        autoRefresh: true,
        refreshInterval: 30000,
        onUpdate: () => {
          // 物流信息已更新
        },
        onError: () => {
          // 物流信息错误
        },
      }),
      customClass: 'logistics-dialog',
      showCancelButton: false,
      confirmButtonText: '关闭',
      customStyle: {
        width: '800px',
        borderRadius: '12px',
      },
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ 查看物流失败:', error)
    ElMessage.error('查看物流信息失败')
  }
}

// 再次购买
const handleBuyAgain = async (orderId, event) => {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation()
  }

  // 防止重复操作
  if (actionLoading.value) {
    ElMessage.warning('请等待当前操作完成')
    return
  }

  try {
    actionLoading.value = true

    const loading = ElMessage({
      message: '正在处理再次购买...',
      type: 'info',
      duration: 0,
      icon: 'Loading',
    })

    // 调用再次购买API
    const result = await orderStore.buyAgain(orderId)

    loading.close()

    if (result && result.items && result.items.length > 0) {
      ElMessage.success({
        message: `已将 ${result.items.length} 件商品添加到购物车`,
        duration: 3000,
        showClose: true,
        icon: h('el-icon', { size: 20 }, h(ElementPlusIconsVue.ShoppingCart)),
      })

      // 跳转到购物车页面
      setTimeout(() => {
        router.push('/cart')
      }, 1500)
    } else {
      ElMessage.warning('订单中的商品已下架或库存不足')
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ 再次购买失败:', error)
    const errorMsg =
      error.response?.data?.message || error.message || '再次购买失败'
    ElMessage.error(errorMsg)
  } finally {
    actionLoading.value = false
  }
}

// 支付订单
const handlePayOrder = async (orderId, event) => {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation()
  }

  // 防止重复操作
  if (actionLoading.value) {
    ElMessage.warning('请等待当前操作完成')
    return
  }

  // 查找当前订单以获取金额
  const currentOrder = orders.value.find(o => o.id === orderId)
  if (currentOrder) {
    currentPaymentAmount.value = parseFloat(currentOrder.total_amount) || 0
  }

  // 打开支付对话框
  currentPaymentOrderId.value = orderId
  paymentDialogVisible.value = true
}

// 确认支付
const handlePaymentConfirm = async paymentMethod => {
  if (!currentPaymentOrderId.value) {
    return
  }

  try {
    actionLoading.value = true

    const loading = ElMessage({
      message: '正在处理支付...',
      type: 'info',
      duration: 0,
      icon: 'Loading',
    })

    // 调用支付API
    await orderStore.payOrder(currentPaymentOrderId.value, paymentMethod)

    loading.close()

    // 如果使用余额支付，刷新用户余额
    if (paymentMethod === 'balance') {
      const { useUserStore } = await import('@/stores/userStore')
      const userStore = useUserStore()
      await userStore.fetchUserBalance()
    }

    ElMessage.success({
      message: '支付成功！订单状态已更新',
      duration: 3000,
      showClose: true,
      icon: h('el-icon', { size: 20 }, h(ElementPlusIconsVue.SuccessFilled)),
    })

    // 刷新列表 - 根据当前标签加载订单
    await loadOrders()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ 支付失败:', error)
    const errorMsg =
      error.response?.data?.message || error.message || '支付失败'

    // 特殊处理余额不足的情况
    if (errorMsg.includes('余额不足')) {
      ElMessage.error('余额不足，请充值或选择其他支付方式')
    } else {
      ElMessage.error(errorMsg)
    }
  } finally {
    actionLoading.value = false
    currentPaymentOrderId.value = null
    currentPaymentAmount.value = 0
  }
}

// 取消支付
const handlePaymentCancel = () => {
  currentPaymentOrderId.value = null
  currentPaymentAmount.value = 0
}

// 联系商家
const handleContactSeller = async (orderId, event) => {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation()
  }

  try {
    // 获取订单信息
    const order = orders.value.find(o => o.id === orderId)
    if (!order) {
      ElMessage.error('订单不存在')
      return
    }

    // 显示联系方式对话框
    await ElMessageBox.alert(
      `
        <div style="text-align: left;">
          <h3 style="margin-bottom: 16px; color: #333;">联系商家</h3>
          <div style="margin-bottom: 12px;">
            <strong>订单号：</strong>${order.order_number}
          </div>
          <div style="margin-bottom: 12px;">
            <strong>订单状态：</strong>
            <span style="color: #67C23A; font-weight: bold;">${getStatusText(order.status)}</span>
          </div>
          <div style="border-top: 1px solid #eee; padding-top: 16px; margin-top: 16px;">
            <h4 style="margin-bottom: 12px; color: #666;">联系方式</h4>
            <div style="margin-bottom: 8px;">
              <strong>客服热线：</strong>
              <span style="color: #409EFF; font-weight: bold;">400-888-8888</span>
            </div>
            <div style="margin-bottom: 8px;">
              <strong>在线客服：</strong>
              <span style="color: #409EFF; font-weight: bold;">点击进入</span>
            </div>
            <div style="margin-bottom: 8px;">
              <strong>微信客服：</strong>
              <span style="color: #409EFF; font-weight: bold;">fresh_harvest_service</span>
            </div>
            <div style="margin-bottom: 12px;">
              <strong>服务时间：</strong>
              <span style="color: #666;">9:00-21:00（全年无休）</span>
            </div>
            <div style="background: #f0f9ff; padding: 12px; border-radius: 4px; border-left: 4px solid #409EFF;">
              <div style="font-size: 13px; color: #666; line-height: 1.5;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                  <el-icon :size="16" color="#409EFF"><component :is="ElementPlusIconsVue.InfoFilled" /></el-icon>
                  <strong>温馨提示：</strong>
                </div>
                • 请提供订单号以便客服快速处理<br>
                • 工作时间响应更快，非工作时间请留言<br>
                • 紧急问题可拨打客服热线
              </div>
            </div>
          </div>
        </div>
      `,
      '联系商家',
      {
        confirmButtonText: '知道了',
        dangerouslyUseHTMLString: true,
        customStyle: {
          width: '450px',
        },
      }
    )
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      // eslint-disable-next-line no-console
      console.error('❌ 联系商家失败:', error)
      ElMessage.error('联系商家失败')
    }
  }
}

// 处理图片加载错误
const handleImageError = event => {
  const img = event.target
  img.style.display = 'none'
  // 创建占位符
  const placeholder = document.createElement('div')
  placeholder.className = 'product-image-placeholder'
  placeholder.textContent = '🍎'
  img.parentNode.appendChild(placeholder)
}

// 获取订单商品信息
const getOrderItems = order => {
  // 🔧 修复：确保返回有效的商品数组
  if (!order || !order.items) {
    return []
  }

  // 确保items是数组
  if (!Array.isArray(order.items)) {
    return []
  }

  // 过滤掉无效的商品数据
  return order.items.filter(item => item && (item.product_name || item.name))
}

// 监听路由查询参数变化（支持通过 URL 参数筛选）
watch(
  () => route.query.status,
  newStatus => {
    if (newStatus && newStatus !== activeTab.value) {
      activeTab.value = newStatus
      currentPage.value = 1
      loadOrders()
    }
  },
  { immediate: true }
)

// 🆕 自动状态流转功能（已优化 - 调用后端 API 验证）
const startAutoStatusFlow = async order => {
  // 防止重复操作
  if (autoStatusTimers.value.has(order.id) || actionLoading.value) {
    ElMessage.warning('请等待当前操作完成')
    return
  }

  // 状态流转映射
  const statusFlowMap = {
    processing: 'shipped', // 待发货 → 已发货
    shipped: 'in_transit', // 已发货 → 运输中
    in_transit: 'delivered', // 运输中 → 已送达
  }

  const nextStatus = statusFlowMap[order.status]

  if (!nextStatus) {
    ElMessage.warning('该订单无法继续流转')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定将订单状态从 "${getStatusText(order.status)}" 变更为 "${getStatusText(nextStatus)}" 吗？`,
      '订单状态流转',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    actionLoading.value = true

    // 调用后端 API 更新订单状态（后端会进行状态流转验证）
    await orderStore.updateOrderStatus(order.id, nextStatus)

    ElMessage.success(`订单已更新为：${getStatusText(nextStatus)}`)

    // 刷新订单列表
    await loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      // 后端会返回详细错误信息（如：非法状态流转）
      const errorMsg = error.message || '状态更新失败'
      ElMessage.error(errorMsg)
    }
  } finally {
    actionLoading.value = false
  }
}

// 停止自动状态流转（暂未使用，但保留供将来使用）
// const stopAutoStatusFlow = orderId => {
//   if (autoStatusTimers.value.has(orderId)) {
//     clearInterval(autoStatusTimers.value.get(orderId))
//     autoStatusTimers.value.delete(orderId)
//   }
// }

// 清理所有定时器
const clearAllAutoStatusTimers = () => {
  autoStatusTimers.value.forEach(timer => {
    clearInterval(timer)
  })
  autoStatusTimers.value.clear()
}

// 检查并启动待发货订单的自动流转（已禁用）
// const checkAndStartAutoFlow = () => {
//   orders.value.forEach(order => {
//     if (
//       order.status === 'processing' &&
//       !autoStatusTimers.value.has(order.id)
//     ) {
//       console.log('🔍 发现待发货订单，启动自动流转:', order.id)
//       startAutoStatusFlow(order.id)
//     }
//   })
// }

// 初始化
onMounted(() => {
  // 如果 URL 有状态参数，使用它
  const statusFromQuery = route.query.status
  if (statusFromQuery) {
    activeTab.value = statusFromQuery
  }

  loadOrders()
})

// 页面卸载时清理定时器
onUnmounted(() => {
  clearAllAutoStatusTimers()
})
</script>

<style scoped>
/* 订单列表过渡动画 - 优化版本 */
.order-list-enter-active,
.order-list-leave-active {
  transition: all 0.15s ease;
}

.order-list-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.order-list-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.order-list-move {
  transition: transform 0.15s ease;
}

/* 加载覆盖层 */
.loading-overlay {
  position: relative;
  opacity: 0.7;
  pointer-events: none;
}

.loading-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.order-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 0;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

/* 🆕 头部操作区域 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 🆕 搜索框样式 */
.search-input {
  width: 350px;
}

.search-input :deep(.el-input__inner) {
  border-radius: 20px;
}

.search-input :deep(.el-input-group__append) {
  border-radius: 0 20px 20px 0;
  padding: 0 15px;
}

/* 订单标签页 */
.order-tabs {
  background: white;
  border-radius: 8px;
  padding: 16px 24px 0;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-badge {
  margin-left: 6px;
  font-size: 12px;
  font-weight: 500;
  /* 固定徽章占位，避免数字变化引起标签抖动 */
  width: 34px;
  display: inline-block;
  text-align: center;
}

.tab-badge :deep(.el-badge__content) {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: 600;
  /* 固定内容尺寸，数字切换不改变布局 */
  min-width: 28px; /* 适配到 99+ */
  height: 18px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* 使用等宽数字，进一步减少抖动 */
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
  transition: none;
}

/* 不同状态的徽章颜色 */
.el-tabs__item:nth-child(2) .tab-badge :deep(.el-badge__content) {
  background: linear-gradient(135deg, #ff9500, #ffb84d); /* 待支付 - 橙色 */
}

.el-tabs__item:nth-child(3) .tab-badge :deep(.el-badge__content) {
  background: linear-gradient(135deg, #007aff, #4da6ff); /* 待发货 - 蓝色 */
}

.el-tabs__item:nth-child(4) .tab-badge :deep(.el-badge__content) {
  background: linear-gradient(135deg, #34c759, #5dd679); /* 已发货 - 绿色 */
}

.el-tabs__item:nth-child(5) .tab-badge :deep(.el-badge__content) {
  background: linear-gradient(135deg, #5856d6, #7c7ce8); /* 运输中 - 紫色 */
}

.el-tabs__item:nth-child(6) .tab-badge :deep(.el-badge__content) {
  background: linear-gradient(135deg, #32d74b, #5dd679); /* 已完成 - 深绿色 */
}

.el-tabs__item:nth-child(7) .tab-badge :deep(.el-badge__content) {
  background: linear-gradient(135deg, #ff3b30, #ff6b6b); /* 已取消 - 红色 */
}

/* 加载状态 */
.loading-container {
  background: white;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 订单列表 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-number {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.order-date {
  font-size: 13px;
  color: #999;
}

/* 订单商品 */
.order-items {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
}

.order-items:hover {
  background-color: #fafafa;
}

.order-products {
  flex: 1;
}

/* 商品图片展示 */
.order-product-images {
  margin-bottom: 12px;
}

.product-images-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.product-image-item {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #e9ecef;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image-placeholder {
  font-size: 20px;
  color: #6c757d;
}

.product-image-more {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.more-count {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
}

.product-names {
  margin-top: 4px;
}

.product-names-text {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.order-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.summary-item .label {
  color: #666;
}

.summary-item .value {
  color: #333;
  font-weight: 500;
}

.summary-item .remark-text {
  color: #666;
  font-weight: 400;
  font-style: italic;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-total {
  text-align: right;
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.total-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}

.total-amount {
  font-size: 24px;
  font-weight: 700;
  color: #618961;
}

.shipping-fee {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 订单操作 */
.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 面包屑导航样式 */
.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.breadcrumb a {
  color: #618961;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb a:hover {
  color: #4a6b4a;
}

.breadcrumb .separator {
  margin: 0 8px;
  color: #999;
}

.breadcrumb .current {
  color: #333;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 12px;
  }

  .page-title {
    font-size: 24px;
  }

  .order-tabs {
    padding: 12px 16px 0;
  }

  .order-card {
    padding: 16px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .order-items {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .order-total {
    width: 100%;
    text-align: left;
    padding-left: 0;
    padding-top: 12px;
    border-top: 1px dashed #e0e0e0;
  }

  .order-actions {
    flex-wrap: wrap;
  }

  .order-actions .el-button {
    flex: 1;
    min-width: 100px;
  }

  /* 移动端商品图片样式调整 */
  .product-image-item {
    width: 40px;
    height: 40px;
  }

  .product-image-more {
    width: 40px;
    height: 40px;
  }

  .product-images-container {
    gap: 6px;
  }

  .product-names-text {
    font-size: 12px;
  }
}
</style>
