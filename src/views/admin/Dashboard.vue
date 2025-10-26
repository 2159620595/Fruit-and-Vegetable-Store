<!-- 后台控制台 -->
<template>
  <div class="dashboard">
    <h1 class="page-title">控制台</h1>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6f7ff">
              <el-icon color="#1890ff" :size="32"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.productCount }}</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f0f5ff">
              <el-icon color="#597ef7" :size="32"><DocumentCopy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.orderCount }}</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f6ffed">
              <el-icon color="#52c41a" :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.userCount }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fff7e6">
              <el-icon color="#fa8c16" :size="32"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ (stats.totalRevenue || 0).toFixed(2) }}</div>
              <div class="stat-label">总收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-card class="quick-links" shadow="hover">
      <template #header>
        <span class="card-header">快捷入口</span>
      </template>
      <el-row :gutter="20">
        <el-col :xs="12" :sm="8" :md="6">
          <div class="quick-link" @click="$router.push('/admin/products')">
            <el-icon :size="28" color="#1890ff"><ShoppingCart /></el-icon>
            <span>商品管理</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6">
          <div class="quick-link" @click="$router.push('/admin/orders')">
            <el-icon :size="28" color="#597ef7"><DocumentCopy /></el-icon>
            <span>订单管理</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6">
          <div class="quick-link" @click="$router.push('/admin/users')">
            <el-icon :size="28" color="#52c41a"><User /></el-icon>
            <span>用户管理</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6">
          <div class="quick-link" @click="$router.push('/admin/reviews')">
            <el-icon :size="28" color="#fa8c16"><ChatDotRound /></el-icon>
            <span>评价管理</span>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  ShoppingCart,
  DocumentCopy,
  User,
  Money,
  ChatDotRound,
} from '@element-plus/icons-vue'
import { getAdminStats } from '@/api/admin'

// 统计数据
const stats = ref({
  productCount: 0,
  orderCount: 0,
  userCount: 0,
  totalRevenue: 0,
})

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getAdminStats()
    
    // 处理不同的数据返回格式
    let statsData = {}
    if (res.data?.data) {
      statsData = res.data.data
    } else if (res.data) {
      statsData = res.data
    }
    
    // 更新统计数据
    stats.value = {
      productCount: statsData.productCount || 0,
      orderCount: statsData.orderCount || 0,
      userCount: statsData.userCount || 0,
      totalRevenue: statsData.totalRevenue || 0,
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 保持默认值，不使用模拟数据
    stats.value = {
      productCount: 0,
      orderCount: 0,
      userCount: 0,
      totalRevenue: 0,
    }
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: #000;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #000;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.quick-links {
  margin-top: 24px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
}

.quick-link:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.quick-link span {
  margin-top: 12px;
  font-size: 14px;
  color: #333;
}
</style>

