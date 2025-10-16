<template>
  <div class="cart-page">
    <div class="root">
      <div class="container">
        <Back></Back>
        <!-- 主内容区开始 -->
        <div class="main">
          <div class="main-content">
            <!-- 标题 -->
            <div class="page-title">
              <p>您的购物车</p>
            </div>

            <!-- 购物车表格 -->
            <div class="cart-table-wrapper">
              <div class="cart-table-container">
                <table class="cart-table">
                  <thead>
                    <tr>
                      <th class="col-product">商品</th>
                      <th class="col-price">价格</th>
                      <th class="col-quantity">数量</th>
                      <th class="col-subtotal">小计</th>
                      <th class="col-actions">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="cartItems.length === 0">
                      <td colspan="5" style="text-align: center; padding: 40px; color: #999">
                        购物车为空，快去添加商品吧~
                      </td>
                    </tr>
                    <tr v-for="item in cartItems" :key="item.id" class="cart-row">
                      <td class="col-product">
                        <div class="product-info">
                          <div
                            class="product-image"
                            :style="{ backgroundImage: `url(${item.image})` }"
                          ></div>
                          <span class="product-name">{{ item.name }}</span>
                        </div>
                      </td>
                      <td class="col-price">{{ item.price }}</td>
                      <td class="col-quantity">
                        <div class="quantity-controls">
                          <button
                            @click="updateQuantity(item.id, item.quantity - 1)"
                            :disabled="item.quantity <= 1"
                          >
                            -
                          </button>
                          <span>{{ item.quantity }}</span>
                          <button @click="updateQuantity(item.id, item.quantity + 1)">+</button>
                        </div>
                      </td>
                      <td class="col-subtotal">{{ item.subtotal }}</td>
                      <td class="col-actions">
                        <button class="remove-btn" @click="removeItem(item.id)">删除</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 订单汇总 -->
            <h3 class="summary-title">订单汇总</h3>
            <div class="summary-content">
              <div class="summary-row">
                <p class="summary-label">小计</p>
                <p class="summary-value">{{ orderSummary.subtotal }}</p>
              </div>
              <div class="summary-row">
                <p class="summary-label">运费</p>
                <p class="summary-value">{{ orderSummary.shipping }}</p>
              </div>
              <div class="summary-row">
                <p class="summary-label">总计</p>
                <p class="summary-value">{{ orderSummary.total }}</p>
              </div>
            </div>

            <!-- 按钮组 -->
            <div class="action-buttons">
              <div class="button-container">
                <button class="continue-btn" @click="continueShopping">继续购物</button>
                <button class="checkout-btn" @click="checkout">结账</button>
              </div>
            </div>
          </div>
        </div>
        <!-- 主内容区结束 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import router from '@/router'
import { computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import Back from '../components/Back.vue'

const cartStore = useCartStore()

const cartItems = computed(() => {
  return cartStore.items.map((item) => ({
    ...item,
    price: `$${item.price}`,
    subtotal: `$${(item.price * item.quantity).toFixed(2)}`,
    image: item.image_url || item.image,
  }))
})

const orderSummary = computed(() => {
  const subtotal = cartStore.subtotal.toFixed(2)
  return {
    subtotal: `$${subtotal}`,
    shipping: '免费',
    total: `$${subtotal}`,
  }
})

const continueShopping = () => {
  router.push('/shop')
}

const checkout = () => {
  if (cartStore.items.length === 0) {
    alert('购物车为空，请先添加商品')
    return
  }
  router.push('/checkout')
}

const removeItem = (id) => {
  if (confirm('确定要删除这个商品吗？')) {
    cartStore.removeFromCart(id)
  }
}

const updateQuantity = (id, quantity) => {
  cartStore.updateQuantity(id, quantity)
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.cart-page {
  background-color: #ffffff;
  min-height: 100vh;
}

.root {
  font-family: Epilogue, 'Noto Sans', sans-serif;
  position: relative;
  align-items: center;
  display: flex;
  width: 100%;
  min-height: 100vh;
  flex-direction: column;
  background-color: #ffffff;
  overflow-x: hidden;
}

.container {
  display: flex;
  height: 100%;
  flex-grow: 1;
  flex-direction: column;
}

/* Header 样式 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  border-bottom: 1px solid #f0f4f0;
  padding: 12px 40px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #111811;
}

.nav-logo {
  width: 16px;
  height: 16px;
  color: #111811;
}

.nav h2 {
  color: #111811;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 36px;
}

.nav-links a {
  color: #111811;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  text-decoration: none;
}

.header-right {
  display: flex;
  flex: 1;
  justify-content: flex-end;
  gap: 32px;
}

.search-wrapper {
  display: flex;
  flex-direction: column;
  min-width: 160px;
  height: 40px;
  max-width: 256px;
}

.search-container {
  display: flex;
  width: 100%;
  flex: 1;
  align-items: stretch;
  border-radius: 8px;
  height: 100%;
}

.search-icon {
  color: #618961;
  display: flex;
  border: none;
  background-color: #f0f4f0;
  align-items: center;
  justify-content: center;
  padding-left: 16px;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  border-right: 0;
}

.search-input {
  display: flex;
  width: 100%;
  min-width: 0;
  flex: 1;
  resize: none;
  overflow: hidden;
  border-radius: 8px;
  color: #111811;
  outline: none;
  border: none;
  background-color: #f0f4f0;
  height: 100%;
  padding: 0 16px 0 8px;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 0;
}

.search-input::placeholder {
  color: #618961;
}

.cart-btn {
  display: flex;
  min-width: 84px;
  max-width: 480px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  height: 40px;
  padding: 0 16px;
  background-color: #f0f4f0;
  color: #111811;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.015em;
  border: none;
}

/* 主内容区 */
.main {
  padding: 0 160px;
  display: flex;
  flex: 1;
  justify-content: center;
  padding-top: 20px;
}

.main-content {
  display: flex;
  flex-direction: column;
  max-width: 960px;
  flex: 1;
}

.page-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
}

.page-title p {
  color: #111811;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  min-width: 288px;
}

/* 购物车表格 */
.cart-table-wrapper {
  padding: 12px 16px;
}

.cart-table-container {
  display: flex;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #dbe6db;
  background-color: #ffffff;
}

.cart-table {
  flex: 1;
  border-collapse: collapse;
  width: 100%;
}

.cart-table thead tr {
  background-color: #ffffff;
}

.cart-table th {
  padding: 12px 16px;
  text-align: left;
  color: #111811;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

.col-product {
  width: 400px;
}

.col-price {
  width: 150px;
}

.col-quantity {
  width: 150px;
}

.col-subtotal {
  width: 150px;
}

.col-actions {
  width: 100px;
}

.cart-row {
  border-top: 1px solid #dbe6db;
}

.cart-table td {
  height: 72px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  background-position: center;
  background-repeat: no-repeat;
  aspect-ratio: 1;
  background-size: cover;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.product-name {
  color: #111811;
}

.col-price,
.col-quantity,
.col-subtotal {
  color: #618961;
}

/* 数量控件 */
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-controls button {
  width: 24px;
  height: 24px;
  border: 1px solid #dbe6db;
  background-color: #f0f4f0;
  border-radius: 4px;
  cursor: pointer;
  color: #111811;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-controls button:hover:not(:disabled) {
  background-color: #e5ebe5;
}

.quantity-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-controls span {
  min-width: 30px;
  text-align: center;
}

/* 删除按钮 */
.remove-btn {
  background-color: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}

.remove-btn:hover {
  color: #c82333;
}

/* 订单汇总 */
.summary-title {
  color: #111811;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  padding: 16px 16px 8px;
}

.summary-content {
  padding: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 8px 0;
}

.summary-label {
  color: #618961;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
}

.summary-value {
  color: #111811;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  text-align: right;
}

/* 按钮组 */
.action-buttons {
  display: flex;
  justify-content: stretch;
}

.button-container {
  display: flex;
  flex: 1;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  justify-content: space-between;
}

.continue-btn,
.checkout-btn {
  display: flex;
  min-width: 84px;
  max-width: 480px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.015em;
  border: none;
}

.continue-btn {
  background-color: #f0f4f0;
  color: #111811;
}

.continue-btn:hover {
  background-color: #e5ebe5;
}

.checkout-btn {
  background-color: #11d411;
  color: #111811;
}

.checkout-btn:hover {
  background-color: #0ec50e;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main {
    padding: 0 80px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 12px 20px;
  }

  .header-left {
    gap: 16px;
  }

  .nav-links {
    display: none;
  }

  .main {
    padding: 0 20px;
  }

  .cart-table-wrapper {
    overflow-x: auto;
  }

  .cart-table {
    min-width: 600px;
  }

  .button-container {
    flex-direction: column;
  }

  .continue-btn,
  .checkout-btn {
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .page-title p {
    font-size: 24px;
  }

  .search-wrapper {
    min-width: 120px;
  }

  .col-product {
    width: 250px;
  }
}
</style>
