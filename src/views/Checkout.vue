<template>
  <div class="checkout-page">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="leaf-icon">🌱</span>
          <span class="brand-name">果蔬商城</span>
        </div>
        <nav class="nav-links">
          <a href="#" class="nav-link" @click="router.push('/')">首页</a>
          <a href="#" class="nav-link">菜谱</a>
          <a href="#" class="nav-link">关于我们</a>
          <a href="#" class="nav-link">联系我们</a>
        </nav>
        <div class="header-actions">
          <button class="cart-btn" @click="router.push('/cart')">
            购物车 ({{ cartStore.cartCount }})
          </button>
          <div class="profile-pic" @click="router.push('/profile')">
            <img
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTE2IDE2QzE4LjIwOTEgMTYgMjAgMTQuMjA5MSAyMCAxMkMyMCA5Ljc5MDg2IDE4LjIwOTEgOCAxNiA4QzEzLjc5MDkgOCAxMiA5Ljc5MDg2IDEyIDEyQzEyIDE0LjIwOTEgMTMuNzkwOSAxNiAxNiAxNloiIGZpbGw9IiM2NjY2NjYiLz4KPHBhdGggZD0iTTE2IDI0QzE5LjMxMzcgMjQgMjIgMjEuMzEzNyAyMiAxOEgyMkMyMiAxNi44OTU0IDIxLjEwNDYgMTYgMjAgMTZIMTJDMTAuODk1NCAxNiAxMCAxNi44OTU0IDEwIDE4SDhDOCAyMS4zMTM3IDEwLjY4NjMgMjQgMTYgMjRaIiBmaWxsPSIjNjY2NjY2Ii8+Cjwvc3ZnPgo="
              alt="Profile"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Breadcrumbs -->
    <div class="breadcrumbs">
      <a href="#" class="breadcrumb-link" @click.prevent="router.push('/cart')">购物车</a>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">结账</span>
    </div>

    <!-- 空购物车提示 -->
    <div v-if="cartStore.selectedItems.length === 0" class="empty-cart-message">
      <div class="empty-icon">🛒</div>
      <h2>没有要结账的商品</h2>
      <p>请先在购物车中选择要购买的商品</p>
      <button class="back-to-cart-btn" @click="router.push('/cart')">返回购物车</button>
    </div>

    <!-- Main Content -->
    <div v-else class="main-content">
      <!-- Left Section - Checkout Form -->
      <div class="checkout-form-section">
        <h1 class="checkout-title">结账</h1>

        <!-- Shipping Address -->
        <AddressSelector v-model="selectedAddressId" @change="onAddressChange" />
        <div v-if="errors.address" class="error-message">{{ errors.address }}</div>

        <!-- Delivery Method -->
        <div class="form-section">
          <h2 class="section-title">配送时效</h2>
          <div class="radio-group">
            <label class="radio-option" :class="{ selected: deliveryMethod === 'standard' }">
              <input v-model="deliveryMethod" type="radio" name="delivery" value="standard" />
              <div class="radio-content">
                <div class="radio-title">标准配送 - ¥5.00</div>
                <div class="radio-description">3-5个工作日内送达</div>
              </div>
            </label>
            <label class="radio-option" :class="{ selected: deliveryMethod === 'express' }">
              <input v-model="deliveryMethod" type="radio" name="delivery" value="express" />
              <div class="radio-content">
                <div class="radio-title">特快配送 - ¥10.00</div>
                <div class="radio-description">1-2 个工作日内送达</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="form-section">
          <h2 class="section-title">付款方式</h2>
          <div class="radio-group">
            <label class="radio-option" :class="{ selected: paymentMethod === 'credit-card' }">
              <input v-model="paymentMethod" type="radio" name="payment" value="credit-card" />
              <div class="radio-content">
                <div class="radio-title">💳 信用卡/借记卡</div>
              </div>
            </label>
            <label class="radio-option" :class="{ selected: paymentMethod === 'wechat' }">
              <input v-model="paymentMethod" type="radio" name="payment" value="wechat" />
              <div class="radio-content">
                <div class="radio-title">💚 微信支付</div>
              </div>
            </label>
            <label class="radio-option" :class="{ selected: paymentMethod === 'alipay' }">
              <input v-model="paymentMethod" type="radio" name="payment" value="alipay" />
              <div class="radio-content">
                <div class="radio-title">💙 支付宝</div>
              </div>
            </label>
          </div>

          <!-- Credit Card Fields -->
          <div v-if="paymentMethod === 'credit-card'" class="payment-fields">
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
            <div v-if="errors.cardNumber" class="error-message">{{ errors.cardNumber }}</div>

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
        <button class="submit-btn" @click="submitOrder" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交订单' }}
        </button>
      </div>

      <!-- Right Section - Order Summary -->
      <div class="order-summary-section">
        <h2 class="summary-title">订单详情</h2>

        <!-- Product Items -->
        <div class="product-items">
          <div v-for="item in cartStore.selectedItems" :key="item.id" class="product-item">
            <div class="product-image">
              <img
                v-if="item.image_url || item.image"
                :src="item.image_url || item.image"
                :alt="item.name"
              />
              <div v-else class="image-placeholder">🍎</div>
            </div>
            <div class="product-info">
              <div class="product-name">{{ item.name }}</div>
              <div class="product-quantity">{{ item.quantity }} × ¥{{ item.price.toFixed(2) }}</div>
            </div>
            <div class="product-price">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>

        <!-- Cost Breakdown -->
        <div class="cost-breakdown">
          <div class="cost-row">
            <span class="cost-label">小计 ({{ cartStore.selectedCount }} 件商品)</span>
            <span class="cost-value">¥{{ cartStore.selectedTotal.toFixed(2) }}</span>
          </div>
          <div class="cost-row">
            <span class="cost-label">运费</span>
            <span class="cost-value">
              {{ shippingCost === 0 ? '免费' : `¥${shippingCost.toFixed(2)}` }}
            </span>
          </div>
          <div v-if="discount > 0" class="cost-row">
            <span class="cost-label">优惠</span>
            <span class="cost-value discount">-¥{{ discount.toFixed(2) }}</span>
          </div>
          <div class="cost-row total">
            <span class="cost-label">总计</span>
            <span class="cost-value">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Order Tips -->
        <div class="order-tips">
          <p class="tip-item">✓ 所有商品均为新鲜配送</p>
          <p class="tip-item">✓ 支持7天无理由退货</p>
          <p class="tip-item">✓ 满¥50免运费</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '../stores/cartStore'
import { useOrderStore } from '../stores/orderStore'
import { useUserStore } from '../stores/userStore'
import { useAddressStore } from '../stores/addressStore'
import AddressSelector from '../components/AddressSelector.vue'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const userStore = useUserStore()
const addressStore = useAddressStore()

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

// 运费计算
const shippingCost = computed(() => {
  // 满50免运费
  if (cartStore.selectedTotal >= 50) {
    return 0
  }
  return deliveryMethod.value === 'express' ? 10.0 : 5.0
})

// 总金额计算
const totalAmount = computed(() => {
  return cartStore.selectedTotal + shippingCost.value - discount.value
})

// 页面加载时检查购物车
onMounted(() => {
  if (cartStore.selectedItems.length === 0) {
    console.warn('没有选中的商品')
  }
})

// 地址选择变化
const onAddressChange = (address) => {
  selectedAddress.value = address
  // 清空地址错误
  errors.value.address = ''
}

// 表单验证
const validateForm = () => {
  // 清空之前的错误
  Object.keys(errors.value).forEach((key) => {
    errors.value[key] = ''
  })

  let isValid = true

  // 验证地址
  if (!selectedAddress.value) {
    errors.value.address = '请选择收货地址'
    isValid = false
  }

  // 如果选择信用卡支付，验证卡信息
  if (paymentMethod.value === 'credit-card') {
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
      items: cartStore.selectedItems.map((item) => ({
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
      remark: '',
    }

    console.log('提交订单数据:', orderData)

    // 创建订单
    const result = await orderStore.createOrder(orderData)

    // 只清除已购买的商品（已选中的商品）
    await cartStore.removeSelectedItems()

    ElMessage.success('订单提交成功！')

    // 跳转到订单详情页
    if (result && result.order_id) {
      router.push(`/orders/${result.order_id}`)
    } else {
      // 如果没有返回订单ID，跳转到个人中心
      router.push('/profile')
    }
  } catch (error) {
    console.error('订单提交失败:', error)
    ElMessage.error('订单提交失败，请重试：' + (error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  font-size: 80px;
  margin-bottom: 24px;
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

.back-to-cart-btn {
  padding: 12px 32px;
  background-color: #2d5a27;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-to-cart-btn:hover {
  background-color: #1e3d1a;
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
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

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 16px;
  background-color: #2d5a27;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #1e3d1a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(45, 90, 39, 0.2);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #999999;
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
  font-size: 24px;
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
