<template>
  <div class="not-found-page">
    <div class="content">
      <div class="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path
            d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
          ></path>
        </svg>
      </div>
      <h1 class="title">404</h1>
      <p class="subtitle">页面未找到</p>
      <p class="description">抱歉，您访问的页面不存在或已被删除。</p>
      <div class="actions">
        <el-button type="success" size="large" @click="goHome">
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.content {
  text-align: center;
  max-width: 600px;
  background: var(--bg-card);
  padding: 60px 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.icon {
  color: var(--success-color);
  margin-bottom: 30px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.title {
  font-size: 120px;
  font-weight: 800;
  color: var(--text-color);
  margin: 0;
  line-height: 1;
  background: linear-gradient(135deg, #4a8157 0%, #5a7a98 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 20px 0 10px;
}

.description {
  font-size: 16px;
  color: var(--text-light);
  margin-bottom: 40px;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .content {
    padding: 40px 20px;
  }

  .title {
    font-size: 80px;
  }

  .subtitle {
    font-size: 24px;
  }

  .description {
    font-size: 14px;
  }

  .actions {
    flex-direction: column;
  }

  .actions .el-button {
    width: 100%;
  }
}
</style>
