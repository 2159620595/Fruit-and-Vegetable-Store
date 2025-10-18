import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    searchHistory: [],
    hotSearches: ['苹果', '香蕉', '西红柿', '黄瓜', '橙汁', '有机蔬菜'],
  }),

  persist: {
    key: 'search',
    storage: localStorage,
  },

  getters: {
    // 获取搜索历史
    getSearchHistory: (state) => state.searchHistory,
    
    // 获取热门搜索
    getHotSearches: (state) => state.hotSearches,
  },

  actions: {
    /**
     * 添加到搜索历史
     * @param {string} keyword - 搜索关键词
     */
    addToHistory(keyword) {
      if (!keyword || !keyword.trim()) return
      
      const trimmedKeyword = keyword.trim()
      
      // 移除重复项
      const filtered = this.searchHistory.filter((item) => item !== trimmedKeyword)
      // 添加到开头
      filtered.unshift(trimmedKeyword)
      // 只保留最近10条
      this.searchHistory = filtered.slice(0, 10)
    },

    /**
     * 清空搜索历史
     */
    clearHistory() {
      this.searchHistory = []
    },

    /**
     * 从搜索历史中移除指定关键词
     * @param {string} keyword - 要移除的关键词
     */
    removeFromHistory(keyword) {
      this.searchHistory = this.searchHistory.filter((item) => item !== keyword)
    },

    /**
     * 设置热门搜索
     * @param {Array} searches - 热门搜索列表
     */
    setHotSearches(searches) {
      this.hotSearches = searches
    },
  },
})
