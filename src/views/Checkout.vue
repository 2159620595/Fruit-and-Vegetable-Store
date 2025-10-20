<template>
  <div class="checkout-page">
    <div class="container">
      <!-- Breadcrumbs -->
      <Breadcrumb current-page="结账" />

      <!-- 空购物车提示 -->
      <div
        v-if="cartStore.selectedItems.length === 0"
        class="empty-cart-message"
      >
        <div class="empty-icon">
          <el-icon :size="80" color="#909399">
            <ShoppingCart />
          </el-icon>
        </div>
        <h2>没有要结账的商品</h2>
        <p>请先在购物车中选择要购买的商品</p>
        <el-button type="primary" @click="router.push('/cart')">
          返回购物车
        </el-button>
      </div>

      <!-- Main Content -->
      <div v-else class="main-content">
        <!-- Left Section - Checkout Form -->
        <div class="checkout-form-section">
          <h1 class="checkout-title">结账</h1>

          <!-- Shipping Address -->
          <AddressSelector
            v-model="selectedAddressId"
            @change="onAddressChange"
          />
          <div v-if="errors.address" class="error-message">
            {{ errors.address }}
          </div>

          <!-- Delivery Method -->
          <div class="form-section">
            <h2 class="section-title">配送时效</h2>
            <div class="radio-group">
              <label
                class="radio-option"
                :class="{ selected: deliveryMethod === 'standard' }"
              >
                <input
                  v-model="deliveryMethod"
                  type="radio"
                  name="delivery"
                  value="standard"
                />
                <div class="radio-content">
                  <div class="radio-title">标准配送 - ¥8.00</div>
                  <div class="radio-description">3-5个工作日内送达</div>
                </div>
              </label>
              <label
                class="radio-option"
                :class="{ selected: deliveryMethod === 'express' }"
              >
                <input
                  v-model="deliveryMethod"
                  type="radio"
                  name="delivery"
                  value="express"
                />
                <div class="radio-content">
                  <div class="radio-title">特快配送 - ¥13.00</div>
                  <div class="radio-description">1-2 个工作日内送达</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="form-section">
            <h2 class="section-title">付款方式</h2>
            <el-select
              v-model="paymentMethod"
              placeholder="请选择支付方式"
              class="payment-select"
              size="large"
            >
              <el-option value="wechat" label="微信支付">
                <span class="payment-option-content">
                  <el-icon class="payment-icon wechat-icon" :size="20">
                    <ChatDotRound />
                  </el-icon>
                  <span class="payment-name">微信支付</span>
                </span>
              </el-option>
              <el-option value="alipay" label="支付宝">
                <span class="payment-option-content">
                  <el-icon class="payment-icon alipay-icon" :size="20">
                    <Wallet />
                  </el-icon>
                  <span class="payment-name">支付宝</span>
                </span>
              </el-option>
              <el-option value="credit_card" label="信用卡/借记卡">
                <span class="payment-option-content">
                  <el-icon class="payment-icon card-icon" :size="20">
                    <CreditCard />
                  </el-icon>
                  <span class="payment-name">信用卡/借记卡</span>
                </span>
              </el-option>
            </el-select>

            <!-- Credit Card Fields -->
            <div v-if="paymentMethod === 'credit_card'" class="payment-fields">
              <div class="form-row">
                <input
                  v-model="cardInfo.number"
                  type="text"
                  placeholder="卡号"
                  class="form-input full-width"
                  :class="{ error: errors.cardNumber }"
                  maxlength="19"
                />
              </div>
              <div v-if="errors.cardNumber" class="error-message">
                {{ errors.cardNumber }}
              </div>

              <div class="form-row">
                <input
                  v-model="cardInfo.expiry"
                  type="text"
                  placeholder="有效期 (MM/YY)"
                  class="form-input half-width"
                  :class="{ error: errors.expiry }"
                  maxlength="5"
                />
                <input
                  v-model="cardInfo.cvv"
                  type="text"
                  placeholder="CVV"
                  class="form-input half-width"
                  :class="{ error: errors.cvv }"
                  maxlength="4"
                />
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <el-button
            type="success"
            size="large"
            @click="submitOrder"
            :disabled="submitting"
            :loading="submitting"
            style="width: 100%"
          >
            {{ submitting ? '提交中...' : '提交订单' }}
          </el-button>
        </div>

        <!-- Right Section - Order Summary -->
        <div class="order-summary-section">
          <h2 class="summary-title">订单详情</h2>

          <!-- Product Items -->
          <div class="product-items">
            <div
              v-for="item in cartStore.selectedItems"
              :key="item.id"
              class="product-item"
            >
              <div class="product-image">
                <img
                  v-if="item.image_url || item.image"
                  :src="item.image_url || item.image"
                  :alt="item.name"
                />
                <div v-else class="image-placeholder">
                  <el-icon :size="32" color="#67c23a">
                    <Apple />
                  </el-icon>
                </div>
              </div>
              <div class="product-info">
                <div class="product-name">{{ item.name }}</div>
                <div class="product-quantity">
                  {{ item.quantity }} × ¥{{ formatPrice(item.price) }}
                </div>
              </div>
              <div class="product-price">
                ¥{{ formatPrice(item.price * item.quantity) }}
              </div>
            </div>
          </div>

          <!-- Cost Breakdown -->
          <div class="cost-breakdown">
            <div class="cost-row">
              <span class="cost-label">
                小计 ({{ cartStore.selectedCount }} 件商品)
              </span>
              <span class="cost-value">
                ¥{{ cartStore.selectedTotal.toFixed(2) }}
              </span>
            </div>
            <div class="cost-row">
              <span class="cost-label">运费</span>
              <span class="cost-value">
                {{
                  shippingCost === 0 ? '免费' : `¥${shippingCost.toFixed(2)}`
                }}
              </span>
            </div>
            <div v-if="discount > 0" class="cost-row">
              <span class="cost-label">优惠</span>
              <span class="cost-value discount">
                -¥{{ discount.toFixed(2) }}
              </span>
            </div>
            <div class="cost-row total">
              <span class="cost-label">总计</span>
              <span class="cost-value">¥{{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Order Tips -->
          <div class="order-tips">
            <p class="tip-item">
              <el-icon :size="16" color="#67c23a"><CircleCheck /></el-icon>
              所有商品均为新鲜配送
            </p>
            <p class="tip-item">
              <el-icon :size="16" color="#67c23a"><CircleCheck /></el-icon>
              支持7天无理由退货
            </p>
            <p v-if="freeShippingRemaining > 0" class="tip-item shipping-tip">
              <el-icon :size="16"><InfoFilled /></el-icon>
              再购买 ¥{{ freeShippingRemaining.toFixed(2) }} 即可免运费
            </p>
            <p v-else class="tip-item shipping-tip success">
              <el-icon :size="16"><SuccessFilled /></el-icon>
              恭喜！已满 ¥{{ FREE_SHIPPING_THRESHOLD }}，享受免运费
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 组件名称
defineOptions({
  name: 'CheckoutPage',
})
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElSelect, ElOption } from 'element-plus'
import {
  ChatDotRound,
  Wallet,
  CreditCard,
  ShoppingCart,
  Apple,
  CircleCheck,
  InfoFilled,
  SuccessFilled,
} from '@element-plus/icons-vue'
import { useCartStore } from '../stores/cartStore'
import { useOrderStore } from '../stores/orderStore'
// import { useUserStore } from '../stores/userStore' // 暂时未使用
// import { useAddressStore } from '../stores/addressStore' // 暂时未使用
import AddressSelector from '../components/AddressSelector.vue'
import Breadcrumb from '../components/Breadcrumb.vue'
import {
  calculateShippingFee,
  calculateFreeShippingRemaining,
  FREE_SHIPPING_THRESHOLD,
} from '@/config/shipping'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
// const userStore = useUserStore() // 暂时未使用
// const addressStore = useAddressStore() // 暂时未使用

// 选中的地址ID
const selectedAddressId = ref(null)

// 选中的地址对象
const selectedAddress = ref(null)

const deliveryMethod = ref('standard')
const paymentMethod = ref('wechat')

const cardInfo = ref({
  number: '',
  expiry: '',
  cvv: '',
})

// 验证错误
const errors = ref({
  address: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
})

// 提交状态
const submitting = ref(false)

// 优惠金额（可以后续从优惠券系统获取）
const discount = ref(0)

// 运费计算（使用统一配置）
const shippingCost = computed(() => {
  const subtotal = Number(cartStore.selectedTotal) || 0
  return calculateShippingFee(subtotal, deliveryMethod.value)
})

// 距离免运费还差多少
const freeShippingRemaining = computed(() => {
  const subtotal = Number(cartStore.selectedTotal) || 0
  return calculateFreeShippingRemaining(subtotal)
})

// 总金额计算
const totalAmount = computed(() => {
  const subtotal = Number(cartStore.selectedTotal) || 0
  const shipping = Number(shippingCost.value) || 0
  const discountAmount = Number(discount.value) || 0
  return subtotal + shipping - discountAmount
})

// 页面加载时检查购物车
onMounted(() => {
  if (cartStore.selectedItems.length === 0) {
    ElMessage.warning('购物车中没有选中的商品')
    router.push('/cart')
  }
})

// 地址选择变化
const onAddressChange = address => {
  selectedAddress.value = address
  // 清空地址错误
  errors.value.address = ''
}

// 表单验证
const validateForm = () => {
  // 清空之前的错误
  Object.keys(errors.value).forEach(key => {
    errors.value[key] = ''
  })

  let isValid = true

  // 验证地址
  if (!selectedAddress.value) {
    errors.value.address = '请选择收货地址'
    isValid = false
  }

  // 如果选择信用卡支付，验证卡信息
  if (paymentMethod.value === 'credit_card') {
    if (!cardInfo.value.number.trim()) {
      errors.value.cardNumber = '请输入卡号'
      isValid = false
    } else if (cardInfo.value.number.replace(/\s/g, '').length < 13) {
      errors.value.cardNumber = '卡号长度不正确'
      isValid = false
    }

    const expiryRegex = /^\d{2}\/\d{2}$/
    if (!cardInfo.value.expiry.trim()) {
      errors.value.expiry = '请输入有效期'
      isValid = false
    } else if (!expiryRegex.test(cardInfo.value.expiry)) {
      errors.value.expiry = '格式应为 MM/YY'
      isValid = false
    }

    if (!cardInfo.value.cvv.trim()) {
      errors.value.cvv = '请输入CVV'
      isValid = false
    } else if (cardInfo.value.cvv.length < 3) {
      errors.value.cvv = 'CVV应为3-4位数字'
      isValid = false
    }
  }

  return isValid
}

// 提交订单
const submitOrder = async () => {
  // 检查是否有选中的商品
  if (cartStore.selectedItems.length === 0) {
    ElMessage.warning('没有选中的商品，请返回购物车选择商品')
    router.push('/cart')
    return
  }

  // 验证表单
  if (!validateForm()) {
    ElMessage.error('请完善表单信息')
    return
  }

  submitting.value = true

  try {
    // 构建订单数据
    const orderData = {
      items: cartStore.selectedItems.map(item => ({
        productId: item.product_id || item.id,
        quantity: item.quantity,
      })),
      shippingAddress: {
        name: selectedAddress.value.recipient_name,
        phone: selectedAddress.value.phone,
        region: selectedAddress.value.region || '',
        address: selectedAddress.value.detailed_address,
      },
      deliveryMethod: deliveryMethod.value,
      paymentMethod: paymentMethod.value,
      shippingFee: shippingCost.value,
      totalAmount: totalAmount.value,
      remark: '',
    }

    // 创建订单
    const result = await orderStore.createOrder(orderData)

    // 获取订单ID
    const orderId = result.order_id || result.id
    if (!orderId) {
      ElMessage.error('订单创建失败，请重试')
      return
    }

    // 显示支付确认对话框
    try {
      await ElMessageBox.confirm(
        `确认支付 ¥${totalAmount.value.toFixed(2)} 吗？（含运费 ¥${shippingCost.value.toFixed(2)}）`,
        '确认支付',
        {
          confirmButtonText: '确认支付',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'payment-confirm-dialog',
        }
      )

      // 用户确认支付，更新订单状态为待发货
      ElMessage.info('正在处理支付...')

      // 模拟支付处理
      setTimeout(async () => {
        try {
          // 模拟支付成功，更新订单状态为待发货
          await orderStore.updateOrderStatus(orderId, 'processing')

          ElMessage.success('支付成功！订单已确认')

          // 清除购物车中已购买的商品
          await cartStore.removeSelectedItems()

          // 跳转到订单列表页
          router.push('/orders')
        } catch {
          ElMessage.error('支付处理失败，请重试')
        } finally {
          submitting.value = false
        }
      }, 2000) // 模拟2秒支付处理时间
    } catch (error) {
      // 用户取消支付，将订单状态设为待支付
      if (error === 'cancel' || error === 'close') {
        try {
          await orderStore.updateOrderStatus(orderId, 'pending')
          ElMessage.info('已取消支付，订单状态已更新为待支付')
        } catch {
          ElMessage.error('更新订单状态失败')
        }
        submitting.value = false
      } else {
        submitting.value = false
        throw error
      }
    }
  } catch {
    ElMessage.error('提交订单失败，请重试')
    submitting.value = false
  }
}

// 格式化价格函数
const formatPrice = price => {
  const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0
  return numPrice.toFixed(2)
}
</script>

<style scoped>
/* 支付确认对话框样式 */
:deep(.payment-confirm-dialog .el-message-box__title) {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

:deep(.payment-confirm-dialog .el-message-box__content) {
  font-size: 16px;
  color: #666;
  padding: 20px 0;
}

:deep(.payment-confirm-dialog .el-message-box__btns) {
  padding: 20px 0 0 0;
}

:deep(.payment-confirm-dialog .el-button--primary) {
  background: linear-gradient(135deg, #67c23a, #85ce61);
  border: none;
  font-weight: 600;
}

:deep(.payment-confirm-dialog .el-button--default) {
  background: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.checkout-page {
  min-height: 100vh;
  background-color: #ffffff;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Header Styles */
.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  padding: 16px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.leaf-icon {
  font-size: 16px;
  color: #2d5a27;
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #333333;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #2d5a27;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cart-btn {
  background-color: #e8f5e8;
  color: #2d5a27;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cart-btn:hover {
  background-color: #d4edda;
}

.profile-pic {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.profile-pic img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Breadcrumbs */
.breadcrumbs {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-link {
  color: #2d5a27;
  text-decoration: none;
  font-size: 14px;
}

.breadcrumb-separator {
  color: #333333;
  font-size: 14px;
}

.breadcrumb-current {
  color: #333333;
  font-size: 14px;
}

/* 空购物车提示 */
.empty-cart-message {
  text-align: center;
  padding: 80px 20px;
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-cart-message h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12px;
}

.empty-cart-message p {
  font-size: 16px;
  color: #666666;
  margin-bottom: 32px;
}

/* Main Content */
.main-content {
  padding: 24px 0;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 48px;
}

/* Left Section - Checkout Form */
.checkout-form-section {
  background-color: #ffffff;
}

.checkout-title {
  font-size: 32px;
  font-weight: 700;
  color: #333333;
  margin: 0 0 32px 0;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0 0 16px 0;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  background-color: #f8f9fa;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2d5a27;
}

.form-input.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: -12px;
  margin-bottom: 12px;
  padding-left: 4px;
}

.full-width {
  flex: 1;
}

.half-width {
  flex: 1;
}

/* Radio Options */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-option {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid #e5e5e5;
}

.radio-option:hover {
  background-color: #f0f0f0;
}

.radio-option.selected {
  background-color: #f0f0f0;
  border-color: #2d5a27;
}

.radio-option input[type='radio'] {
  margin-right: 12px;
  width: 16px;
  height: 16px;
  accent-color: #2d5a27;
}

.radio-content {
  flex: 1;
}

.radio-title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
}

.radio-description {
  font-size: 14px;
  color: #666666;
}

.payment-fields {
  margin-top: 16px;
}

/* 支付方式选择框样式 */
.payment-select {
  width: 100%;
}

:deep(.payment-select .el-input__wrapper) {
  padding: 12px 16px;
  background-color: #f8f9fa;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  transition: all 0.2s;
  box-shadow: none;
}

:deep(.payment-select .el-input__wrapper:hover) {
  background-color: #f0f0f0;
  border-color: #d0d0d0;
}

:deep(.payment-select.is-focused .el-input__wrapper) {
  background-color: #ffffff;
  border-color: #2d5a27;
  box-shadow: 0 0 0 2px rgba(45, 90, 39, 0.1);
}

:deep(.payment-select .el-input__inner) {
  font-size: 15px;
  color: #333333;
}

/* 支付选项内容样式 */
.payment-option-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.payment-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
}

.wechat-icon {
  color: #07c160;
}

.alipay-icon {
  color: #1677ff;
}

.card-icon {
  color: #f5222d;
}

.payment-name {
  font-size: 15px;
  color: #333333;
  font-weight: 500;
}

/* 下拉面板样式 */
:deep(.el-select-dropdown__item) {
  padding: 12px 16px;
  font-size: 15px;
}

:deep(.el-select-dropdown__item.selected) {
  color: #2d5a27;
  font-weight: 600;
  background-color: #f0f8f0;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: #f8f9fa;
}

/* Right Section - Order Summary */
.order-summary-section {
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 24px;
}

.summary-title {
  font-size: 20px;
  font-weight: 600;
  color: #333333;
  margin: 0 0 24px 0;
}

/* Product Items */
.product-items {
  margin-bottom: 24px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.product-item:last-child {
  margin-bottom: 0;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-quantity {
  font-size: 13px;
  color: #666666;
}

.product-price {
  font-size: 14px;
  font-weight: 600;
  color: #2d5a27;
  flex-shrink: 0;
}

/* Cost Breakdown */
.cost-breakdown {
  border-top: 1px solid #e5e5e5;
  padding-top: 16px;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cost-row:last-child {
  margin-bottom: 0;
}

.cost-row.total {
  border-top: 1px solid #e5e5e5;
  padding-top: 12px;
  margin-top: 12px;
}

.cost-label {
  font-size: 14px;
  color: #333333;
}

.cost-row.total .cost-label {
  font-weight: 600;
}

.cost-value {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
}

.cost-row.total .cost-value {
  font-weight: 600;
  font-size: 16px;
}

.cost-value.discount {
  color: #dc3545;
}

/* Order Tips */
.order-tips {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.tip-item {
  font-size: 13px;
  color: #666666;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tip-item:last-child {
  margin-bottom: 0;
}

/* 运费提示特殊样式 */
.tip-item.shipping-tip {
  padding: 8px 12px;
  background-color: #fff3cd;
  border-left: 3px solid #ffc107;
  border-radius: 4px;
  color: #856404;
  font-weight: 500;
}

.tip-item.shipping-tip.success {
  background-color: #d4edda;
  border-left-color: #28a745;
  color: #155724;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .order-summary-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .nav-links {
    gap: 16px;
  }

  .main-content {
    padding: 16px;
  }

  .checkout-title {
    font-size: 24px;
  }

  .form-row {
    flex-direction: column;
    gap: 12px;
  }

  .half-width {
    width: 100%;
  }
}
</style>
