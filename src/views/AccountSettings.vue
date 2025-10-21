<!-- src/views/AccountSettings.vue -->
<template>
  <div class="account-settings-page">
    <!-- Main Content -->
    <div class="main-content">
      <!-- 面包屑导航 -->
      <Breadcrumb current-page="账户设置" />

      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">账户设置</h1>
        <p class="page-subtitle">管理您的个人信息和账户安全</p>
      </div>

      <!-- 设置内容 -->
      <div class="settings-content">
        <!-- 基本信息 -->
        <div class="settings-section">
          <div class="section-header">
            <h3 class="section-title">基本信息</h3>
            <p class="section-desc">管理您的个人基本信息</p>
          </div>

          <div class="section-content">
            <el-form
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="100px"
              class="profile-form"
            >
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="profileForm.username"
                  placeholder="请输入用户名"
                  :disabled="true"
                />
                <span class="form-tip">用户名不可修改</span>
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model="profileForm.phone"
                  placeholder="请输入手机号"
                />
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="profileForm.email"
                  placeholder="请输入邮箱地址"
                />
              </el-form-item>

              <el-form-item label="真实姓名" prop="real_name">
                <el-input
                  v-model="profileForm.real_name"
                  placeholder="请输入真实姓名"
                />
              </el-form-item>

              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="profileForm.gender">
                  <el-radio label="male">男</el-radio>
                  <el-radio label="female">女</el-radio>
                  <el-radio label="other">其他</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="生日" prop="birthday">
                <el-date-picker
                  v-model="profileForm.birthday"
                  type="date"
                  placeholder="选择生日"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>

              <el-form-item label="个人简介" prop="bio">
                <el-input
                  v-model="profileForm.bio"
                  type="textarea"
                  :rows="3"
                  placeholder="介绍一下自己吧"
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  :loading="savingProfile"
                  @click="saveProfile"
                >
                  {{ savingProfile ? '保存中...' : '保存信息' }}
                </el-button>
                <el-button @click="resetProfile">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 安全设置 -->
        <div class="settings-section">
          <div class="section-header">
            <h3 class="section-title">安全设置</h3>
            <p class="section-desc">管理您的账户安全</p>
          </div>

          <div class="section-content">
            <div class="security-items">
              <div class="security-item">
                <div class="item-info">
                  <div class="item-title">登录密码</div>
                  <div class="item-desc">定期更换密码有助于保护账户安全</div>
                </div>
                <el-button @click="showPasswordDialog = true">
                  修改密码
                </el-button>
              </div>

              <div class="security-item">
                <div class="item-info">
                  <div class="item-title">手机验证</div>
                  <div class="item-desc">绑定手机号用于接收验证码</div>
                </div>
                <el-button @click="bindPhone">绑定手机</el-button>
              </div>

              <div class="security-item">
                <div class="item-info">
                  <div class="item-title">邮箱验证</div>
                  <div class="item-desc">绑定邮箱用于接收重要通知</div>
                </div>
                <el-button @click="bindEmail">绑定邮箱</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 隐私设置 -->
        <div class="settings-section">
          <div class="section-header">
            <h3 class="section-title">隐私设置</h3>
            <p class="section-desc">管理您的隐私偏好</p>
          </div>

          <div class="section-content">
            <div class="privacy-items">
              <div class="privacy-item">
                <div class="item-info">
                  <div class="item-title">允许其他用户查看我的信息</div>
                  <div class="item-desc">其他用户可以查看您的基本信息</div>
                </div>
                <el-switch
                  v-model="privacySettings.showProfile"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </div>

              <div class="privacy-item">
                <div class="item-info">
                  <div class="item-title">接收营销邮件</div>
                  <div class="item-desc">接收商品推荐和促销信息</div>
                </div>
                <el-switch
                  v-model="privacySettings.receiveMarketing"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </div>

              <div class="privacy-item">
                <div class="item-info">
                  <div class="item-title">接收系统通知</div>
                  <div class="item-desc">接收订单状态和系统消息</div>
                </div>
                <el-switch
                  v-model="privacySettings.receiveNotifications"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </div>
            </div>

            <div class="privacy-actions">
              <el-button
                type="primary"
                :loading="savingPrivacy"
                @click="savePrivacySettings"
              >
                {{ savingPrivacy ? '保存中...' : '保存设置' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="80px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="changingPassword"
            @click="changePassword"
          >
            {{ changingPassword ? '修改中...' : '确认修改' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores/userStore'
import Breadcrumb from '../components/Breadcrumb.vue'

const userStore = useUserStore()

// 响应式数据
const showPasswordDialog = ref(false)
const savingProfile = ref(false)
const savingPrivacy = ref(false)
const changingPassword = ref(false)

// 表单引用
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

// 基本信息表单
const profileForm = ref({
  username: '',
  phone: '',
  email: '',
  real_name: '',
  gender: 'male',
  birthday: '',
  bio: '',
})

const profileRules = {
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur',
    },
  ],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
  real_name: [
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' },
  ],
}

// 密码修改表单
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 隐私设置
const privacySettings = ref({
  showProfile: true,
  receiveMarketing: false,
  receiveNotifications: true,
})

// 方法
const loadUserProfile = () => {
  if (userStore.user) {
    profileForm.value = {
      username: userStore.user.username || '',
      phone: userStore.user.phone || '',
      email: userStore.user.email || '',
      real_name: userStore.user.real_name || '',
      gender: userStore.user.gender || 'male',
      birthday: userStore.user.birthday || '',
      bio: userStore.user.bio || '',
    }
  }
}

const saveProfile = async () => {
  if (!profileFormRef.value) return

  try {
    await profileFormRef.value.validate()

    savingProfile.value = true

    // 这里应该调用更新用户信息的API
    // await userStore.updateProfile(profileForm.value)

    // 模拟保存成功
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('个人信息更新成功')
  } catch (error) {
    if (error.message) {
      ElMessage.error('更新失败: ' + error.message)
    }
  } finally {
    savingProfile.value = false
  }
}

const resetProfile = () => {
  loadUserProfile()
  profileFormRef.value?.resetFields()
}

const changePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()

    changingPassword.value = true

    // 这里应该调用修改密码的API
    // await userStore.changePassword({
    //   currentPassword: passwordForm.value.currentPassword,
    //   newPassword: passwordForm.value.newPassword
    // })

    // 模拟修改成功
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('密码修改成功')
    showPasswordDialog.value = false

    // 重置表单
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
    passwordFormRef.value.resetFields()
  } catch (error) {
    if (error.message) {
      ElMessage.error('密码修改失败: ' + error.message)
    }
  } finally {
    changingPassword.value = false
  }
}

const bindPhone = () => {
  ElMessage.info('手机绑定功能开发中...')
}

const bindEmail = () => {
  ElMessage.info('邮箱绑定功能开发中...')
}

const savePrivacySettings = async () => {
  savingPrivacy.value = true

  try {
    // 这里应该调用保存隐私设置的API
    // await savePrivacySettings(privacySettings.value)

    // 模拟保存成功
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('隐私设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    savingPrivacy.value = false
  }
}

// 生命周期
onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.account-settings-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.section-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.profile-form {
  max-width: 600px;
}

.form-tip {
  font-size: 12px;
  color: var(--text-light);
  margin-left: 8px;
}

.security-items,
.privacy-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-item,
.privacy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 4px;
}

.item-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.privacy-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-page {
    padding: 16px;
  }

  .main-content {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .settings-section {
    padding: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .profile-form {
    max-width: none;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .security-item,
  .privacy-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .item-action {
    width: 100%;
  }

  .item-action .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .settings-page {
    padding: 12px;
  }

  .main-content {
    padding: 12px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .settings-section {
    padding: 12px;
  }

  .section-title {
    font-size: 16px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .form-label {
    font-size: 13px;
  }

  .form-input {
    padding: 10px;
    font-size: 14px;
  }

  .security-item,
  .privacy-item {
    padding: 12px;
  }

  .item-title {
    font-size: 14px;
  }

  .item-description {
    font-size: 12px;
  }
}
</style>
