// src/stores/themeStore.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 主题模式: 'light' 或 'dark'
  const theme = ref('light')

  // 从localStorage加载主题
  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      theme.value = savedTheme
    } else {
      // 检测系统主题偏好
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
    applyTheme()
  }

  // 应用主题到DOM
  const applyTheme = () => {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark-theme')
      document.documentElement.classList.remove('light-theme')
    } else {
      document.documentElement.classList.add('light-theme')
      document.documentElement.classList.remove('dark-theme')
    }
  }

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    applyTheme()
    localStorage.setItem('theme', theme.value)
  }

  // 设置特定主题
  const setTheme = newTheme => {
    if (newTheme === 'light' || newTheme === 'dark') {
      theme.value = newTheme
      applyTheme()
      localStorage.setItem('theme', theme.value)
    }
  }

  // 获取当前主题
  const isDark = () => theme.value === 'dark'

  // 监听主题变化
  watch(theme, () => {
    applyTheme()
  })

  return {
    theme,
    loadTheme,
    toggleTheme,
    setTheme,
    isDark,
  }
})
