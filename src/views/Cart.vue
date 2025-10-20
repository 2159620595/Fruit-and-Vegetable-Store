<template>
  <div class="cart-page">
    <div class="container">
      <!-- 面包屑导航 -->
      <Breadcrumb current-page="购物车" />
      <!-- 主内容区开始 -->
      <div class="main">
        <div class="main-content">
          <!-- 标题和批量操作 -->
          <div class="page-title">
            <p>您的购物车</p>
            <div class="batch-actions" v-if="cartItems.length > 0">
              <el-button
                type="danger"
                plain
                @click="handleBatchDelete"
                :disabled="!cartStore.hasSelected"
                :icon="Delete"
              >
                删除选中
              </el-button>
              <el-button
                type="warning"
                plain
                @click="handleClearCart"
                :icon="Delete"
              >
                清空购物车
              </el-button>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="cartStore.loading" class="loading-state">
            <p>加载中...</p>
          </div>

          <!-- 错误提示 -->
          <div v-else-if="cartStore.error" class="error-state">
            <p>{{ cartStore.error }}</p>
            <el-button type="primary" @click="reloadCart">重新加载</el-button>
          </div>

          <!-- 购物车表格 -->
          <div v-else class="cart-table-wrapper">
            <div class="cart-table-container">
              <table class="cart-table">
                <thead>
                  <tr>
                    <th class="col-select">
                      <input
                        type="checkbox"
                        :checked="cartStore.isAllSelected"
                        @change="toggleAllSelected"
                        :disabled="cartItems.length === 0"
                      />
                    </th>
                    <th class="col-product">商品</th>
                    <th class="col-price">价格</th>
                    <th class="col-quantity">数量</th>
                    <th class="col-subtotal">小计</th>
                    <th class="col-actions">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="cartItems.length === 0">
                    <td
                      colspan="6"
                      style="text-align: center; padding: 40px; color: #999"
                    >
                      购物车为空，快去添加商品吧~
                    </td>
                  </tr>
                  <tr
                    v-for="item in cartItems"
                    :key="item.id"
                    class="cart-row"
                    :class="{ selected: item.selected }"
                  >
                    <td class="col-select">
                      <input
                        type="checkbox"
                        :checked="item.selected"
                        @change="toggleItemSelected(item.id)"
                      />
                    </td>
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
                        <el-button
                          @click="updateQuantity(item.id, item.quantity - 1)"
                          :disabled="item.quantity <= 1"
                          size="small"
                          :icon="Minus"
                          circle
                        />
                        <input
                          type="number"
                          v-model.number="item.quantity"
                          @change="updateQuantity(item.id, item.quantity)"
                          min="1"
                          max="999"
                        />
                        <el-button
                          @click="updateQuantity(item.id, item.quantity + 1)"
                          size="small"
                          :icon="Plus"
                          circle
                        />
                      </div>
                    </td>
                    <td class="col-subtotal">{{ item.subtotal }}</td>
                    <td class="col-actions">
                      <el-button
                        type="danger"
                        text
                        @click="removeItem(item.id)"
                        :icon="Delete"
                      >
                        删除
                      </el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 订单汇总 -->
          <div v-if="cartItems.length > 0" class="summary-wrapper">
            <el-card class="summary-card" shadow="hover">
              <template #header>
                <div class="summary-header">
                  <span class="summary-title">订单汇总</span>
                </div>
              </template>
              <div class="summary-content">
                <div class="summary-row">
                  <p class="summary-label">
                    小计 ({{ cartStore.selectedCount }} 件已选商品)
                  </p>
                  <p class="summary-value">{{ orderSummary.subtotal }}</p>
                </div>
                <div class="summary-row">
                  <p class="summary-label">运费</p>
                  <div class="shipping-info">
                    <p class="summary-value">{{ orderSummary.shipping }}</p>
                    <p v-if="orderSummary.shippingTip" class="shipping-tip">
                      {{ orderSummary.shippingTip }}
                    </p>
                  </div>
                </div>
                <el-divider />
                <div class="summary-row total-row">
                  <p class="summary-label">总计</p>
                  <p class="summary-value total-value">
                    {{ orderSummary.total }}
                  </p>
                </div>
              </div>
            </el-card>

            <!-- 按钮组 -->
            <div class="action-buttons">
              <el-button
                @click="continueShopping"
                :icon="Back"
                size="large"
                plain
              >
                继续购物
              </el-button>
              <el-button
                type="success"
                @click="checkout"
                :disabled="!cartStore.hasSelected"
                :icon="ShoppingCart"
                size="large"
              >
                结账 ({{ cartStore.selectedCount }})
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <!-- 主内容区结束 -->
    </div>
  </div>
</template>

<script setup>
// 组件名称
defineOptions({
  name: 'CartPage',
})
import router from '@/router'
import { computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Minus,
  Delete,
  Back,
  ShoppingCart,
} from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cartStore'
import Breadcrumb from '../components/Breadcrumb.vue'
import {
  calculateShippingFee,
  formatShippingFee,
  calculateFreeShippingRemaining,
} from '@/config/shipping'

const cartStore = useCartStore()

// 组件挂载时加载购物车数据
onMounted(async () => {
  await cartStore.fetchCartList()
})

// 购物车商品列表（格式化显示）
const cartItems = computed(() => {
  return cartStore.items.map(item => ({
    ...item,
    price: `¥${item.price}`,
    subtotal: `¥${(item.price * item.quantity).toFixed(2)}`,
    image: item.image_url || item.image,
  }))
})

// 订单汇总（基于已选中的商品）
const orderSummary = computed(() => {
  const subtotal = cartStore.selectedTotal
  const shippingFee = calculateShippingFee(subtotal)
  const remaining = calculateFreeShippingRemaining(subtotal)
  const total = subtotal + shippingFee

  return {
    subtotal: `¥${subtotal.toFixed(2)}`,
    shipping: formatShippingFee(shippingFee),
    shippingTip: remaining > 0 ? `再购¥${remaining.toFixed(2)}即可免运费` : '',
    total: `¥${total.toFixed(2)}`,
    rawShipping: shippingFee,
    rawTotal: total,
  }
})

// 继续购物
const continueShopping = () => {
  router.push('/shop')
}

// 结账
const checkout = () => {
  if (cartStore.items.length === 0) {
    ElMessage.warning('购物车为空，请先添加商品')
    return
  }

  if (!cartStore.hasSelected) {
    ElMessage.warning('请先选择要结账的商品')
    return
  }

  // 跳转到结账页面
  router.push('/checkout')
}

// 删除单个商品
const removeItem = async id => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await cartStore.removeFromCart(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 更新商品数量
const updateQuantity = async (id, quantity) => {
  // 确保数量至少为1
  const validQuantity = Math.max(1, Math.min(999, parseInt(quantity) || 1))
  await cartStore.updateQuantity(id, validQuantity)
}

// 切换商品选中状态
const toggleItemSelected = async id => {
  await cartStore.toggleItemSelected(id)
}

// 全选/取消全选
const toggleAllSelected = async () => {
  await cartStore.toggleAllSelected()
}

// 批量删除选中商品
const handleBatchDelete = async () => {
  if (!cartStore.hasSelected) {
    ElMessage.warning('请先选择要删除的商品')
    return
  }

  const selectedCount = cartStore.selectedCount
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCount} 件商品吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await cartStore.removeSelectedItems()
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 清空购物车
const handleClearCart = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空购物车吗？此操作不可恢复！',
      '清空购物车',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
      }
    )
    await cartStore.clearCart()
    ElMessage.success('购物车已清空')
  } catch {
    // 用户取消
  }
}

// 重新加载购物车
const reloadCart = async () => {
  await cartStore.fetchCartList()
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

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
  align-items: center;
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

/* 批量操作按钮 */
.batch-actions {
  display: flex;
  gap: 8px;
}

/* 加载和错误状态 */
.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state p {
  color: #618961;
  font-size: 16px;
}

.error-state p {
  color: #dc3545;
  font-size: 16px;
  margin-bottom: 16px;
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

.col-select {
  width: 50px;
  text-align: center;
}

.col-select input[type='checkbox'] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #11d411;
}

.col-product {
  width: 350px;
}

.col-price {
  width: 120px;
}

.col-quantity {
  width: 150px;
}

.col-subtotal {
  width: 120px;
}

.col-actions {
  width: 100px;
}

.cart-row {
  border-top: 1px solid #dbe6db;
  transition: background-color 0.2s;
}

.cart-row.selected {
  background-color: #f8fdf8;
}

.cart-row:hover {
  background-color: #fafbfa;
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
  gap: 6px;
}

.quantity-controls .quantity-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #dbe6db;
  background-color: #f0f4f0;
  border-radius: 4px;
  cursor: pointer;
  color: #67c23a;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.quantity-controls .quantity-btn:hover:not(:disabled) {
  background-color: #67c23a;
  border-color: #67c23a;
  color: white;
  transform: scale(1.05);
}

.quantity-controls .quantity-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity-controls input[type='number'] {
  width: 50px;
  height: 28px;
  text-align: center;
  border: 1px solid #dbe6db;
  border-radius: 4px;
  background-color: #ffffff;
  color: #111811;
  font-size: 14px;
  font-weight: 500;
  padding: 0 4px;
  outline: none;
}

.quantity-controls input[type='number']:focus {
  border-color: #11d411;
}

/* 隐藏数字输入框的上下箭头 */
.quantity-controls input[type='number']::-webkit-inner-spin-button,
.quantity-controls input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

.quantity-controls input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* 删除按钮 */
.remove-btn {
  background-color: transparent;
  border: none;
  color: #f56c6c;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.remove-btn:hover {
  color: #f56c6c;
  transform: scale(1.05);
}

.remove-btn .el-icon {
  font-size: 16px;
}

/* 订单汇总 */
.summary-wrapper {
  margin-top: 24px;
}

.summary-card {
  border-radius: 12px;
}

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-title {
  color: #111811;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
}

.summary-content {
  padding: 0;
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

.shipping-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.shipping-tip {
  font-size: 12px;
  color: #67c23a;
  font-weight: 500;
  margin: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.total-row {
  padding-top: 16px;
  margin-top: 8px;
}

.total-row .summary-label {
  font-size: 18px;
  font-weight: 600;
  color: #111811;
}

.total-row .total-value {
  font-size: 24px;
  font-weight: 700;
  color: #67c23a;
}

/* 按钮组 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
  margin-top: 20px;
  border-top: 2px solid #f0f0f0;
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

  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons .el-button {
    width: 100%;
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
