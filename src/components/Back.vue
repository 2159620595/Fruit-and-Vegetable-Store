<template>
  <div class="header-actions">
          <button class="cart-btn" data-v-4ad9e8f0 @click="router.go(-1)">返回</button>
        </div>
</template>

<script setup>
import router from '@/router'
</script>

<style scoped>
/* 返回按钮 */
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
</style>