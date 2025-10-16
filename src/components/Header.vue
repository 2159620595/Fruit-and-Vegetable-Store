<!-- src/components/Header.vue -->
<template>
  <header class="site-header">
    <div class="header-content">
      <div class="logo">
        <span class="leaf-icon">🌱</span>
        <span class="brand-name">果蔬商城</span>
      </div>
      <div class="right">
        <nav class="nav-links">
          <a href="#" class="nav-link" @click="router.push('/')">首页</a>
          <a href="#" class="nav-link">所有产品</a>
          <a href="#" class="nav-link">新到商品</a>
          <a href="#" class="nav-link">促销活动</a>
          <a href="#" class="nav-link">联系我们</a>
        </nav>
        <div class="header-actions">
          <div class="search-container">
            <div class="search-bar">
              <span class="search-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
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
              <button v-if="searchKeyword" class="clear-btn" @click="clearSearch" type="button">
                ×
              </button>
            </div>

            <!-- 搜索建议下拉框 -->
            <div
              v-if="showSuggestions && (searchHistory.length > 0 || searchKeyword)"
              class="search-suggestions"
            >
              <!-- 搜索历史 -->
              <div v-if="searchHistory.length > 0 && !searchKeyword" class="suggestion-section">
                <div class="suggestion-header">
                  <span>搜索历史</span>
                  <button @click="clearHistory" class="clear-history-btn">清空</button>
                </div>
                <div
                  v-for="(item, index) in searchHistory"
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
                  v-for="(item, index) in hotSearches"
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
              width="20px"
              height="20px"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z"
              ></path>
            </svg>
          </button>
          <button class="icon-btn" @click="router.push('/profile')">
            <svg
              t="1760099249589"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="4707"
            >
              <path
                d="M512 170.666667a341.333333 341.333333 0 1 1 0 682.666666 341.333333 341.333333 0 0 1 0-682.666666z m42.666667 362.666666h-85.333334a128 128 0 0 0-128 128h341.333334l-0.213334-7.509333A128 128 0 0 0 554.666667 533.333333z m-42.666667-213.333333a85.333333 85.333333 0 1 0 0 170.666667 85.333333 85.333333 0 0 0 0-170.666667z"
                fill="#444444"
                p-id="4708"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import router from '@/router'

// 搜索相关状态
const searchKeyword = ref('')
const showSuggestions = ref(false)
const searchHistory = ref([])
const hotSearches = ref(['苹果', '香蕉', '西红柿', '黄瓜', '橙汁', '有机蔬菜'])

// 从localStorage加载搜索历史
onMounted(() => {
  const saved = localStorage.getItem('searchHistory')
  if (saved) {
    try {
      searchHistory.value = JSON.parse(saved)
    } catch (e) {
      searchHistory.value = []
    }
  }
})

// 执行搜索
const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return

  // 保存到搜索历史
  addToHistory(keyword)

  // 跳转到商品列表页面并传递搜索关键词
  router.push({
    path: '/shop',
    query: { search: keyword },
  })

  // 关闭建议框
  showSuggestions.value = false
}

// 添加到搜索历史
const addToHistory = (keyword) => {
  // 移除重复项
  const filtered = searchHistory.value.filter((item) => item !== keyword)
  // 添加到开头
  filtered.unshift(keyword)
  // 只保留最近10条
  searchHistory.value = filtered.slice(0, 10)
  // 保存到localStorage
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 选择搜索建议
const selectSuggestion = (keyword) => {
  searchKeyword.value = keyword
  handleSearch()
}

// 清空搜索框
const clearSearch = () => {
  searchKeyword.value = ''
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

// 处理失去焦点
const handleBlur = () => {
  // 延迟关闭，以便点击建议项
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}
</script>

<style scoped>
.site-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  align-items: center;
}

.header-content {
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
