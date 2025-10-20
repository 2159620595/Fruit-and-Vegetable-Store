<template>
  <div class="auth-page">
    <div class="container">
      <!-- 背景装饰 -->
      <div class="background-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>

      <!-- 表单区域开始 -->
      <div class="form-wrapper">
        <div class="form-container">
          <!-- Logo 和标题 -->
          <div class="auth-header">
            <el-icon class="logo-icon" :size="48">
              <ShoppingBag />
            </el-icon>
            <h1 class="auth-title">Fresh Harvest</h1>
            <p class="auth-subtitle">新鲜水果蔬菜，健康生活每一天</p>
          </div>

          <!-- 标签切换 -->
          <div class="tabs">
            <el-segmented
              v-model="activeTab"
              :options="tabOptions"
              size="large"
            />
          </div>

          <!-- 注册表单 -->
          <div v-show="activeTab === 'signup'" class="form-content">
            <el-form :model="signupForm" label-position="top" size="large">
              <!-- 用户名 -->
              <el-form-item label="用户名">
                <el-input
                  v-model="signupForm.username"
                  placeholder="请输入用户名（4-20个字符）"
                  @keyup.enter="handleSignup"
                  clearable
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 密码 -->
              <el-form-item label="密码">
                <el-input
                  v-model="signupForm.password"
                  type="password"
                  placeholder="请输入密码（至少6个字符）"
                  @keyup.enter="handleSignup"
                  show-password
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 确认密码 -->
              <el-form-item label="确认密码">
                <el-input
                  v-model="signupForm.confirm_password"
                  type="password"
                  placeholder="请再次输入密码"
                  @keyup.enter="handleSignup"
                  show-password
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 手机号 -->
              <el-form-item label="手机号">
                <el-input
                  v-model="signupForm.phone"
                  placeholder="请输入手机号"
                  @keyup.enter="handleSignup"
                  clearable
                >
                  <template #prefix>
                    <el-icon><Iphone /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 验证码 -->
              <el-form-item label="验证码">
                <el-input
                  v-model="signupForm.verification_code"
                  placeholder="请输入验证码（测试：123456）"
                  @keyup.enter="handleSignup"
                  clearable
                >
                  <template #prefix>
                    <el-icon><Message /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 注册按钮 -->
              <el-form-item>
                <el-button
                  type="success"
                  size="large"
                  @click="handleSignup"
                  :loading="signupLoading"
                  style="width: 100%"
                >
                  {{ signupLoading ? '正在注册...' : '立即注册' }}
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 切换到登录 -->
            <p class="switch-text">
              已有账号？
              <el-link type="success" @click="activeTab = 'login'">
                立即登录
              </el-link>
            </p>

            <!-- 分割线 -->
            <el-divider>
              <el-text class="divider-text">其他登录方式</el-text>
            </el-divider>

            <!-- 第三方登录 -->
            <div class="social-buttons">
              <el-button
                size="large"
                @click="handleWechatLogin"
                style="flex: 1"
              >
                <el-icon style="margin-right: 8px"><ChatDotRound /></el-icon>
                微信登录
              </el-button>
              <el-button
                size="large"
                @click="handleAlipayLogin"
                style="flex: 1"
              >
                <el-icon style="margin-right: 8px"><Wallet /></el-icon>
                支付宝登录
              </el-button>
            </div>
          </div>

          <!-- 登录表单 -->
          <div v-show="activeTab === 'login'" class="form-content">
            <el-form :model="loginForm" label-position="top" size="large">
              <!-- 用户名 -->
              <el-form-item label="用户名">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  @keyup.enter="handleLogin"
                  clearable
                  autofocus
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 密码 -->
              <el-form-item label="密码">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  @keyup.enter="handleLogin"
                  show-password
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 登录按钮 -->
              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  @click="handleLogin"
                  :loading="loginLoading"
                  style="width: 100%"
                >
                  {{ loginLoading ? '正在登录...' : '立即登录' }}
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 切换到注册 -->
            <p class="switch-text">
              还没有账号？
              <el-link type="success" @click="activeTab = 'signup'">
                立即注册
              </el-link>
            </p>

            <!-- 分割线 -->
            <el-divider>
              <el-text class="divider-text">其他登录方式</el-text>
            </el-divider>

            <!-- 第三方登录 -->
            <div class="social-buttons">
              <el-button
                size="large"
                @click="handleWechatLogin"
                style="flex: 1"
              >
                <el-icon style="margin-right: 8px"><ChatDotRound /></el-icon>
                微信登录
              </el-button>
              <el-button
                size="large"
                @click="handleAlipayLogin"
                style="flex: 1"
              >
                <el-icon style="margin-right: 8px"><Wallet /></el-icon>
                支付宝登录
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <!-- 表单区域结束 -->
    </div>
  </div>
</template>

<script setup>
// 组件名称
defineOptions({
  name: 'LoginPage',
})
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  Lock,
  Iphone,
  Message,
  UserFilled,
  Right,
  ChatDotRound,
  Wallet,
  ShoppingBag,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const activeTab = ref('login')

// 标签选项
const tabOptions = [
  { label: '登录', value: 'login' },
  { label: '注册', value: 'signup' },
]

// 表单数据
const signupForm = ref({
  username: '',
  password: '',
  confirm_password: '',
  phone: '',
  verification_code: '',
})

const loginForm = ref({
  username: '',
  password: '',
})

// 使用store的loading状态
const loginLoading = computed(
  () => userStore.loading && activeTab.value === 'login'
)
const signupLoading = computed(
  () => userStore.loading && activeTab.value === 'signup'
)

// 错误消息
const loginError = ref('')
const signupError = ref('')

// 验证登录表单
const validateLogin = () => {
  loginError.value = ''

  if (!loginForm.value.username.trim()) {
    ElMessage.warning('请输入用户名')
    return false
  }

  if (!loginForm.value.password) {
    ElMessage.warning('请输入密码')
    return false
  }

  return true
}

// 验证注册表单
const validateSignup = () => {
  signupError.value = ''

  if (!signupForm.value.username.trim()) {
    ElMessage.warning('请输入用户名')
    return false
  }

  if (signupForm.value.username.length < 4) {
    ElMessage.warning('用户名至少4个字符')
    return false
  }

  if (!signupForm.value.password) {
    ElMessage.warning('请输入密码')
    return false
  }

  if (signupForm.value.password.length < 6) {
    ElMessage.warning('密码至少6个字符')
    return false
  }

  if (!signupForm.value.confirm_password) {
    ElMessage.warning('请确认密码')
    return false
  }

  if (signupForm.value.password !== signupForm.value.confirm_password) {
    ElMessage.warning('两次输入的密码不一致')
    return false
  }

  if (!signupForm.value.phone.trim()) {
    ElMessage.warning('请输入手机号')
    return false
  }

  if (!/^1[3-9]\d{9}$/.test(signupForm.value.phone)) {
    ElMessage.warning('请输入有效的11位手机号')
    return false
  }

  if (!signupForm.value.verification_code.trim()) {
    ElMessage.warning('请输入验证码')
    return false
  }

  return true
}

// 处理注册
const handleSignup = async () => {
  if (!validateSignup()) {
    return
  }

  signupError.value = ''

  // 显示加载提示
  const loading = ElMessage({
    message: '正在注册，请稍候...',
    type: 'info',
    duration: 0,
    icon: 'Loading',
  })

  try {
    await userStore.register(signupForm.value)

    loading.close()

    // 显示成功消息
    ElMessage({
      message: '🎉 注册成功！欢迎加入',
      type: 'success',
      duration: 3000,
      showClose: true,
    })

    // 切换到登录并填充用户名
    loginForm.value.username = signupForm.value.username

    // 延迟切换标签，让用户看到成功提示
    setTimeout(() => {
      activeTab.value = 'login'
    }, 500)

    // 清空注册表单
    signupForm.value = {
      username: '',
      password: '',
      confirm_password: '',
      phone: '',
      verification_code: '',
    }
  } catch (error) {
    loading.close()
    const errorMsg = error.message || userStore.error || '注册失败，请稍后重试'
    signupError.value = errorMsg

    ElMessage({
      message: errorMsg,
      type: 'error',
      duration: 4000,
      showClose: true,
      dangerouslyUseHTMLString: false,
    })
  }
}

// 处理登录
const handleLogin = async () => {
  if (!validateLogin()) {
    return
  }

  loginError.value = ''

  // 显示加载提示
  const loading = ElMessage({
    message: '正在登录，请稍候...',
    type: 'info',
    duration: 0,
    icon: 'Loading',
  })

  try {
    await userStore.login(loginForm.value)

    loading.close()

    // 显示欢迎消息
    ElMessage({
      message: `👋 欢迎回来，${loginForm.value.username}！`,
      type: 'success',
      duration: 2500,
      showClose: true,
    })

    // 获取重定向地址（从query参数）
    const redirect = route.query.redirect || '/'

    // 跳转到目标页面或首页
    setTimeout(() => {
      router.push(redirect)
    }, 800)
  } catch (error) {
    loading.close()
    const errorMsg =
      userStore.error ||
      error.response?.data?.message ||
      '登录失败，请检查用户名和密码'
    loginError.value = errorMsg

    ElMessage({
      message: errorMsg,
      type: 'error',
      duration: 4000,
      showClose: true,
    })
  }
}

// 处理微信登录
const handleWechatLogin = () => {
  ElMessage({
    message: '微信登录功能开发中，敬请期待',
    type: 'info',
    duration: 2000,
  })
}

// 处理支付宝登录
const handleAlipayLogin = () => {
  ElMessage({
    message: '支付宝登录功能开发中，敬请期待',
    type: 'info',
    duration: 2000,
  })
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.auth-page {
  background: linear-gradient(135deg, #409eff 0%, #79bbff 50%, #a0cfff 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  background: radial-gradient(
    circle,
    rgba(103, 194, 58, 0.3) 0%,
    rgba(133, 206, 97, 0.2) 50%,
    transparent 100%
  );
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  background: radial-gradient(
    circle,
    rgba(230, 162, 60, 0.3) 0%,
    rgba(235, 192, 120, 0.2) 50%,
    transparent 100%
  );
  animation-delay: 3s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 80%;
  background: radial-gradient(
    circle,
    rgba(64, 158, 255, 0.3) 0%,
    rgba(102, 177, 255, 0.2) 50%,
    transparent 100%
  );
  animation-delay: 6s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

/* 表单区域 */
.form-wrapper {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.form-container {
  width: 100%;
  max-width: 480px;
  min-height: 720px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.6s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo 和标题 */
.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  color: #67c23a;
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 8px rgba(103, 194, 58, 0.4));
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(5deg);
  }
}

.auth-title {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 50%, #e6a23c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  animation: titleShine 3s ease-in-out infinite;
}

@keyframes titleShine {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
}

.auth-subtitle {
  font-size: 14px;
  color: #909399;
  font-weight: 400;
}

/* 标签切换 */
.tabs {
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
}

.tabs :deep(.el-segmented) {
  --el-border-radius-base: 12px;
  background-color: #f5f7fa;
  padding: 4px;
}

.tabs :deep(.el-segmented__item-selected) {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

/* 表单内容 */
.form-content {
  flex: 1;
  animation: fadeIn 0.5s ease-out;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 自定义滚动条样式 */
.form-content::-webkit-scrollbar {
  width: 6px;
}

.form-content::-webkit-scrollbar-track {
  background: transparent;
}

.form-content::-webkit-scrollbar-thumb {
  background: rgba(103, 194, 58, 0.3);
  border-radius: 3px;
}

.form-content::-webkit-scrollbar-thumb:hover {
  background: rgba(103, 194, 58, 0.5);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.form-content :deep(.el-form-item) {
  margin-bottom: 24px;
}

.form-content :deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.form-content :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.form-content :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.form-content :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
}

/* 按钮使用 Element Plus 原生样式 */

.switch-text {
  text-align: center;
  color: #606266;
  font-size: 14px;
  margin: 16px 0;
}

.divider-text {
  color: #909399;
  font-size: 13px;
}

.form-content :deep(.el-divider) {
  margin: 24px 0;
}

.social-buttons {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

/* 社交按钮使用 Element Plus 原生样式 */

/* 响应式设计 */
@media (max-width: 768px) {
  .form-container {
    min-height: 680px;
    padding: 32px 24px;
    border-radius: 16px;
  }

  .auth-title {
    font-size: 28px;
  }

  .auth-subtitle {
    font-size: 13px;
  }

  .logo-icon {
    font-size: 40px;
  }

  .circle-1,
  .circle-2,
  .circle-3 {
    display: none;
  }
}

@media (max-width: 480px) {
  .form-wrapper {
    padding: 20px 16px;
  }

  .form-container {
    min-height: auto;
    max-height: 90vh;
    padding: 24px 20px;
  }

  .auth-title {
    font-size: 24px;
  }

  .auth-header {
    margin-bottom: 24px;
  }

  .tabs {
    margin-bottom: 24px;
  }

  .social-buttons {
    flex-direction: column;
  }

  .social-btn {
    width: 100%;
  }

  .submit-btn {
    height: 44px;
  }
}
</style>
