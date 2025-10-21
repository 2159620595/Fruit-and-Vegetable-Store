<!-- src/App.vue -->
<template>
  <div id="app">
    <router-view />
    <!-- <Footer /> -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/userStore'
import { useThemeStore } from './stores/themeStore'

const userStore = useUserStore()
const themeStore = useThemeStore()

onMounted(() => {
  // 初始化主题
  themeStore.loadTheme()

  // 如果有token，尝试获取用户信息
  if (userStore.token) {
    userStore.fetchProfile().catch(() => {
      // 如果失败，至少从localStorage恢复
      userStore.initFromStorage()
    })
  } else {
    // 没有token，尝试从localStorage恢复
    userStore.initFromStorage()
  }
})
</script>

<style>
/* 全局样式 - 确保页面容器一致性 */
html {
  scroll-behavior: smooth;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 确保所有页面从顶部开始 */
#app > div {
  width: 100%;
}
</style>
