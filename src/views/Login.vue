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
                    placeholder="请输入用户名"
                    class="form-input"
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
                    placeholder="请输入密码"
                    class="form-input"
                  />
                </label>
              </div>

              <!-- 确认密码 -->
              <div class="form-group">
                <label class="form-label">
                  <p class="label-text">确认密码</p>
                  <input
                    type="password"
                    v-model="signupForm.confirmPassword"
                    placeholder="请确认密码"
                    class="form-input"
                  />
                </label>
              </div>

              <!-- 手机号和验证码 -->
              <div class="form-group-row">
                <label class="form-label">
                  <p class="label-text">email</p>
                  <input
                    type="email"
                    v-model="signupForm.phone"
                    placeholder="请输入phone"
                    class="form-input"
                  />
                </label>
              </div>

              <!-- 注册按钮 -->
              <div class="form-submit">
                <button class="submit-btn" @click="handleSignup">注册</button>
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
                  />
                </label>
              </div>

              <!-- 登录按钮 -->
              <div class="form-submit">
                <button class="submit-btn" @click="handleLogin">登录</button>
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
import { ref } from 'vue'
import router from '@/router'
import { userRegisterService, userLoginService } from '@/api/user.js'

const activeTab = ref('login')

const signupForm = ref({
  username: '',
  password: '',
  phone: '',
})

const loginForm = ref({
  username: '',
  password: '',
})
console.log(signupForm.value)

const handleSignup = async () => {
  try {
    const res = await userRegisterService(signupForm.value)
    console.log('注册成功:', res)
    // 注册成功后可以自动切换到登录或直接登录
    activeTab.value = 'login'
    alert('注册成功，请登录')
  } catch (error) {
    console.error('注册失败:', error)
    // 错误提示已由拦截器处理
  }
}

const handleLogin = async () => {
  try {
    const res = await userLoginService(loginForm.value)
    console.log('登录成功:', res)

    // 保存token和用户信息（如果后端返回）
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token)
    }

    // 登录成功，跳转到首页
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    // 错误提示已由拦截器处理
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
