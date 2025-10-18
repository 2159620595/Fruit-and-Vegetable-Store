<!-- src/views/Profile.vue -->
<template>
  <div class="profile-page">
    <!-- Main Content -->
    <div class="main-content">
      <!-- 面包屑导航 -->
      <Breadcrumb current-page="个人中心" />

      <!-- User Profile Section -->
      <div class="user-profile-section">
        <div class="profile-header">
          <div class="user-avatar">
            <img
              :src="userStore.user?.avatar || defaultAvatar"
              alt="用户头像"
              @error="handleAvatarError"
            />
            <button class="avatar-edit-btn" @click="showAvatarDialog = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 15L12 9M9 12L15 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
          <div class="user-info">
            <h2 class="user-name">
              {{ userStore.user?.username || userStore.user?.name || '用户' }}
            </h2>
            <p class="member-since">会员等级：{{ userLevel }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-number">{{ userStats.totalOrders }}</span>
                <span class="stat-label">总订单</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">¥{{ userStats.totalSpent }}</span>
                <span class="stat-label">总消费</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ userStats.favoriteCount }}</span>
                <span class="stat-label">收藏商品</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div class="quick-actions-section">
        <h3 class="section-title">快捷功能</h3>
        <div class="actions-grid">
          <div class="action-card" @click="goToOrders">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="action-content">
              <h4 class="action-title">我的订单</h4>
              <p class="action-desc">查看订单状态</p>
            </div>
            <div class="action-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>

          <div class="action-card" @click="goToFavorites">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="action-content">
              <h4 class="action-title">我的收藏</h4>
              <p class="action-desc">收藏的商品</p>
            </div>
            <div class="action-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>

          <div class="action-card" @click="goToAddresses">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  cx="12"
                  cy="10"
                  r="3"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="action-content">
              <h4 class="action-title">收货地址</h4>
              <p class="action-desc">管理收货地址</p>
            </div>
            <div class="action-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>

          <div class="action-card" @click="goToSettings">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5166 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01062 9.77251C4.27925 9.5799 4.48278 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="action-content">
              <h4 class="action-title">账户设置</h4>
              <p class="action-desc">个人信息管理</p>
            </div>
            <div class="action-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Management Section -->
      <div class="account-section">
        <h3 class="section-title">账户管理</h3>
        <div class="account-actions">
          <button class="account-btn" @click="showPasswordDialog = true">
            <div class="btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  ry="2"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  cx="12"
                  cy="16"
                  r="1"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="btn-content">
              <span class="btn-title">修改密码</span>
              <span class="btn-desc">更改登录密码</span>
            </div>
          </button>

          <button class="account-btn" @click="handleLogout">
            <div class="btn-icon logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12L16 7M21 12H9"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="btn-content">
              <span class="btn-title">退出登录</span>
              <span class="btn-desc">安全退出账户</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 头像上传对话框 -->
    <el-dialog
      v-model="showAvatarDialog"
      title="更换头像"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="avatar-upload-container">
        <div class="current-avatar">
          <img
            :src="userStore.user?.avatar || defaultAvatar"
            alt="当前头像"
            class="preview-avatar"
          />
          <p class="avatar-tip">当前头像</p>
        </div>

        <div class="upload-section">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            accept="image/*"
            class="avatar-uploader"
          >
            <div class="upload-trigger">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">选择图片</div>
            </div>
          </el-upload>

          <div v-if="newAvatarPreview" class="new-avatar-preview">
            <img
              :src="newAvatarPreview"
              alt="新头像预览"
              class="preview-image"
            />
            <p class="preview-tip">新头像预览</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAvatarDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="uploading"
            :disabled="!newAvatarFile"
            @click="uploadAvatar"
          >
            {{ uploading ? '上传中...' : '确认更换' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/userStore'
import Breadcrumb from '../components/Breadcrumb.vue'

// 定义组件名
defineOptions({
  name: 'UserProfile',
})

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const showAvatarDialog = ref(false)
const showPasswordDialog = ref(false)
const uploading = ref(false)
const changingPassword = ref(false)

// 头像上传相关
const uploadRef = ref(null)
const newAvatarFile = ref(null)
const newAvatarPreview = ref('')

// 密码修改相关
const passwordFormRef = ref(null)
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

// 默认头像
const defaultAvatar =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iNjAiIGZpbGw9IiNGNUY1RjUiLz4KPGNpcmNsZSBjeD0iNjAiIGN5PSI0NSIgcj0iMjAiIGZpbGw9IiM2NjY2NjYiLz4KPHBhdGggZD0iTTMwIDkwQzMwIDc1LjY0MDYgNDEuNjQwNiA2NCA1NiA2NEg2NEM3OC4zNTk0IDY0IDkwIDc1LjY0MDYgOTAgOTBIMzBaIiBmaWxsPSIjNjY2NjY2Ii8+Cjwvc3ZnPgo='

// 计算属性
const userLevel = computed(() => {
  const totalSpent = parseFloat(userStats.value.totalSpent) || 0
  if (totalSpent >= 5000) return '钻石会员'
  if (totalSpent >= 2000) return '黄金会员'
  if (totalSpent >= 500) return '白银会员'
  return '普通会员'
})

const userStats = computed(() => {
  // 从用户存储中获取统计数据
  const orderStats = userStore.user?.order_stats || {}
  return {
    totalOrders: orderStats.total_orders || 0,
    totalSpent: orderStats.total_spent || '0.00',
    favoriteCount: userStore.user?.favorite_count || 0,
  }
})

// 方法
const handleAvatarError = event => {
  event.target.src = defaultAvatar
}

// 头像上传相关方法
const handleAvatarChange = file => {
  const isImage = file.raw.type.startsWith('image/')
  const isLt2M = file.raw.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }

  newAvatarFile.value = file.raw

  // 创建预览
  const reader = new FileReader()
  reader.onload = e => {
    newAvatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const uploadAvatar = async () => {
  if (!newAvatarFile.value) {
    ElMessage.warning('请先选择图片')
    return
  }

  uploading.value = true
  try {
    // 这里应该调用上传头像的API
    // const formData = new FormData()
    // formData.append('avatar', newAvatarFile.value)
    // await userStore.updateAvatar(formData)

    // 模拟上传成功
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新用户头像
    if (newAvatarPreview.value) {
      userStore.user.avatar = newAvatarPreview.value
    }

    ElMessage.success('头像更新成功!')
    showAvatarDialog.value = false

    // 重置状态
    newAvatarFile.value = null
    newAvatarPreview.value = ''
  } catch (error) {
    ElMessage.error('头像上传失败: ' + error.message)
  } finally {
    uploading.value = false
  }
}

// 密码修改相关方法
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

    ElMessage.success('密码修改成功!')
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

const goToOrders = () => {
  router.push('/orders')
}

const goToFavorites = () => {
  router.push('/favorites')
}

const goToAddresses = () => {
  router.push('/addresses')
}

const goToSettings = () => {
  router.push('/settings')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消
  }
}

// 生命周期
onMounted(async () => {
  // 确保用户信息是最新的
  if (userStore.isLoggedIn) {
    try {
      await userStore.fetchProfile()
    } catch {
      // 获取用户信息失败，使用默认信息
    }
  }
})
</script>
<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* User Profile Section */
.user-profile-section {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.user-profile-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.user-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit-btn {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 24px;
  height: 24px;
  background-color: #67c23a;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.avatar-edit-btn:hover {
  background-color: #5daf34;
  transform: scale(1.1);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
}

.member-since {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: rgba(255, 255, 255, 0.9);
}

.user-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* Quick Actions Section */
.quick-actions-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #67c23a;
}

.action-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #67c23a, #85ce61);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.action-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.action-arrow {
  color: #999;
  transition: all 0.2s;
}

.action-card:hover .action-arrow {
  color: #67c23a;
  transform: translateX(4px);
}

/* Account Management Section */
.account-section {
  margin-bottom: 32px;
}

.account-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-btn {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.account-btn:hover {
  border-color: #67c23a;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.1);
}

.btn-icon {
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
}

.btn-icon.logout {
  background: #fef2f2;
  color: #ef4444;
}

.btn-content {
  flex: 1;
}

.btn-title {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.btn-desc {
  font-size: 14px;
  color: #666;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }

  .user-profile-section {
    padding: 24px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .user-stats {
    justify-content: center;
    gap: 24px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .action-card {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .user-name {
    font-size: 24px;
  }

  .user-stats {
    flex-direction: column;
    gap: 16px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-number {
    font-size: 18px;
  }
}

/* 对话框样式 */
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.current-avatar {
  text-align: center;
}

.preview-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.avatar-tip {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #666;
}

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-uploader {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.avatar-uploader:hover {
  border-color: #67c23a;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #999;
}

.upload-icon {
  font-size: 24px;
}

.upload-text {
  font-size: 14px;
}

.new-avatar-preview {
  text-align: center;
}

.preview-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #67c23a;
}

.preview-tip {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #67c23a;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
