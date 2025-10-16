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
          <button class="cart-btn" @click="router.push('/cart')">Cart (3)</button>
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
      <a href="#" class="breadcrumb-link">购物车</a>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">结账</span>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Section - Checkout Form -->
      <div class="checkout-form-section">
        <h1 class="checkout-title">结账</h1>

        <!-- Shipping Address -->
        <div class="form-section">
          <h2 class="section-title">送货地址</h2>
          <div class="form-row">
            <input
              type="text"
              placeholder="Full Name"
              class="form-input full-width"
            />
          </div>
          <div class="form-row">
            <input
              type="text"
              placeholder="Address"
              class="form-input full-width"
            />
          </div>
          <div class="form-row">
            <input
              type="text"
              placeholder="City"
              class="form-input full-width"
            />
          </div>
          <div class="form-row">
            <input
              type="text"
              placeholder="State"
              class="form-input half-width"
            />
            <input
              type="text"
              placeholder="Zip Code"
              class="form-input half-width"
            />
          </div>
        </div>

        <!-- Delivery Method -->
        <div class="form-section">
          <h2 class="section-title">配送时效</h2>
          <div class="radio-group">
            <label class="radio-option selected">
              <input type="radio" name="delivery" value="standard" checked />
              <div class="radio-content">
                <div class="radio-title">标准配送</div>
                <div class="radio-description">
                  3-5个工作日内送达
                </div>
              </div>
            </label>
            <label class="radio-option">
              <input type="radio" name="delivery" value="express" />
              <div class="radio-content">
                <div class="radio-title">特快配送</div>
                <div class="radio-description">
                  1-2 个工作日内送达
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="form-section">
          <h2 class="section-title">付款方式</h2>
          <div class="radio-group">
            <label class="radio-option selected">
              <input type="radio" name="payment" value="credit" checked />
              <div class="radio-content">
                <div class="radio-title">信用卡</div>
              </div>
            </label>
            <label class="radio-option">
              <input type="radio" name="payment" value="paypal" />
              <div class="radio-content">
                <div class="radio-title">PayPal</div>
              </div>
            </label>
          </div>
          <div class="payment-fields">
            <div class="form-row">
              <input
                type="text"
                placeholder="Card Number"
                class="form-input full-width"
              />
            </div>
            <div class="form-row">
              <input
                type="text"
                placeholder="Expiration Date"
                class="form-input half-width"
              />
              <input
                type="text"
                placeholder="CVV"
                class="form-input half-width"
              />
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button class="submit-btn" @click="router.push('/orders/1')">提交订单</button>
      </div>

      <!-- Right Section - Order Summary -->
      <div class="order-summary-section">
        <h2 class="summary-title">订单详情</h2>

        <!-- Product Items -->
        <div class="product-items">
          <div class="product-item">
            <div class="product-image">
              <div class="image-placeholder apple">🍎</div>
            </div>
            <div class="product-info">
              <div class="product-quantity">2 个 苹果</div>
              <div class="product-name">有机苹果</div>
            </div>
          </div>

          <div class="product-item">
            <div class="product-image">
              <div class="image-placeholder banana">🍌</div>
            </div>
            <div class="product-info">
              <div class="product-quantity">3 个 香蕉</div>
              <div class="product-name">有机香蕉</div>
            </div>
          </div>

          <div class="product-item">
            <div class="product-image">
              <div class="image-placeholder carrot">🥕</div>
            </div>
            <div class="product-info">
              <div class="product-quantity">1 根胡萝卜
                </div>
              <div class="product-name">有机胡萝卜</div>
            </div>
          </div>
        </div>

        <!-- Cost Breakdown -->
        <div class="cost-breakdown">
          <div class="cost-row">
            <span class="cost-label">小计</span>
            <span class="cost-value">$25.00</span>
          </div>
          <div class="cost-row">
            <span class="cost-label">运费</span>
            <span class="cost-value">$5.00</span>
          </div>
          <div class="cost-row">
            <span class="cost-label">优惠</span>
            <span class="cost-value discount">-$2.50</span>
          </div>
          <div class="cost-row total">
            <span class="cost-label">总计</span>
            <span class="cost-value">$27.50</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { useOrderStore } from '../stores/orderStore'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const userStore = useUserStore()
console.log(userStore)

const shippingInfo = ref({
  name: '',
  address: '',
  city: '',
  state: '',
  zipCode: ''
})


const deliveryMethod = ref('standard')
const paymentMethod = ref('credit-card')

const cardInfo = ref({
  number: '',
  expiry: '',
  cvv: ''
})

const discount = ref(2.50)

const shippingCost = computed(() => {
  return deliveryMethod.value === 'express' ? 5.00 : 0.00
})

const totalAmount = computed(() => {
  return cartStore.subtotal + shippingCost.value - discount.value
})

const submitOrder = async () => {
  if (!shippingInfo.value.name || !shippingInfo.value.address) {
    alert('Please fill in all shipping information')
    return
  }

  if (paymentMethod.value === 'credit-card' && !cardInfo.value.number) {
    alert('Please enter your card details')
    return
  }

  try {
    const orderData = {
      items: cartStore.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      shippingAddress: shippingInfo.value,
      deliveryMethod: deliveryMethod.value,
      paymentMethod: paymentMethod.value,
      subtotal: cartStore.subtotal,
      shipping: shippingCost.value,
      discount: discount.value,
      total: totalAmount.value
    }

    const order = await orderStore.createOrder(orderData)
    cartStore.clearCart()
    
    alert('Order placed successfully!')
    router.push(`/orders/${order._id}`)
  } catch (error) {
    alert('Failed to place order. Please try again.')
    console.error(error)
  }
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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

.radio-option input[type="radio"] {
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
  transition: background-color 0.2s;
  margin-top: 16px;
}

.submit-btn:hover {
  background-color: #1e3d1a;
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
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff8e1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  font-size: 24px;
}

.product-info {
  flex: 1;
}

.product-quantity {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
}

.product-name {
  font-size: 14px;
  color: #666666;
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
