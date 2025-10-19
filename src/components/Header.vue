<!-- src/components/Header.vue -->
<template>
  <header class="site-header">
    <div class="header-content">
      <div class="logo">
        <span class="leaf-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path
              d="M173.79,51.48a221.25,221.25,0,0,0-41.67-34.34,8,8,0,0,0-8.24,0A221.25,221.25,0,0,0,82.21,51.48C54.59,80.48,40,112.47,40,144a88,88,0,0,0,176,0C216,112.47,201.41,80.48,173.79,51.48ZM96,184c0-27.67,22.53-47.28,32-54.3,9.48,7,32,26.63,32,54.3a32,32,0,0,1-64,0Z"
            ></path>
          </svg>
        </span>
        <span class="brand-name">果蔬商城</span>
      </div>
      <div class="right">
        <nav class="nav-links" v-if="isHomePage">
          <a href="#" class="nav-link" @click="router.push('/')">首页</a>
          <a href="#" class="nav-link" @click="router.push('/shop')">
            所有产品
          </a>
          <a href="#" class="nav-link" @click="router.push('/shop?filter=new')">
            新到商品
          </a>
          <a
            href="#"
            class="nav-link"
            @click="router.push('/shop?filter=sale')"
          >
            促销活动
          </a>
          <a href="#" class="nav-link" @click="scrollToContact">联系我们</a>
        </nav>
        <div class="header-actions">
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
                    width="16"
                    height="16"
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
                    width="16"
                    height="16"
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

          <button class="icon-btn" @click="router.push('/cart')">
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
          </button>
          <!-- 用户菜单 -->
          <div class="user-menu-container">
            <button class="icon-btn user-btn" @click="toggleUserMenu">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
                    {{ userStore.user?.username || '用户' }}
                  </span>
                </div>
                <div class="user-menu-items">
                  <a
                    href="#"
                    @click.prevent="goToProfile"
                    class="user-menu-item"
                  >
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
                  <a
                    href="#"
                    @click.prevent="goToOrders"
                    class="user-menu-item"
                  >
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
                  <a
                    href="#"
                    @click.prevent="goToFavorites"
                    class="user-menu-item"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path
                        d="M178,32c-20.65,0-35.73,11.15-42,21.89C129.73,43.15,114.65,32,94,32A60.07,60.07,0,0,0,34,92c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C154.21,218.66,258,162,258,92A60.07,60.07,0,0,0,178,32ZM128,206.8C109.74,196.16,50,149.72,50,92a44,44,0,0,1,44-44c19.45,0,35.78,10.36,42.92,25.32a8,8,0,0,0,14.16,0C150.22,58.36,166.55,48,186,48a44,44,0,0,1,44,44C230,149.72,170.26,196.16,152,206.8Z"
                      ></path>
                    </svg>
                    我的收藏
                    <span v-if="favoritesCount > 0" class="favorites-count">
                      {{ favoritesCount }}
                    </span>
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
                <button @click="goToLogin" class="login-btn">
                  登录 / 注册
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
// 组件名称
defineOptions({
  name: 'HeaderComponent',
})
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import { useSearchStore } from '@/stores/searchStore'
import { getFavoritesCount } from '@/api/favorites'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const searchStore = useSearchStore()

// 判断是否为首页
const isHomePage = computed(() => {
  return route.path === '/'
})

// 搜索相关状态
const searchKeyword = ref('')
const showSuggestions = ref(false)
const favoritesCount = ref(0)

// 用户菜单状态
const showUserMenu = ref(false)

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

const goToFavorites = () => {
  showUserMenu.value = false
  router.push('/favorites')
}

// 获取收藏数量
const loadFavoritesCount = async () => {
  if (!userStore.isLoggedIn) {
    favoritesCount.value = 0
    return
  }

  try {
    const response = await getFavoritesCount()
    favoritesCount.value = response.data?.count || 0
  } catch {
    favoritesCount.value = 0
  }
}

// 滚动到联系我们部分
const scrollToContact = () => {
  // 如果当前在首页，滚动到联系我们部分
  if (route.path === '/') {
    const contactSection = document.getElementById('contact-section')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      // 如果没有找到联系我们部分，滚动到页面底部
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }
  } else {
    // 如果不在首页，跳转到首页并滚动到联系我们部分
    router.push('/').then(() => {
      setTimeout(() => {
        const contactSection = document.getElementById('contact-section')
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' })
        } else {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
          })
        }
      }, 100)
    })
  }
}

// 处理登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await userStore.logout()
    showUserMenu.value = false
    ElMessage.success('已退出登录')
    router.push('/')
  } catch {
    // 用户取消
  }
}

// 初始化用户状态
onMounted(() => {
  userStore.initFromStorage()
  loadFavoritesCount()
})
</script>

<style scoped>
.site-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  align-items: center;
  height: 78px;
}

.header-content {
  height: 78px;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  display: flex;
  line-height: 0;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.leaf-icon {
  color: #2d5a27;
}

.brand-name {
  font-weight: 600;
  color: #000000;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #000000;
  text-decoration: none;
  font-size: 14px;
}

.nav-link:hover {
  color: #2d5a27;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-container {
  position: relative;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #eef6ee;
  padding: 8px 12px;
  border-radius: 10px;
  min-width: 250px;
  position: relative;
}

.search-bar input {
  border: none;
  outline: none;
  background: transparent;
  flex: 1;
  font-size: 14px;
}

.search-icon {
  color: #618961;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.search-icon:hover {
  background-color: rgba(97, 137, 97, 0.1);
}

.clear-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #333;
}

/* 搜索建议下拉框 */
.search-suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-section {
  padding: 8px 0;
}

.suggestion-section + .suggestion-section {
  border-top: 1px solid #f0f0f0;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.clear-history-btn {
  background: none;
  border: none;
  color: #618961;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
}

.clear-history-btn:hover {
  color: #2d5a27;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #333;
  font-size: 14px;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestion-item svg {
  color: #999;
  flex-shrink: 0;
}

.suggestion-item.hot svg {
  color: #ff6b6b;
}

.suggestion-item span {
  flex: 1;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: #e9e9e9;
}

/* 用户菜单样式 */
.user-menu-container {
  position: relative;
}

.user-btn {
  position: relative;
}

.user-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background-color: #4caf50;
  border-radius: 50%;
  border: 2px solid white;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 220px;
  z-index: 1000;
  overflow: hidden;
}

.user-info-section {
  padding: 16px;
}

.user-greeting {
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.greeting-text {
  font-size: 14px;
  color: #666;
}

.username {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-left: 4px;
}

.user-menu-items {
  display: flex;
  flex-direction: column;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-menu-item:hover {
  background-color: #f5f5f5;
}

.user-menu-item.logout {
  color: #f44336;
}

.user-menu-item.logout:hover {
  background-color: #ffebee;
}

.favorites-count {
  background-color: #ff4757;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  min-width: 16px;
  text-align: center;
  line-height: 1.2;
}

.user-login-section {
  padding: 20px;
  text-align: center;
}

.login-prompt {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.login-btn {
  width: 100%;
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn:hover {
  background-color: #45a049;
}

@media (max-width: 960px) {
  .nav-links {
    display: none;
  }

  .search-bar {
    min-width: 180px;
  }
}

@media (max-width: 640px) {
  .search-bar {
    min-width: 150px;
  }
}
</style>
