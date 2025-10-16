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
  if (userStore.token) {
    userStore.fetchProfile().catch(() => {})
  }
})
</script>

