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
            <el-button
              circle
              size="small"
              type="success"
              class="avatar-edit-btn"
              @click="showAvatarDialog = true"
            >
              <el-icon :size="14">
                <Edit />
              </el-icon>
            </el-button>
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
              <el-icon :size="24">
                <Document />
              </el-icon>
            </div>
            <div class="action-content">
              <h4 class="action-title">我的订单</h4>
              <p class="action-desc">查看订单状态</p>
            </div>
            <div class="action-arrow">
              <el-icon :size="16">
                <ArrowRight />
              </el-icon>
            </div>
          </div>

          <div class="action-card" @click="goToFavorites">
            <div class="action-icon">
              <el-icon :size="24">
                <Star />
              </el-icon>
            </div>
            <div class="action-content">
              <h4 class="action-title">我的收藏</h4>
              <p class="action-desc">收藏的商品</p>
            </div>
            <div class="action-arrow">
              <el-icon :size="16">
                <ArrowRight />
              </el-icon>
            </div>
          </div>

          <div class="action-card" @click="goToAddresses">
            <div class="action-icon">
              <el-icon :size="24">
                <Location />
              </el-icon>
            </div>
            <div class="action-content">
              <h4 class="action-title">收货地址</h4>
              <p class="action-desc">管理收货地址</p>
            </div>
            <div class="action-arrow">
              <el-icon :size="16">
                <ArrowRight />
              </el-icon>
            </div>
          </div>

          <div class="action-card" @click="goToSettings">
            <div class="action-icon">
              <el-icon :size="24">
                <Setting />
              </el-icon>
            </div>
            <div class="action-content">
              <h4 class="action-title">账户设置</h4>
              <p class="action-desc">个人信息管理</p>
            </div>
            <div class="action-arrow">
              <el-icon :size="16">
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Management Section -->
      <div class="account-section">
        <h3 class="section-title">账户管理</h3>
        <div class="account-actions">
          <el-button class="account-btn" @click="showPasswordDialog = true">
            <div class="btn-icon">
              <el-icon :size="20">
                <Lock />
              </el-icon>
            </div>
            <div class="btn-content">
              <span class="btn-title">修改密码</span>
              <span class="btn-desc">更改登录密码</span>
            </div>
          </el-button>

          <el-button class="account-btn" @click="handleLogout">
            <div class="btn-icon logout">
              <el-icon :size="20">
                <SwitchButton />
              </el-icon>
            </div>
            <div class="btn-content">
              <span class="btn-title">退出登录</span>
              <span class="btn-desc">安全退出账户</span>
            </div>
          </el-button>
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
          <div class="avatar-preview-wrapper">
            <el-icon v-if="!userStore.user?.avatar" class="default-avatar-icon">
              <Avatar />
            </el-icon>
            <img
              v-else
              :src="userStore.user?.avatar || defaultAvatar"
              alt="当前头像"
              class="preview-avatar"
            />
          </div>
          <p class="avatar-tip">
            <el-icon><Picture /></el-icon>
            当前头像
          </p>
        </div>

        <div class="upload-section">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            class="avatar-uploader"
            drag
          >
            <div class="upload-trigger">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">点击或拖拽上传</div>
              <div class="upload-hint">支持 JPG、PNG、GIF 格式，不超过 5MB</div>
              <div class="upload-hint">图片将自动压缩至 200x200 以内</div>
            </div>
          </el-upload>

          <div v-if="newAvatarPreview" class="new-avatar-preview">
            <div class="avatar-preview-wrapper">
              <img
                :src="newAvatarPreview"
                alt="新头像预览"
                class="preview-image"
              />
            </div>
            <p class="preview-tip">
              <el-icon><Picture /></el-icon>
              新头像预览
            </p>
            <el-button text type="danger" size="small" @click="clearNewAvatar">
              <el-icon><Close /></el-icon>
              清除
            </el-button>
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
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload,
  Picture,
  Avatar,
  Edit,
  Close,
  SuccessFilled,
  Document,
  Star,
  Location,
  Setting,
  ArrowRight,
  Lock,
  SwitchButton,
} from '@element-plus/icons-vue'
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

// 压缩图片
const compressImage = (file, maxWidth = 400, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // 计算缩放比例
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // 转换为 blob
        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 头像上传相关方法
const handleAvatarChange = async file => {
  const isImage = file.raw.type.startsWith('image/')
  const isLt5M = file.raw.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage({
      message: '只能上传图片文件！',
      type: 'error',
      icon: h(Close),
    })
    return false
  }
  if (!isLt5M) {
    ElMessage({
      message: '图片大小不能超过 5MB！',
      type: 'error',
      icon: h(Close),
    })
    return false
  }

  try {
    // 压缩图片（更小的尺寸和质量以适应数据库限制）
    const compressedBlob = await compressImage(file.raw, 200, 0.6)

    // 检查压缩后的大小（确保不超过限制）
    const compressedSize = compressedBlob.size / 1024 / 1024
    if (compressedSize > 0.1) {
      // 超过100KB，提示用户
      console.warn('压缩后图片仍较大:', compressedSize.toFixed(2), 'MB')
    }

    // 将 blob 转换为 File 对象
    newAvatarFile.value = new File([compressedBlob], file.raw.name, {
      type: 'image/jpeg',
    })

    // 创建预览
    const reader = new FileReader()
    reader.onload = e => {
      newAvatarPreview.value = e.target.result
    }
    reader.readAsDataURL(compressedBlob)

    ElMessage({
      message: '图片已选择并压缩，请点击确认更换',
      type: 'success',
      icon: h(SuccessFilled),
    })
  } catch (error) {
    console.error('图片处理失败:', error)
    ElMessage({
      message: '图片处理失败，请重试',
      type: 'error',
      icon: h(Close),
    })
  }
}

// 清除新头像预览
const clearNewAvatar = () => {
  newAvatarFile.value = null
  newAvatarPreview.value = ''
}

const uploadAvatar = async () => {
  if (!newAvatarFile.value) {
    ElMessage({
      message: '请先选择图片',
      type: 'warning',
      icon: h(Picture),
    })
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', newAvatarFile.value)

    // 调用上传头像的API
    const response = await userStore.updateAvatar(formData)

    // 更新用户头像
    if (response?.data?.avatar) {
      userStore.user.avatar = response.data.avatar
    } else if (newAvatarPreview.value) {
      // 如果后端没有返回URL，使用预览图（临时方案）
      userStore.user.avatar = newAvatarPreview.value
    }

    ElMessage({
      message: '头像更新成功！',
      type: 'success',
      icon: h(SuccessFilled),
    })
    showAvatarDialog.value = false

    // 重置状态
    clearNewAvatar()
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage({
      message: error.message || '头像上传失败，请重试',
      type: 'error',
      icon: h(Close),
    })
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

    // 调用修改密码的API
    await userStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })

    ElMessage({
      message: '密码修改成功！',
      type: 'success',
      icon: h(SuccessFilled),
    })
    showPasswordDialog.value = false

    // 重置表单
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
    passwordFormRef.value.resetFields()
  } catch (error) {
    console.error('密码修改失败:', error)
    ElMessage({
      message: error.message || '密码修改失败，请重试',
      type: 'error',
      icon: h(Close),
    })
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
  width: 100%;
  height: auto;
  padding: 16px 20px;
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
  gap: 32px;
  padding: 16px 0;
}

.current-avatar {
  text-align: center;
}

.avatar-preview-wrapper {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
}

.default-avatar-icon {
  font-size: 48px;
  color: #999;
}

.preview-avatar,
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-tip,
.preview-tip {
  margin: 12px 0 0 0;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.preview-tip {
  color: #67c23a;
  font-weight: 500;
}

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.avatar-uploader {
  width: 100%;
}

.avatar-uploader :deep(.el-upload) {
  width: 100%;
}

.avatar-uploader :deep(.el-upload-dragger) {
  width: 100%;
  padding: 32px 20px;
  border-radius: 12px;
  border: 2px dashed #d9d9d9;
  background-color: #fafafa;
  transition: all 0.3s;
}

.avatar-uploader :deep(.el-upload-dragger:hover) {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  font-size: 32px;
  color: #67c23a;
}

.upload-text {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.new-avatar-preview {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  width: 100%;
}

.new-avatar-preview .avatar-preview-wrapper {
  border-color: #67c23a;
  box-shadow: 0 2px 12px rgba(103, 194, 58, 0.2);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
