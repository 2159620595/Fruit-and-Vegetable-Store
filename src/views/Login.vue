<template>
  <div class="auth-page">
    <div class="root">
      <div class="container">
        <!-- Header 开始 -->

        <!-- Header 结束 -->

        <!-- 表单区域开始 -->
        <div class="form-wrapper">
          <div class="form-container">
            <!-- 标签切换 -->
            <div class="tabs">
              <div class="tab-bar">
                <a
                  href="#"
                  :class="['tab-item', { active: activeTab === 'login' }]"
                  @click.prevent="activeTab = 'login'"
                >
                  <p>登录</p>
                </a>
                <a
                  href="#"
                  :class="['tab-item', { active: activeTab === 'signup' }]"
                  @click.prevent="activeTab = 'signup'"
                >
                  <p>注册</p>
                </a>
              </div>
            </div>

            <!-- 注册表单 -->
            <div v-if="activeTab === 'signup'" class="form-content">
              <!-- 用户名 -->
              <div class="form-group">
                <label class="form-label">
                  <p class="label-text">用户名</p>
                  <input
                    type="text"
                    v-model="signupForm.username"
                    placeholder="请输入用户名（4-20个字符）"
                    class="form-input"
                    @keyup.enter="handleSignup"
                  />
                </label>
              </div>

              <!-- 密码 -->
              <div class="form-group">
                <label class="form-label">
                  <p class="label-text">密码</p>
                  <input
                    type="password"
                    v-model="signupForm.password"
                    placeholder="请输入密码（至少6个字符）"
                    class="form-input"
                    @keyup.enter="handleSignup"
                  />
                </label>
              </div>

              <!-- 确认密码 -->
              <div class="form-group">
                <label class="form-label">
                  <p class="label-text">确认密码</p>
                  <input
                    type="password"
                    v-model="signupForm.confirm_password"
                    placeholder="请再次输入密码"
                    class="form-input"
                    @keyup.enter="handleSignup"
                  />
                </label>
              </div>

              <!-- 手机号 -->
              <div class="form-group">
                <label class="form-label">
                  <p class="label-text">手机号</p>
                  <input
                    type="tel"
                    v-model="signupForm.phone"
                    placeholder="请输入手机号"
                    class="form-input"
                    @keyup.enter="handleSignup"
                  />
                </label>
              </div>

              <!-- 验证码 -->
              <div class="form-group">
                <label class="form-label">
                  <p class="label-text">验证码</p>
                  <div class="verification-code-wrapper">
                    <input
                      type="text"
                      v-model="signupForm.verification_code"
                      placeholder="请输入验证码（测试：123456）"
                      class="form-input"
                      @keyup.enter="handleSignup"
                    />
                  </div>
                </label>
              </div>

              <!-- 注册按钮 -->
              <div class="form-submit">
                <button class="submit-btn" @click="handleSignup" :disabled="signupLoading">
                  {{ signupLoading ? '注册中...' : '注册' }}
                </button>
              </div>

              <!-- 切换到登录 -->
              <p class="switch-text">
                已有账号？<a href="#" @click.prevent="activeTab = 'login'">立即登录</a>
              </p>

              <!-- 第三方登录 -->
              <h3 class="social-title">或使用第三方登录</h3>
              <div class="social-buttons">
                <button class="social-btn">微信</button>
                <button class="social-btn">支付宝</button>
              </div>
            </div>

            <!-- 登录表单 -->
            <div v-if="activeTab === 'login'" class="form-content">
              <!-- 用户名 -->
              <div class="form-group">
                <label class="form-label">
                  <p class="label-text">用户名</p>
                  <input
                    type="text"
                    v-model="loginForm.username"
                    placeholder="请输入用户名"
                    class="form-input"
                    @keyup.enter="handleLogin"
                  />
                </label>
              </div>

              <!-- 密码 -->
              <div class="form-group">
                <label class="form-label">
                  <p class="label-text">密码</p>
                  <input
                    type="password"
                    v-model="loginForm.password"
                    placeholder="请输入密码"
                    class="form-input"
                    @keyup.enter="handleLogin"
                  />
                </label>
              </div>

              <!-- 登录按钮 -->
              <div class="form-submit">
                <button class="submit-btn" @click="handleLogin" :disabled="loginLoading">
                  {{ loginLoading ? '登录中...' : '登录' }}
                </button>
              </div>

              <!-- 切换到注册 -->
              <p class="switch-text">
                还没有账号？<a href="#" @click.prevent="activeTab = 'signup'">立即注册</a>
              </p>

              <!-- 第三方登录 -->
              <h3 class="social-title">或使用第三方登录</h3>
              <div class="social-buttons">
                <button class="social-btn">微信</button>
                <button class="social-btn">支付宝</button>
              </div>
            </div>
          </div>
        </div>
        <!-- 表单区域结束 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const activeTab = ref('login')

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
const loginLoading = computed(() => userStore.loading && activeTab.value === 'login')
const signupLoading = computed(() => userStore.loading && activeTab.value === 'signup')

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
  console.log('📝 注册表单数据:', signupForm.value)

  if (!validateSignup()) {
    console.log('❌ 表单验证失败')
    return
  }

  console.log('✅ 表单验证通过，准备提交')
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
    console.log('✅ 注册成功')

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
    console.error('❌ 注册失败:', error)
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
    console.log('✅ 登录成功')

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

    console.log('🔄 准备跳转到:', redirect)

    // 跳转到目标页面或首页
    setTimeout(() => {
      router.push(redirect)
    }, 800)
  } catch (error) {
    loading.close()
    console.error('❌ 登录失败:', error)
    const errorMsg =
      userStore.error || error.response?.data?.message || '登录失败，请检查用户名和密码'
    loginError.value = errorMsg

    ElMessage({
      message: errorMsg,
      type: 'error',
      duration: 4000,
      showClose: true,
    })
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.auth-page {
  background-color: #ffffff;
  min-height: 100vh;
}

.root {
  font-family: Epilogue, 'Noto Sans', sans-serif;
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  flex-direction: column;
  background-color: #ffffff;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  height: 100%;
  flex-grow: 1;
  flex-direction: column;
}

/* Header 样式 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  border-bottom: 1px solid #f0f4f0;
  padding: 12px 40px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #111811;
}

.nav-logo {
  width: 16px;
  height: 16px;
  color: #111811;
}

.nav h2 {
  color: #111811;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
}

.nav-right {
  display: flex;
  flex: 1;
  justify-content: flex-end;
  gap: 32px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 36px;
}

.nav-links a {
  color: #111811;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  text-decoration: none;
}

.login-btn {
  display: flex;
  min-width: 84px;
  max-width: 480px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  height: 40px;
  padding: 0 16px;
  background-color: #f0f4f0;
  color: #111811;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.015em;
  border: none;
}

/* 表单区域 */
.form-wrapper {
  padding: 0 160px;
  display: flex;
  flex: 1;
  justify-content: center;
  padding-top: 20px;
}

.form-container {
  display: flex;
  flex-direction: column;
  width: 512px;
  max-width: 512px;
  padding: 20px 0;
}

/* 标签切换 */
.tabs {
  padding-bottom: 12px;
}

.tab-bar {
  display: flex;
  border-bottom: 1px solid #dbe6db;
  padding: 0 16px;
  gap: 32px;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 3px solid transparent;
  color: #618961;
  padding-bottom: 13px;
  padding-top: 16px;
  text-decoration: none;
  cursor: pointer;
}

.tab-item.active {
  border-bottom-color: #111811;
  color: #111811;
}

.tab-item p {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.015em;
}

/* 表单内容 */
.form-content {
  display: flex;
  flex-direction: column;
}

.form-group {
  display: flex;
  max-width: 480px;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px;
  padding: 12px 16px;
}

.form-group-row {
  display: flex;
  max-width: 480px;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px;
  padding: 12px 16px;
}

.form-label {
  display: flex;
  flex-direction: column;
  min-width: 160px;
  flex: 1;
}

.label-text {
  color: #111811;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  padding-bottom: 8px;
}

.form-input {
  display: flex;
  width: 100%;
  min-width: 0;
  flex: 1;
  resize: none;
  overflow: hidden;
  border-radius: 8px;
  color: #111811;
  border: 1px solid #dbe6db;
  background-color: #ffffff;
  height: 56px;
  padding: 15px;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  outline: none;
}

.form-input:focus {
  outline: none;
  border-color: #dbe6db;
}

.form-input::placeholder {
  color: #618961;
}

.form-submit {
  max-width: 480px;
  display: flex;
  padding: 12px 16px;
}

.submit-btn {
  display: flex;
  min-width: 84px;
  max-width: 480px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  height: 40px;
  padding: 0 16px;
  flex: 1;
  background-color: #11d411;
  color: #111811;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.015em;
  border: none;
}

.submit-btn:hover {
  background-color: #0ec50e;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 错误消息样式 */
.error-message {
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  padding: 12px 16px;
  margin: 0 16px 12px 16px;
  font-size: 14px;
  line-height: 1.5;
}

/* 验证码输入框样式 */
.verification-code-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.switch-text {
  color: #618961;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  padding: 4px 16px 12px;
  text-align: center;
}

.switch-text a {
  color: #618961;
  text-decoration: underline;
  cursor: pointer;
}

.social-title {
  color: #111811;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  padding: 16px 16px 8px;
}

.social-buttons {
  display: flex;
  justify-content: center;
  flex: 1;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  max-width: 480px;
}

.social-btn {
  display: flex;
  min-width: 84px;
  max-width: 480px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  height: 40px;
  padding: 0 16px;
  background-color: #f0f4f0;
  color: #111811;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.015em;
  flex-grow: 1;
  border: none;
}

.social-btn:hover {
  background-color: #e5ebe5;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .form-wrapper {
    padding: 0 80px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 12px 20px;
  }

  .nav-links {
    display: none;
  }

  .form-wrapper {
    padding: 0 20px;
  }

  .form-container {
    width: 100%;
  }

  .form-group-row {
    flex-direction: column;
  }

  .form-label {
    min-width: 100%;
  }
}

@media (max-width: 480px) {
  .tab-bar {
    gap: 16px;
  }

  .social-buttons {
    flex-direction: column;
  }

  .social-btn {
    width: 100%;
  }
}
</style>
