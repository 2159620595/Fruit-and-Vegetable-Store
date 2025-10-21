<template>
  <el-dialog
    v-model="visible"
    title="订单支付"
    width="450px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div class="payment-dialog-content">
      <!-- 订单金额显示 -->
      <div v-if="amount" class="payment-amount">
        <div class="amount-label">订单金额</div>
        <div class="amount-value">¥{{ formatAmount(amount) }}</div>
      </div>

      <!-- 余额信息显示 -->
      <div v-if="userBalance !== null" class="balance-info">
        <el-icon class="balance-icon" :size="16">
          <Wallet />
        </el-icon>
        <span class="balance-text">当前余额：</span>
        <span
          class="balance-amount"
          :class="{ insufficient: userBalance < amount }"
        >
          ¥{{ formatAmount(userBalance) }}
        </span>
      </div>

      <p class="dialog-tip">请选择支付方式</p>
      <el-select
        v-model="selectedPayment"
        placeholder="请选择支付方式"
        class="payment-select"
        size="large"
      >
        <el-option value="balance" label="余额支付">
          <span class="payment-option-content">
            <el-icon class="payment-icon balance-icon-opt" :size="20">
              <Wallet />
            </el-icon>
            <span class="payment-name">余额支付</span>
            <span v-if="userBalance < amount" class="insufficient-tag">
              余额不足
            </span>
          </span>
        </el-option>
        <el-option value="wechat" label="微信支付">
          <span class="payment-option-content">
            <el-icon class="payment-icon wechat-icon" :size="20">
              <ChatDotRound />
            </el-icon>
            <span class="payment-name">微信支付</span>
          </span>
        </el-option>
        <el-option value="alipay" label="支付宝">
          <span class="payment-option-content">
            <el-icon class="payment-icon alipay-icon" :size="20">
              <Wallet />
            </el-icon>
            <span class="payment-name">支付宝</span>
          </span>
        </el-option>
        <el-option value="credit_card" label="信用卡">
          <span class="payment-option-content">
            <el-icon class="payment-icon card-icon" :size="20">
              <CreditCard />
            </el-icon>
            <span class="payment-name">信用卡</span>
          </span>
        </el-option>
      </el-select>

      <!-- 余额不足提示 -->
      <div
        v-if="selectedPayment === 'balance' && userBalance < amount"
        class="insufficient-warning"
      >
        <el-alert
          title="余额不足，请充值后再试或选择其他支付方式"
          type="warning"
          :closable="false"
          show-icon
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
          :disabled="
            !selectedPayment ||
            (selectedPayment === 'balance' && userBalance < amount)
          "
        >
          确认支付
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ChatDotRound, Wallet, CreditCard } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  amount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const userStore = useUserStore()
const visible = ref(props.modelValue)
const selectedPayment = ref('balance') // 默认选择余额支付

// 格式化金额显示
const formatAmount = value => {
  const num = Number(value)
  if (isNaN(num)) {
    return '0.00'
  }
  return num.toFixed(2)
}

// 获取用户余额
const userBalance = computed(() => {
  const balance = userStore.balance
  // 确保返回数字类型
  if (balance === null || balance === undefined || balance === '') {
    return 0
  }
  return Number(balance) || 0
})

watch(
  () => props.modelValue,
  async newVal => {
    visible.value = newVal
    if (newVal) {
      // 对话框打开时刷新用户余额并重置为默认值
      await userStore.fetchUserBalance()

      // 如果余额充足，默认选择余额支付；否则选择微信支付
      if (userBalance.value >= props.amount) {
        selectedPayment.value = 'balance'
      } else {
        selectedPayment.value = 'wechat'
      }
    }
  }
)

watch(visible, newVal => {
  emit('update:modelValue', newVal)
})

const handleConfirm = () => {
  // 如果选择余额支付但余额不足，不允许确认
  if (selectedPayment.value === 'balance' && userBalance.value < props.amount) {
    return
  }

  emit('confirm', selectedPayment.value)
  visible.value = false
}

const handleCancel = () => {
  emit('cancel')
  visible.value = false
}

const handleClose = () => {
  emit('cancel')
}
</script>

<style scoped>
.payment-dialog-content {
  padding: 20px 0;
}

/* 订单金额显示 */
.payment-amount {
  background: linear-gradient(135deg, #5a7a98 0%, #6a8a9e 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.amount-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.amount-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--bg-card);
  font-family: 'Arial', sans-serif;
}

/* 余额信息显示 */
.balance-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  margin-bottom: 20px;
}

.balance-icon {
  color: var(--primary-color);
}

.balance-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.balance-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

.balance-amount.insufficient {
  color: var(--error-color);
}

/* 余额不足提示 */
.insufficient-warning {
  margin-top: 16px;
}

.dialog-tip {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-align: center;
}

.payment-select {
  width: 100%;
}

:deep(.payment-select .el-input__wrapper) {
  padding: 12px 16px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  transition: all 0.2s;
  box-shadow: none;
}

:deep(.payment-select .el-input__wrapper:hover) {
  background-color: var(--bg-input);
  border-color: var(--border-color);
}

:deep(.payment-select.is-focused .el-input__wrapper) {
  background-color: var(--bg-card);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.1);
}

:deep(.payment-select .el-input__inner) {
  font-size: 15px;
  color: var(--text-color);
}

/* 支付选项内容样式 */
.payment-option-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.payment-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
}

.wechat-icon {
  color: var(--success-color);
}

.alipay-icon {
  color: var(--info-color);
}

.card-icon {
  color: var(--error-color);
}

.balance-icon-opt {
  color: var(--primary-color);
}

.payment-name {
  font-size: 15px;
  color: var(--text-color);
  font-weight: 500;
  flex: 1;
}

.insufficient-tag {
  font-size: 12px;
  color: var(--error-color);
  background-color: rgba(245, 34, 45, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: auto;
}

/* 下拉面板样式 */
:deep(.el-select-dropdown__item) {
  padding: 12px 16px;
  font-size: 15px;
}

:deep(.el-select-dropdown__item.selected) {
  color: var(--primary-color);
  font-weight: 600;
  background-color: rgba(74, 129, 87, 0.1);
}

:deep(.el-select-dropdown__item:hover) {
  background-color: var(--bg-tertiary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
