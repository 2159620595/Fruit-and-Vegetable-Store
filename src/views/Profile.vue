<!-- src/views/Profile.vue -->
<template>
  <div class="profile-page">
    <!-- Header -->

    <!-- Main Content -->
    <div class="main-content">
      <!-- 面包屑导航 -->
      <Breadcrumb current-page="个人中心" />

      <!-- User Profile Section -->
      <div class="user-profile-section">
        <div class="user-avatar">
          <img
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iNjAiIGZpbGw9IiNGNUY1RjUiLz4KPGNpcmNsZSBjeD0iNjAiIGN5PSI0NSIgcj0iMjAiIGZpbGw9IiM2NjY2NjYiLz4KPHBhdGggZD0iTTMwIDkwQzMwIDc1LjY0MDYgNDEuNjQwNiA2NCA1NiA2NEg2NEM3OC4zNTk0IDY0IDkwIDc1LjY0MDYgOTAgOTBIMzBaIiBmaWxsPSIjNjY2NjY2Ii8+Cjwvc3ZnPgo="
            alt="User Avatar"
          />
        </div>
        <h2 class="user-name">艾米丽·卡特</h2>
        <p class="member-since">自 2022 年起成为会员</p>
      </div>

      <!-- My Orders Section -->
      <div class="orders-section">
        <h3 class="section-title">我的订单</h3>
        <div class="order-tabs">
          <button class="tab-btn active" @click="setActiveTab('toPay')">
            <span class="tab-icon">🕐</span>
            <span class="tab-text">待支付</span>
          </button>
          <button class="tab-btn" @click="setActiveTab('toShip')">
            <span class="tab-icon">🚚</span>
            <span class="tab-text">待发货</span>
          </button>
          <button class="tab-btn" @click="setActiveTab('toReceive')">
            <span class="tab-icon">📦</span>
            <span class="tab-text">已发货</span>
          </button>
          <button class="tab-btn" @click="setActiveTab('toReview')">
            <span class="tab-icon">⭐</span>
            <span class="tab-text"> 待评价</span>
          </button>
        </div>
      </div>

      <!-- Tools Section -->
      <!-- <div class="tools-section">
        <h3 class="section-title">Tools</h3>
        <div class="tools-grid">
          <button class="tool-btn">
            <span class="tool-icon">🚚</span>
            <span class="tool-text">Track My Order</span>
          </button>
          <button class="tool-btn">
            <span class="tool-icon">🔖</span>
            <span class="tool-text">My Favorites</span>
          </button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores/userStore'
import { useOrderStore } from '../stores/orderStore'
import ProductCard from '../components/ProductCard.vue'
import Breadcrumb from '../components/Breadcrumb.vue'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

const activeTab = ref('orders')
const orderFilter = ref('all')
const orders = ref([])
const favorites = ref([])

const profileData = ref({
  username: '',
  email: '',
  phone: '',
})

const memberYear = computed(() => {
  return new Date(userStore.user?.memberSince || '2022').getFullYear()
})

const filteredOrders = computed(() => {
  if (orderFilter.value === 'all') return orders.value
  return orders.value.filter((order) => order.status === orderFilter.value)
})

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消
  }
}

const updateProfile = async () => {
  try {
    await userStore.updateProfile(profileData.value)
    ElMessage.success('个人信息更新成功！')
  } catch (error) {
    ElMessage.error('个人信息更新失败：' + error)
  }
}

onMounted(async () => {
  try {
    orders.value = await orderStore.fetchOrders()
    if (userStore.user) {
      profileData.value = { ...userStore.user }
    }
  } catch (error) {
    console.error('Failed to load profile data', error)
  }
})
</script>
<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  color: #000000;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #000000;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #2d5a27;
}

.search-bar {
  flex: 1;
  max-width: 300px;
  margin: 0 32px;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f0f8f0;
  border-radius: 8px;
  padding: 8px 12px;
}

.search-icon {
  margin-right: 8px;
  color: #666666;
}

.search-input input {
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
  font-size: 14px;
}

.cart-btn {
  width: 40px;
  height: 40px;
  border: none;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 16px;
}

.cart-btn:hover {
  background-color: #e5e5e5;
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* User Profile Section */
.user-profile-section {
  display: flex;
  flex-direction: column;
  max-height: 100px;
  text-align: center;
  margin-bottom: 48px;
}

.user-avatar {
  width: 50px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto;
  overflow: hidden;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
}

.member-since {
  font-size: 12px;
  color: #2d5a27;
  margin: 0;
}

/* Orders Section */
.orders-section {
  margin-bottom: 48px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 24px 0;
}

.order-tabs {
  display: flex;

  gap: 0;
  border-bottom: 1px solid #e5e5e5;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  min-width: 120px;
}

.tab-btn.active {
  color: #000000;
}

.tab-btn:not(.active) {
  color: #2d5a27;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #000000;
}

.tab-icon {
  font-size: 20px;
}

.tab-text {
  font-size: 14px;
  font-weight: 500;
}

/* Tools Section */
.tools-section {
  margin-bottom: 48px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.tool-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.tool-icon {
  font-size: 24px;
  color: #2d5a27;
}

.tool-text {
  font-size: 16px;
  font-weight: 500;
  color: #000000;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .nav-links {
    gap: 16px;
  }

  .search-bar {
    margin: 0;
    max-width: none;
  }

  .main-content {
    padding: 24px 16px;
  }

  .user-name {
    font-size: 20px;
  }

  .order-tabs {
    flex-wrap: wrap;
  }

  .tab-btn {
    min-width: 100px;
    padding: 12px 16px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .order-tabs {
    flex-direction: column;
  }

  .tab-btn {
    flex-direction: row;
    justify-content: flex-start;
    min-width: auto;
    padding: 16px;
  }

  .tab-btn.active::after {
    display: none;
  }

  .tab-btn.active {
    background-color: #f0f0f0;
  }
}
</style>
