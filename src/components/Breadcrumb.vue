<template>
  <div class="breadcrumb-container">
    <div class="breadcrumb-content">
      <!-- 左侧面包屑导航 -->
      <nav class="breadcrumb">
        <span
          class="breadcrumb-item back-item"
          @click="goBack"
          title="返回上一页"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path
              d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"
            ></path>
          </svg>
          返回
        </span>
        <span class="separator">/</span>
        <router-link to="/">首页</router-link>
        <span class="separator">/</span>
        <router-link to="/shop">商城</router-link>
        <span class="separator">/</span>
        <span class="current">{{ currentPage }}</span>
      </nav>

      <!-- 右侧功能区域 -->
      <div class="breadcrumb-actions">
        <!-- 搜索框 -->
        <div class="search-container">
          <div class="search-bar">
            <span class="search-icon" @click="handleSearch">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                ></path>
              </svg>
            </span>
            <input
              type="text"
              placeholder="搜索商品..."
              v-model="searchKeyword"
              @keyup.enter="handleSearch"
              @focus="showSuggestions = true"
              @blur="handleBlur"
            />
            <button
              v-if="searchKeyword"
              class="clear-btn"
              @click="clearSearch"
              type="button"
            >
              ×
            </button>
          </div>

          <!-- 搜索建议下拉框 -->
          <div v-if="showSuggestions" class="search-suggestions">
            <!-- 搜索历史 -->
            <div
              v-if="searchStore.searchHistory.length > 0 && !searchKeyword"
              class="suggestion-section"
            >
              <div class="suggestion-header">
                <span>搜索历史</span>
                <button @click="clearHistory" class="clear-history-btn">
                  清空
                </button>
              </div>
              <div
                v-for="(item, index) in searchStore.searchHistory"
                :key="index"
                class="suggestion-item"
                @mousedown="selectSuggestion(item)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path
                    d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z"
                  ></path>
                </svg>
                <span>{{ item }}</span>
              </div>
            </div>

            <!-- 热门搜索 -->
            <div v-if="!searchKeyword" class="suggestion-section">
              <div class="suggestion-header">
                <span>热门搜索</span>
              </div>
              <div
                v-for="(item, index) in searchStore.hotSearches"
                :key="index"
                class="suggestion-item hot"
                @mousedown="selectSuggestion(item)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path
                    d="M173.79,51.48a221.25,221.25,0,0,0-41.67-34.34,8,8,0,0,0-8.24,0A221.25,221.25,0,0,0,82.21,51.48C54.59,80.48,40,112.47,40,144a88,88,0,0,0,176,0C216,112.47,201.41,80.48,173.79,51.48ZM96,184c0-27.67,22.53-47.28,32-54.3,9.48,7,32,26.63,32,54.3a32,32,0,0,1-64,0Z"
                  ></path>
                </svg>
                <span>{{ item }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 购物车按钮 -->
        <button
          class="action-btn cart-btn"
          @click="router.push('/cart')"
          title="购物车"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path
              d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z"
            ></path>
          </svg>
          <span v-if="cartStore.cartCount > 0" class="cart-badge">
            {{ cartStore.cartCount }}
          </span>
        </button>

        <!-- 用户菜单 -->
        <div class="user-menu-container">
          <button
            class="action-btn user-btn"
            @click="toggleUserMenu"
            title="用户中心"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"
              ></path>
            </svg>
            <span v-if="userStore.isLoggedIn" class="user-badge"></span>
          </button>

          <!-- 用户下拉菜单 -->
          <div v-if="showUserMenu" class="user-dropdown">
            <div v-if="userStore.isLoggedIn" class="user-info-section">
              <div class="user-greeting">
                <span class="greeting-text">你好，</span>
                <span class="username">
                  {{
                    userStore.user?.username || userStore.user?.name || '用户'
                  }}
                </span>
                <!-- 调试信息 -->
                <small
                  v-if="userStore.user"
                  style="display: block; color: #999; font-size: 10px"
                >
                  调试: {{ JSON.stringify(userStore.user) }}
                </small>
              </div>
              <div class="user-menu-items">
                <a href="#" @click.prevent="goToProfile" class="user-menu-item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path
                      d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"
                    ></path>
                  </svg>
                  我的资料
                </a>
                <a href="#" @click.prevent="goToOrders" class="user-menu-item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path
                      d="M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm88,168H40V80H216V200Z"
                    ></path>
                  </svg>
                  我的订单
                </a>
                <div class="menu-divider"></div>
                <a
                  href="#"
                  @click.prevent="handleLogout"
                  class="user-menu-item logout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path
                      d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"
                    ></path>
                  </svg>
                  退出登录
                </a>
              </div>
            </div>
            <div v-else class="user-login-section">
              <p class="login-prompt">登录以查看更多功能</p>
              <button @click="goToLogin" class="login-btn">登录 / 注册</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import { useSearchStore } from '@/stores/searchStore'
import { useCartStore } from '@/stores/cartStore'

// 定义 props
const props = defineProps({
  currentPage: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const userStore = useUserStore()
const searchStore = useSearchStore()
const cartStore = useCartStore()

// 搜索相关状态
const searchKeyword = ref('')
const showSuggestions = ref(false)

// 用户菜单状态
const showUserMenu = ref(false)

// 获取用户信息
const fetchUserInfo = async () => {
  if (userStore.isLoggedIn && userStore.token) {
    try {
      await userStore.fetchProfile()
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
}

// 组件挂载时获取用户信息和购物车数量
onMounted(() => {
  fetchUserInfo()
  // 获取购物车数量
  if (userStore.isLoggedIn) {
    cartStore.fetchCartCount()
  }
})

// 返回上一页
const goBack = () => {
  // 如果有历史记录，返回上一页
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    // 如果没有历史记录，返回首页
    router.push('/')
  }
}

// 执行搜索
const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return

  // 保存到搜索历史
  searchStore.addToHistory(keyword)

  // 跳转到商品列表页面并传递搜索关键词
  router.push({
    path: '/shop',
    query: { search: keyword },
  })

  // 关闭建议框
  showSuggestions.value = false
}

// 选择搜索建议
const selectSuggestion = keyword => {
  searchKeyword.value = keyword
  handleSearch()
}

// 清空搜索框
const clearSearch = () => {
  searchKeyword.value = ''
}

// 清空搜索历史
const clearHistory = () => {
  searchStore.clearHistory()
}

// 处理失去焦点
const handleBlur = () => {
  // 延迟关闭，以便点击建议项
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// 切换用户菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 去登录页
const goToLogin = () => {
  showUserMenu.value = false
  router.push('/login')
}

// 去个人资料页
const goToProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

// 去订单页
const goToOrders = () => {
  showUserMenu.value = false
  router.push('/orders')
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    userStore.logout()
    showUserMenu.value = false
    ElMessage.success('已退出登录')
    router.push('/')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.breadcrumb-container {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
}

.breadcrumb-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  flex: 1;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.back-item {
  color: #618961;
  font-weight: 500;
}

.back-item:hover {
  color: #4a6b4a;
}

.back-item svg {
  transition: transform 0.2s ease;
}

.back-item:hover svg {
  transform: translateX(-2px);
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

/* 右侧功能区域 */
.breadcrumb-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 搜索框样式 */
.search-container {
  position: relative;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 6px 12px;
  min-width: 200px;
  transition: all 0.2s ease;
}

.search-bar:focus-within {
  background-color: #ffffff;
  box-shadow: 0 0 0 2px #618961;
}

.search-icon {
  color: #999;
  cursor: pointer;
  margin-right: 8px;
  transition: color 0.2s ease;
}

.search-icon:hover {
  color: #618961;
}

.search-bar input {
  border: none;
  outline: none;
  background: transparent;
  flex: 1;
  font-size: 14px;
  color: #333;
}

.search-bar input::placeholder {
  color: #999;
}

.clear-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  margin-left: 8px;
  transition: color 0.2s ease;
}

.clear-btn:hover {
  color: #666;
}

/* 搜索建议下拉框 */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
}

.suggestion-section {
  padding: 8px 0;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  font-size: 12px;
  color: #999;
  border-bottom: 1px solid #f0f0f0;
}

.clear-history-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 12px;
  transition: color 0.2s ease;
}

.clear-history-btn:hover {
  color: #666;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
  color: #333;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestion-item.hot {
  color: #618961;
}

/* 操作按钮样式 */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
  position: relative;
}

.action-btn:hover {
  background-color: #f5f5f5;
  color: #618961;
}

.user-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background-color: #ff4757;
  border-radius: 50%;
}

/* 购物车徽章 */
.cart-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  background-color: #ff4757;
  color: white;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  box-shadow: 0 1px 3px rgba(255, 71, 87, 0.4);
  line-height: 1;
}

/* 用户菜单样式 */
.user-menu-container {
  position: relative;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 8px;
  min-width: 200px;
}

.user-info-section {
  padding: 16px;
}

.user-greeting {
  margin-bottom: 12px;
}

.greeting-text {
  color: #666;
  font-size: 14px;
}

.username {
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.user-menu-items {
  display: flex;
  flex-direction: column;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.user-menu-item:hover {
  color: #618961;
}

.user-menu-item.logout {
  color: #ff4757;
}

.user-menu-item.logout:hover {
  color: #ff3742;
}

.menu-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 8px 0;
}

.user-login-section {
  padding: 16px;
  text-align: center;
}

.login-prompt {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

.login-btn {
  background-color: #618961;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.login-btn:hover {
  background-color: #4a6b4a;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .breadcrumb-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .breadcrumb-actions {
    justify-content: space-between;
  }

  .search-bar {
    min-width: 150px;
  }
}
</style>
