<template>
  <div
    class="skeleton-loader"
    :class="[`skeleton-${type}`, { 'skeleton-animated': animated }]"
  >
    <!-- 文本骨架屏 -->
    <div
      v-if="type === 'text'"
      class="skeleton-text"
      :style="{ width: width, height: height }"
    >
      <div class="skeleton-shimmer"></div>
    </div>

    <!-- 矩形骨架屏 -->
    <div
      v-else-if="type === 'rect'"
      class="skeleton-rect"
      :style="{ width: width, height: height }"
    >
      <div class="skeleton-shimmer"></div>
    </div>

    <!-- 圆形骨架屏 -->
    <div
      v-else-if="type === 'circle'"
      class="skeleton-circle"
      :style="{ width: width, height: height }"
    >
      <div class="skeleton-shimmer"></div>
    </div>

    <!-- 卡片骨架屏 -->
    <div v-else-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-card-header">
        <div class="skeleton-circle skeleton-avatar"></div>
        <div class="skeleton-text skeleton-title"></div>
      </div>
      <div class="skeleton-card-content">
        <div class="skeleton-text skeleton-line"></div>
        <div class="skeleton-text skeleton-line"></div>
        <div class="skeleton-text skeleton-line short"></div>
      </div>
      <div class="skeleton-card-footer">
        <div class="skeleton-rect skeleton-button"></div>
        <div class="skeleton-rect skeleton-button"></div>
      </div>
    </div>

    <!-- 商品卡片骨架屏 -->
    <div v-else-if="type === 'product'" class="skeleton-product">
      <div class="skeleton-rect skeleton-image"></div>
      <div class="skeleton-product-info">
        <div class="skeleton-text skeleton-name"></div>
        <div class="skeleton-text skeleton-price"></div>
        <div class="skeleton-rect skeleton-button"></div>
      </div>
    </div>

    <!-- 列表骨架屏 -->
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="i in rows" :key="i" class="skeleton-list-item">
        <div class="skeleton-circle skeleton-avatar"></div>
        <div class="skeleton-list-content">
          <div class="skeleton-text skeleton-line"></div>
          <div class="skeleton-text skeleton-line short"></div>
        </div>
      </div>
    </div>

    <!-- 表格骨架屏 -->
    <div v-else-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div
          v-for="i in columns"
          :key="i"
          class="skeleton-text skeleton-header"
        ></div>
      </div>
      <div v-for="row in rows" :key="row" class="skeleton-table-row">
        <div
          v-for="col in columns"
          :key="col"
          class="skeleton-text skeleton-cell"
        ></div>
      </div>
    </div>

    <!-- 自定义骨架屏 -->
    <div v-else-if="type === 'custom'" class="skeleton-custom">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// 定义组件名称
defineOptions({
  name: 'SkeletonLoader',
})

// Props
const props = defineProps({
  // 骨架屏类型
  type: {
    type: String,
    default: 'text',
    validator: value =>
      [
        'text',
        'rect',
        'circle',
        'card',
        'product',
        'list',
        'table',
        'custom',
      ].includes(value),
  },
  // 宽度
  width: {
    type: String,
    default: '100%',
  },
  // 高度
  height: {
    type: String,
    default: '16px',
  },
  // 是否显示动画
  animated: {
    type: Boolean,
    default: true,
  },
  // 列表行数
  rows: {
    type: Number,
    default: 3,
  },
  // 表格列数
  columns: {
    type: Number,
    default: 4,
  },
})

// Emits
const emit = defineEmits(['loaded'])
</script>

<style scoped>
.skeleton-loader {
  position: relative;
  overflow: hidden;
}

/* 基础骨架屏样式 */
.skeleton-text,
.skeleton-rect,
.skeleton-circle {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  position: relative;
}

.skeleton-circle {
  border-radius: 50%;
}

/* 动画效果 */
.skeleton-animated .skeleton-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 卡片骨架屏 */
.skeleton-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
}

.skeleton-title {
  width: 120px;
  height: 20px;
}

.skeleton-card-content {
  margin-bottom: 16px;
}

.skeleton-line {
  width: 100%;
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-card-footer {
  display: flex;
  gap: 12px;
}

.skeleton-button {
  width: 80px;
  height: 32px;
  border-radius: 16px;
}

/* 商品卡片骨架屏 */
.skeleton-product {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton-image {
  width: 100%;
  height: 200px;
  border-radius: 0;
}

.skeleton-product-info {
  padding: 16px;
}

.skeleton-name {
  width: 80%;
  height: 18px;
  margin-bottom: 8px;
}

.skeleton-price {
  width: 60px;
  height: 20px;
  margin-bottom: 12px;
}

/* 列表骨架屏 */
.skeleton-list {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-list-item:last-child {
  border-bottom: none;
}

.skeleton-list-content {
  flex: 1;
}

/* 表格骨架屏 */
.skeleton-table {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton-table-header {
  display: flex;
  background: #f8f9fa;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.skeleton-table-row {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-table-row:last-child {
  border-bottom: none;
}

.skeleton-header,
.skeleton-cell {
  flex: 1;
  height: 16px;
  margin-right: 16px;
}

.skeleton-header:last-child,
.skeleton-cell:last-child {
  margin-right: 0;
}

/* 自定义骨架屏 */
.skeleton-custom {
  position: relative;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .skeleton-card {
    padding: 12px;
  }

  .skeleton-product-info {
    padding: 12px;
  }

  .skeleton-list {
    padding: 12px;
  }

  .skeleton-table-header,
  .skeleton-table-row {
    padding: 8px 12px;
  }

  .skeleton-image {
    height: 150px;
  }

  .skeleton-avatar {
    width: 32px;
    height: 32px;
  }

  .skeleton-title {
    width: 100px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .skeleton-card-footer {
    flex-direction: column;
    gap: 8px;
  }

  .skeleton-button {
    width: 100%;
  }

  .skeleton-table-header,
  .skeleton-table-row {
    flex-direction: column;
    gap: 8px;
  }

  .skeleton-header,
  .skeleton-cell {
    margin-right: 0;
    margin-bottom: 8px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .skeleton-text,
  .skeleton-rect,
  .skeleton-circle {
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
    background-size: 200% 100%;
  }

  .skeleton-card,
  .skeleton-list,
  .skeleton-table {
    background: #1a1a1a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .skeleton-table-header {
    background: #2a2a2a;
  }

  .skeleton-list-item {
    border-bottom-color: #3a3a3a;
  }

  .skeleton-table-row {
    border-bottom-color: #3a3a3a;
  }
}
</style>
