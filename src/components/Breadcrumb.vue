<template>
  <div class="breadcrumb-container">
    <div class="breadcrumb-content">
      <!-- 首页：显示 Logo 和导航 -->
      <div v-if="isHomePage" class="home-header">
        <div class="logo">
          <span class="leaf-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
        <nav class="nav-links">
          <a href="#" class="nav-link" @click.prevent="router.push('/shop')">
            所有产品
          </a>
          <a
            href="#"
            class="nav-link"
            @click.prevent="router.push('/shop?filter=new')"
          >
            新到商品
          </a>
          <a
            href="#"
            class="nav-link"
            @click.prevent="router.push('/shop?filter=sale')"
          >
            促销活动
          </a>
          <a href="#" class="nav-link" @click.prevent="scrollToContact">
            联系我们
          </a>
        </nav>
      </div>

      <!-- 其他页面：显示面包屑导航 -->
      <nav v-else class="breadcrumb">
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

        <!-- 主题切换按钮 -->
        <button
          class="action-btn theme-btn"
          @click="toggleTheme"
          :title="themeStore.isDark() ? '切换到明亮模式' : '切换到暗黑模式'"
        >
          <!-- 明亮模式显示月亮图标 -->
          <svg
            v-if="!themeStore.isDark()"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path
              d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z"
            ></path>
          </svg>
          <!-- 暗黑模式显示太阳图标 -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path
              d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"
            ></path>
          </svg>
        </button>

        <!-- 用户菜单 -->
        <div class="user-menu-container">
          <button
            class="action-btn user-btn"
            :class="{ 'has-avatar': userStore.isLoggedIn && userAvatar }"
            @click="toggleUserMenu"
            title="用户中心"
          >
            <!-- 如果已登录且有头像，显示头像 -->
            <img
              v-if="userStore.isLoggedIn && userAvatar"
              :src="userAvatar"
              :alt="userStore.user?.username || '用户'"
              class="user-avatar"
            />
            <!-- 否则显示默认图标 -->
            <svg
              v-else
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
            <span
              v-if="userStore.isLoggedIn && !userAvatar"
              class="user-badge"
            ></span>
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
              <button @click="goToLogin" class="login-btn">登录 / 注册</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 组件名称
defineOptions({
  name: 'BreadcrumbComponent',
})

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import { useSearchStore } from '@/stores/searchStore'
import { useCartStore } from '@/stores/cartStore'
import { useThemeStore } from '@/stores/themeStore'
import { getFavoritesCount } from '@/api/favorites'

// 定义 props
defineProps({
  currentPage: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const searchStore = useSearchStore()
const cartStore = useCartStore()
const themeStore = useThemeStore()

// 判断是否为首页
const isHomePage = computed(() => {
  return route.path === '/'
})

// 搜索相关状态
const searchKeyword = ref('')
const showSuggestions = ref(false)

// 用户菜单状态
const showUserMenu = ref(false)
const favoritesCount = ref(0)

// 计算用户头像
const userAvatar = computed(() => {
  if (!userStore.isLoggedIn || !userStore.user) return null

  // 优先使用用户的头像字段
  return (
    userStore.user.avatar ||
    userStore.user.profile_picture ||
    userStore.user.image_url ||
    null
  )
})

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
  // 获取收藏数量
  loadFavoritesCount()
  // 添加点击外部关闭用户菜单的事件监听
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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

// 点击外部关闭用户菜单
const handleClickOutside = event => {
  const userMenuContainer = document.querySelector('.user-menu-container')
  if (userMenuContainer && !userMenuContainer.contains(event.target)) {
    showUserMenu.value = false
  }
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

// 去收藏页
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

// 切换主题
const toggleTheme = () => {
  themeStore.toggleTheme()
  ElMessage.success(
    themeStore.isDark() ? '已切换到暗黑模式' : '已切换到明亮模式'
  )
}
</script>

<style scoped>
.breadcrumb-container {
  background-color: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 24px;
}

.breadcrumb-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 48px; /* 固定最小高度，确保一致性 */
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--text-secondary);
  flex: 1;
  line-height: 1.5;
}

/* 首页 Logo 和导航 */
.home-header {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
  line-height: 1.5;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.leaf-icon {
  color: var(--primary-dark);
  display: flex;
  align-items: center;
  line-height: 1;
}

.leaf-icon svg {
  width: 16px;
  height: 16px;
}

.brand-name {
  font-weight: 600;
  color: var(--text-color);
  font-size: 16px;
  line-height: 1.4;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
  flex: 1;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--primary-dark);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.back-item {
  color: var(--primary-color);
  font-weight: 500;
}

.back-item:hover {
  color: var(--primary-dark);
}

.back-item svg {
  transition: transform 0.2s ease;
}

.back-item:hover svg {
  transform: translateX(-2px);
}

.breadcrumb a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb a:hover {
  color: var(--primary-dark);
}

.breadcrumb .separator {
  margin: 0 8px;
  color: var(--text-light);
}

.breadcrumb .current {
  color: var(--text-color);
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
  background-color: var(--bg-input);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 6px 12px;
  min-width: 200px;
  transition: all 0.2s ease;
}

.search-bar:focus-within {
  background-color: var(--bg-card);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(74, 129, 87, 0.15);
}

.search-icon {
  color: var(--text-light);
  cursor: pointer;
  margin-right: 8px;
  transition: color 0.2s ease;
}

.search-icon:hover {
  color: var(--primary-color);
}

.search-bar input {
  border: none;
  outline: none;
  background: transparent;
  flex: 1;
  font-size: 14px;
  color: var(--text-color);
}

.search-bar input::placeholder {
  color: var(--text-light);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  margin-left: 8px;
  transition: color 0.2s ease;
}

.clear-btn:hover {
  color: var(--text-secondary);
}

/* 搜索建议下拉框 */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  box-shadow: var(--shadow);
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
  color: var(--text-light);
  border-bottom: 1px solid var(--border-light);
}

.clear-history-btn {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  font-size: 12px;
  transition: color 0.2s ease;
}

.clear-history-btn:hover {
  color: var(--text-secondary);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: var(--text-color);
  border-radius: 6px;
  margin: 0 4px;
}

.suggestion-item:hover {
  background-color: rgba(74, 129, 87, 0.1);
  color: var(--primary-color);
  transform: translateX(4px);
  padding-left: 16px;
}

.suggestion-item:hover svg {
  color: var(--primary-color);
}

.suggestion-item.hot {
  color: var(--primary-color);
}

.suggestion-item.hot:hover {
  color: var(--primary-color);
  font-weight: 500;
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
  color: var(--text-secondary);
  position: relative;
}

.action-btn:hover {
  background-color: var(--bg-input);
  color: var(--primary-color);
}

/* 主题切换按钮 */
.theme-btn {
  transition: all 0.3s ease;
}

.theme-btn:hover {
  transform: scale(1.1);
}

.theme-btn svg {
  transition: transform 0.3s ease;
}

/* 用户头像样式 */
.user-btn.has-avatar {
  padding: 0;
  overflow: hidden;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background-color: var(--error-color);
  border-radius: 50%;
  border: 2px solid var(--bg-card);
}

/* 购物车徽章 */
.cart-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  background-color: var(--error-color);
  color: var(--text-inverse);
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
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  box-shadow: var(--shadow);
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
  color: var(--text-secondary);
  font-size: 14px;
}

.username {
  color: var(--text-color);
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
  color: var(--text-color);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.user-menu-item:hover {
  color: var(--primary-color);
}

.user-menu-item.logout {
  color: var(--error-color);
}

.user-menu-item.logout:hover {
  color: var(--error-color);
}

.favorites-count {
  background-color: var(--error-color);
  color: var(--text-inverse);
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
  min-width: 16px;
  text-align: center;
  line-height: 1.2;
}

.menu-divider {
  height: 1px;
  background-color: var(--border-light);
  margin: 8px 0;
}

.user-login-section {
  padding: 16px;
  text-align: center;
}

.login-prompt {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 12px;
}

.login-btn {
  background-color: var(--primary-color);
  color: var(--text-inverse);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.login-btn:hover {
  background-color: var(--primary-dark);
}

/* ============================================
   响应式设计 - 移动端优化
   ============================================ */

/* 平板设备 (768px - 1024px) */
@media (max-width: 1024px) {
  .breadcrumb-content {
    padding: 12px 16px;
  }

  .nav-links {
    gap: 24px;
  }

  .search-bar {
    min-width: 180px;
  }
}

/* 移动设备 (< 768px) */
@media (max-width: 768px) {
  .breadcrumb-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    padding: 12px 16px;
    min-height: auto;
  }

  .home-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .logo {
    gap: 8px;
  }

  .brand-name {
    font-size: 15px;
  }

  .nav-links {
    width: 100%;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: flex-start;
  }

  .nav-link {
    font-size: 13px;
    padding: 4px 8px;
    background: rgba(74, 129, 87, 0.08);
    border-radius: 6px;
  }

  .breadcrumb {
    font-size: 13px;
    flex-wrap: wrap;
  }

  .breadcrumb .separator {
    margin: 0 4px;
  }

  .breadcrumb-actions {
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
  }

  .search-container {
    flex: 1;
    max-width: 100%;
  }

  .search-bar {
    min-width: 0;
    width: 100%;
    padding: 6px 10px;
  }

  .search-bar input {
    font-size: 13px;
  }

  .action-btn {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .action-btn svg {
    width: 16px;
    height: 16px;
  }

  .cart-badge {
    min-width: 14px;
    height: 14px;
    font-size: 9px;
    top: 1px;
    right: 1px;
  }

  .user-dropdown {
    right: -8px;
    min-width: 180px;
    max-width: calc(100vw - 32px);
  }

  .user-menu-item {
    font-size: 13px;
    padding: 6px 0;
  }

  .search-suggestions {
    left: -8px;
    right: -8px;
    max-width: calc(100vw - 32px);
  }
}

/* 小屏幕手机 (< 480px) */
@media (max-width: 480px) {
  .breadcrumb-content {
    padding: 10px 12px;
    gap: 10px;
  }

  .logo {
    gap: 6px;
  }

  .leaf-icon svg {
    width: 14px;
    height: 14px;
  }

  .brand-name {
    font-size: 14px;
  }

  .nav-links {
    gap: 8px;
  }

  .nav-link {
    font-size: 12px;
    padding: 3px 6px;
  }

  .breadcrumb {
    font-size: 12px;
  }

  .breadcrumb-actions {
    gap: 6px;
  }

  .search-bar {
    padding: 5px 8px;
  }

  .search-bar input {
    font-size: 12px;
  }

  .action-btn {
    width: 30px;
    height: 30px;
  }

  .action-btn svg {
    width: 14px;
    height: 14px;
  }

  .cart-badge {
    min-width: 12px;
    height: 12px;
    font-size: 8px;
  }

  .user-dropdown {
    min-width: 160px;
  }

  .user-info-section,
  .user-login-section {
    padding: 12px;
  }

  .user-menu-item {
    font-size: 12px;
  }

  .login-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
