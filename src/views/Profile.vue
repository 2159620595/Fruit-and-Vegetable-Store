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
              class="avatar-image"
              @error="handleAvatarError"
              @click="showAvatarPreview = true"
            />
            <el-button
              circle
              size="small"
              type="success"
              class="avatar-edit-btn"
              @click.stop="showAvatarDialog = true"
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
            <p class="member-since" :class="getMembershipClass()">
              会员等级：{{ userLevel }}
            </p>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-number">
                  ¥{{ formatBalance(userBalance) }}
                </span>
                <span class="stat-label">账户余额</span>
              </div>
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

          <div class="action-card" @click="goToMembership">
            <div class="action-icon membership">
              <el-icon :size="24">
                <Trophy />
              </el-icon>
            </div>
            <div class="action-content">
              <h4 class="action-title">会员中心</h4>
              <p class="action-desc">查看会员等级与特权</p>
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

    <!-- 头像预览对话框 -->
    <el-dialog
      v-model="showAvatarPreview"
      title="头像预览"
      width="auto"
      :close-on-click-modal="true"
      center
      class="avatar-preview-dialog"
    >
      <div class="avatar-preview-content">
        <div class="preview-avatar-container">
          <img
            :src="userStore.user?.avatar || defaultAvatar"
            alt="用户头像预览"
            class="preview-avatar-large"
            @error="handleAvatarError"
          />
        </div>
        <div class="preview-actions">
          <el-button type="primary" @click="handleChangeAvatar">
            <el-icon><Edit /></el-icon>
            更换头像
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 会员信息对话框 -->
    <el-dialog
      v-model="showMembershipDialog"
      title="会员中心"
      width="600px"
      :close-on-click-modal="true"
      center
      class="membership-dialog"
    >
      <div class="membership-content">
        <!-- 当前会员等级 -->
        <div class="current-membership">
          <div class="membership-header">
            <div class="membership-icon">
              <el-icon :size="32">
                <Trophy />
              </el-icon>
            </div>
            <div class="membership-info">
              <h3 class="membership-level" :class="getMembershipClass()">
                {{ userLevel }}
              </h3>
              <p class="membership-desc">当前会员等级</p>
            </div>
          </div>

          <!-- 会员统计 -->
          <div class="membership-stats">
            <div class="stat-card">
              <div class="stat-value">¥{{ userStats.totalSpent }}</div>
              <div class="stat-label">累计消费</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ userStats.totalOrders }}</div>
              <div class="stat-label">订单数量</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ userStats.favoriteCount }}</div>
              <div class="stat-label">收藏商品</div>
            </div>
          </div>
        </div>

        <!-- 会员等级说明 -->
        <div class="membership-levels">
          <h4 class="levels-title">会员等级说明</h4>
          <div class="levels-list">
            <div
              class="level-item"
              :class="{ active: userLevel === '普通会员' }"
            >
              <div class="level-icon">🥉</div>
              <div class="level-info">
                <div class="level-name membership-bronze">普通会员</div>
                <div class="level-requirement">注册即可获得</div>
                <div class="level-benefits">基础购物体验</div>
              </div>
            </div>

            <div
              class="level-item"
              :class="{ active: userLevel === '白银会员' }"
            >
              <div class="level-icon">🥈</div>
              <div class="level-info">
                <div class="level-name membership-silver">白银会员</div>
                <div class="level-requirement">累计消费满 ¥500</div>
                <div class="level-benefits">享受9.5折优惠</div>
              </div>
            </div>

            <div
              class="level-item"
              :class="{ active: userLevel === '黄金会员' }"
            >
              <div class="level-icon">🥇</div>
              <div class="level-info">
                <div class="level-name membership-gold">黄金会员</div>
                <div class="level-requirement">累计消费满 ¥2000</div>
                <div class="level-benefits">享受9折优惠，专属客服</div>
              </div>
            </div>

            <div
              class="level-item"
              :class="{ active: userLevel === '钻石会员' }"
            >
              <div class="level-icon">💎</div>
              <div class="level-info">
                <div class="level-name membership-diamond">钻石会员</div>
                <div class="level-requirement">累计消费满 ¥5000</div>
                <div class="level-benefits">享受8.5折优惠，优先发货</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 升级提示 -->
        <div v-if="userLevel !== '钻石会员'" class="upgrade-tip">
          <div class="tip-content">
            <el-icon class="tip-icon"><Star /></el-icon>
            <div class="tip-text">
              <div class="tip-title">升级到下一等级</div>
              <div class="tip-desc">
                {{ getNextLevelInfo() }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showMembershipDialog = false">关闭</el-button>
          <el-button type="success" @click="handleRechargeClick">
            <el-icon><Trophy /></el-icon>
            充值升级
          </el-button>
          <el-button type="primary" @click="goToShop">
            <el-icon><Star /></el-icon>
            去购物升级
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 充值升级对话框 -->
    <el-dialog
      v-model="showRechargeDialog"
      title="充值升级会员"
      width="500px"
      :close-on-click-modal="false"
      center
      class="recharge-dialog"
    >
      <div class="recharge-content">
        <!-- 当前状态 -->
        <div class="current-status">
          <div class="status-info">
            <div class="current-level">
              <span class="level-icon">{{ getCurrentLevelIcon() }}</span>
              <span class="level-name" :class="getMembershipClass()">
                {{ userLevel }}
              </span>
            </div>
            <div class="current-balance">
              当前余额：¥{{ formatBalance(userBalance) }}
            </div>
          </div>
        </div>

        <!-- 充值金额选择 -->
        <div class="recharge-amounts">
          <h4 class="section-title">选择充值金额</h4>
          <div class="amount-grid">
            <div
              v-for="amount in rechargeAmounts"
              :key="amount.value"
              class="amount-card"
              :class="{ active: selectedAmount === amount.value }"
              @click="selectedAmount = amount.value"
            >
              <div class="amount-value">¥{{ amount.value }}</div>
              <div class="amount-bonus" v-if="amount.bonus">
                赠送 ¥{{ amount.bonus }}
              </div>
            </div>
          </div>
        </div>

        <!-- 自定义金额 -->
        <div class="custom-amount">
          <h4 class="section-title">或输入自定义金额</h4>
          <el-input
            v-model="customAmount"
            type="number"
            placeholder="请输入充值金额"
            :min="1"
            :max="10000"
            @input="handleCustomAmountInput"
          >
            <template #prepend>¥</template>
          </el-input>
        </div>

        <!-- 升级预览 -->
        <div v-if="selectedAmount > 0" class="upgrade-preview">
          <h4 class="section-title">升级预览</h4>
          <div class="preview-content">
            <div class="preview-item">
              <span class="preview-label">充值后余额：</span>
              <span class="preview-value">
                ¥{{ formatBalance(userBalance + selectedAmount) }}
              </span>
            </div>
            <div class="preview-item">
              <span class="preview-label">会员等级：</span>
              <span class="preview-value">
                {{ getNewLevelAfterRecharge() }}
              </span>
            </div>
            <div
              v-if="getNewLevelAfterRecharge() !== userLevel"
              class="upgrade-notice"
            >
              <el-icon><Trophy /></el-icon>
              <span>恭喜！充值后将升级为 {{ getNewLevelAfterRecharge() }}</span>
            </div>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="payment-methods">
          <h4 class="section-title">选择支付方式</h4>
          <div class="payment-grid">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="payment-card"
              :class="{ active: selectedPayment === method.id }"
              @click="selectedPayment = method.id"
            >
              <el-icon :size="24">
                <component :is="method.icon" />
              </el-icon>
              <span class="payment-name">{{ method.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRechargeDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="recharging"
            :disabled="selectedAmount <= 0 || !selectedPayment"
            @click="handleRecharge"
          >
            {{ recharging ? '充值中...' : `确认充值 ¥${selectedAmount}` }}
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
  Trophy,
  CreditCard,
  Wallet,
  Money,
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
const showAvatarPreview = ref(false)
const showPasswordDialog = ref(false)
const showMembershipDialog = ref(false)
const showRechargeDialog = ref(false)
const uploading = ref(false)
const changingPassword = ref(false)
const recharging = ref(false)

// 充值相关数据
const selectedAmount = ref(0)
const customAmount = ref('')
const selectedPayment = ref('')

// 充值金额选项
const rechargeAmounts = ref([
  { value: 100, bonus: 0 },
  { value: 300, bonus: 30 },
  { value: 500, bonus: 80 },
  { value: 1000, bonus: 200 },
  { value: 2000, bonus: 500 },
  { value: 5000, bonus: 1500 },
])

// 支付方式
const paymentMethods = ref([
  { id: 'alipay', name: '支付宝', icon: CreditCard },
  { id: 'wechat', name: '微信支付', icon: Wallet },
  { id: 'bank', name: '银行卡', icon: Money },
])

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
  // 优先使用 store 中的会员等级，如果没有则根据累计充值计算
  if (userStore.membershipLevel && userStore.membershipLevel !== '普通会员') {
    return userStore.membershipLevel
  }

  // 根据累计充值计算会员等级
  const totalRecharge =
    userStore.totalRecharge || userStore.user?.total_recharge || 0
  const rechargeAmount = parseFloat(totalRecharge) || 0

  if (rechargeAmount >= 5000) return '钻石会员'
  if (rechargeAmount >= 2000) return '黄金会员'
  if (rechargeAmount >= 500) return '白银会员'
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

// 用户余额
const userBalance = computed(() => {
  const balance = userStore.balance || userStore.user?.balance || 0
  return Number(balance) || 0
})

// 安全的余额格式化方法
const formatBalance = balance => {
  const num = Number(balance) || 0
  return num.toFixed(2)
}

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

const goToMembership = () => {
  // 暂时显示会员信息对话框，后续可以跳转到专门的会员页面
  showMembershipDialog.value = true
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

// 处理更换头像
const handleChangeAvatar = () => {
  showAvatarDialog.value = true
  showAvatarPreview.value = false
}

// 获取下一等级信息
const getNextLevelInfo = () => {
  const totalRecharge =
    userStore.totalRecharge || userStore.user?.total_recharge || 0
  const rechargeAmount = parseFloat(totalRecharge) || 0

  if (rechargeAmount < 500) {
    const need = 500 - rechargeAmount
    return `再充值 ¥${formatBalance(need)} 即可升级为白银会员`
  } else if (rechargeAmount < 2000) {
    const need = 2000 - rechargeAmount
    return `再充值 ¥${formatBalance(need)} 即可升级为黄金会员`
  } else if (rechargeAmount < 5000) {
    const need = 5000 - rechargeAmount
    return `再充值 ¥${formatBalance(need)} 即可升级为钻石会员`
  } else {
    return '您已达到最高等级！'
  }
}

// 跳转到商店
const goToShop = () => {
  showMembershipDialog.value = false
  router.push('/shop')
}

// 处理充值按钮点击
const handleRechargeClick = () => {
  showRechargeDialog.value = true
  showMembershipDialog.value = false
}

// 获取当前等级图标
const getCurrentLevelIcon = () => {
  switch (userLevel.value) {
    case '普通会员':
      return '🥉'
    case '白银会员':
      return '🥈'
    case '黄金会员':
      return '🥇'
    case '钻石会员':
      return '💎'
    default:
      return '🥉'
  }
}

// 获取会员等级对应的CSS类名
const getMembershipClass = () => {
  switch (userLevel.value) {
    case '普通会员':
      return 'membership-bronze'
    case '白银会员':
      return 'membership-silver'
    case '黄金会员':
      return 'membership-gold'
    case '钻石会员':
      return 'membership-diamond'
    default:
      return 'membership-bronze'
  }
}

// 处理自定义金额输入
const handleCustomAmountInput = value => {
  const amount = parseFloat(value) || 0
  if (amount > 0) {
    selectedAmount.value = amount
  }
}

// 获取充值后的新等级
const getNewLevelAfterRecharge = () => {
  const totalRecharge =
    userStore.totalRecharge || userStore.user?.total_recharge || 0
  const currentRecharge = parseFloat(totalRecharge) || 0
  const newTotal = currentRecharge + selectedAmount.value

  if (newTotal >= 5000) return '钻石会员'
  if (newTotal >= 2000) return '黄金会员'
  if (newTotal >= 500) return '白银会员'
  return '普通会员'
}

// 处理充值
const handleRecharge = async () => {
  if (selectedAmount.value <= 0) {
    ElMessage({
      message: '请选择充值金额',
      type: 'warning',
    })
    return
  }

  if (!selectedPayment.value) {
    ElMessage({
      message: '请选择支付方式',
      type: 'warning',
    })
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认充值 ¥${selectedAmount.value} 到账户余额？`,
      '确认充值',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    recharging.value = true

    // 创建充值订单
    const orderData = await userStore.createRechargeOrder(
      selectedAmount.value,
      selectedPayment.value
    )

    // 模拟支付成功（实际项目中应该调用第三方支付接口）
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 确认充值支付
    const result = await userStore.confirmRechargePayment(
      orderData.data.recharge_id,
      transactionId,
      'success'
    )

    ElMessage({
      message: `充值成功！余额已增加 ¥${result.data.total_amount}`,
      type: 'success',
      icon: h(SuccessFilled),
    })

    // 检查是否升级
    const newLevel = getNewLevelAfterRecharge()
    if (newLevel !== userLevel.value) {
      ElMessage({
        message: `恭喜！您已升级为 ${newLevel}！`,
        type: 'success',
        icon: h(Trophy),
        duration: 5000,
      })
    }

    // 重置状态
    selectedAmount.value = 0
    customAmount.value = ''
    selectedPayment.value = ''
    showRechargeDialog.value = false
  } catch (error) {
    if (error !== 'cancel') {
      console.error('充值失败:', error)
      ElMessage({
        message: error.message || '充值失败，请重试',
        type: 'error',
        icon: h(Close),
      })
    }
  } finally {
    recharging.value = false
  }
}

// 生命周期
onMounted(async () => {
  // 确保用户信息是最新的
  if (userStore.isLoggedIn) {
    try {
      await userStore.fetchProfile()
      // 获取用户余额信息
      await userStore.fetchUserBalance()
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
  overflow: visible;
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
  border-radius: 50%;
}

.avatar-edit-btn {
  position: absolute;
  bottom: -2px;
  right: -2px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid white !important;
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  min-height: 24px !important;
  padding: 0 !important;
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
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
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

/* 覆盖 Element Plus 默认的按钮间距 */
.account-actions .el-button + .el-button {
  margin-left: 0 !important;
}

.account-btn {
  width: 100%;
  height: auto;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
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
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
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
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
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

/* 头像预览对话框样式 */
.avatar-preview-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.avatar-preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 20px;
}

.preview-avatar-container {
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #e5e7eb;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-avatar-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.preview-avatar-large:hover {
  transform: scale(1.05);
}

.preview-actions {
  display: flex;
  gap: 12px;
}

/* 头像图片样式 */
.avatar-image {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar-image:hover {
  transform: scale(1.05);
}

/* 会员功能样式 */
.action-icon.membership {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #b8860b;
}

/* 会员对话框样式 */
.membership-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.membership-content {
  padding: 20px 0;
}

.current-membership {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.membership-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.membership-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b8860b;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.membership-info {
  flex: 1;
}

.membership-level {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
}

.membership-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.membership-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #67c23a;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.membership-levels {
  margin-bottom: 24px;
}

.levels-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.levels-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.level-item.active {
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%);
  border-color: #67c23a;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

.level-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.level-info {
  flex: 1;
}

.level-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.level-requirement {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.level-benefits {
  font-size: 12px;
  color: #67c23a;
  font-weight: 500;
}

.upgrade-tip {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 16px;
}

.tip-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tip-icon {
  color: #f39c12;
  font-size: 20px;
}

.tip-text {
  flex: 1;
}

.tip-title {
  font-size: 14px;
  font-weight: 600;
  color: #856404;
  margin-bottom: 2px;
}

.tip-desc {
  font-size: 12px;
  color: #856404;
}

/* 充值对话框样式 */
.recharge-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.recharge-content {
  padding: 20px 0;
}

.current-status {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-level {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-icon {
  font-size: 24px;
}

.level-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.current-balance {
  font-size: 16px;
  color: #67c23a;
  font-weight: 600;
}

.recharge-amounts,
.custom-amount,
.upgrade-preview,
.payment-methods {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.amount-card {
  background: #f8f9fa;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.amount-card:hover {
  border-color: #67c23a;
  background: #f0f9ff;
}

.amount-card.active {
  border-color: #67c23a;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%);
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

.amount-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.amount-bonus {
  font-size: 12px;
  color: #67c23a;
  font-weight: 500;
}

.custom-amount :deep(.el-input) {
  width: 100%;
}

.upgrade-preview {
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%);
  border: 1px solid #67c23a;
  border-radius: 8px;
  padding: 16px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-label {
  font-size: 14px;
  color: #666;
}

.preview-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.upgrade-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 8px;
  color: #856404;
  font-size: 12px;
  font-weight: 500;
}

.payment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.payment-card {
  background: #f8f9fa;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-card:hover {
  border-color: #67c23a;
  background: #f0f9ff;
}

.payment-card.active {
  border-color: #67c23a;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%);
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

.payment-name {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

/* 会员等级颜色主题 */
.membership-bronze {
  color: #cd7f32 !important;
  background: linear-gradient(135deg, #cd7f32, #b8860b) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  text-shadow: 0 0 10px rgba(205, 127, 50, 0.3) !important;
}

.membership-silver {
  color: #c0c0c0 !important;
  background: linear-gradient(135deg, #c0c0c0, #a8a8a8) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  text-shadow: 0 0 10px rgba(192, 192, 192, 0.3) !important;
}

.membership-gold {
  color: #ffd700 !important;
  background: linear-gradient(135deg, #ffd700, #ffb347) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.4) !important;
}

.membership-diamond {
  color: #b9f2ff !important;
  background: linear-gradient(135deg, #b9f2ff, #87ceeb, #4169e1) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  text-shadow: 0 0 20px rgba(185, 242, 255, 0.5) !important;
  animation: diamond-shine 2s ease-in-out infinite alternate !important;
}

@keyframes diamond-shine {
  0% {
    filter: brightness(1) saturate(1);
  }
  100% {
    filter: brightness(1.2) saturate(1.3);
  }
}

/* 会员等级背景效果 */
.member-since.membership-bronze {
  background: linear-gradient(
    135deg,
    rgba(205, 127, 50, 0.1),
    rgba(184, 134, 11, 0.1)
  );
  border: 1px solid rgba(205, 127, 50, 0.3);
  border-radius: 20px;
  padding: 4px 12px;
  display: inline-block;
}

.member-since.membership-silver {
  background: linear-gradient(
    135deg,
    rgba(192, 192, 192, 0.1),
    rgba(168, 168, 168, 0.1)
  );
  border: 1px solid rgba(192, 192, 192, 0.3);
  border-radius: 20px;
  padding: 4px 12px;
  display: inline-block;
}

.member-since.membership-gold {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.1),
    rgba(255, 179, 71, 0.1)
  );
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  padding: 4px 12px;
  display: inline-block;
}

.member-since.membership-diamond {
  background: linear-gradient(
    135deg,
    rgba(185, 242, 255, 0.1),
    rgba(135, 206, 235, 0.1),
    rgba(65, 105, 225, 0.1)
  );
  border: 1px solid rgba(185, 242, 255, 0.3);
  border-radius: 20px;
  padding: 4px 12px;
  display: inline-block;
  animation: diamond-bg-shine 3s ease-in-out infinite alternate;
}

@keyframes diamond-bg-shine {
  0% {
    box-shadow: 0 0 10px rgba(185, 242, 255, 0.3);
  }
  100% {
    box-shadow:
      0 0 20px rgba(185, 242, 255, 0.6),
      0 0 30px rgba(135, 206, 235, 0.4);
  }
}
</style>
