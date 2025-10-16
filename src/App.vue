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

const userStore = useUserStore()

onMounted(() => {
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
