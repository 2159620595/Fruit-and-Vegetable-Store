<template>
  <el-dialog
    v-model="visible"
    title="订单支付"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div class="payment-dialog-content">
      <p class="dialog-tip">请选择支付方式</p>
      <el-select
        v-model="selectedPayment"
        placeholder="请选择支付方式"
        class="payment-select"
        size="large"
      >
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
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
          :disabled="!selectedPayment"
        >
          确认支付
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ChatDotRound, Wallet, CreditCard } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const visible = ref(props.modelValue)
const selectedPayment = ref('wechat')

watch(
  () => props.modelValue,
  newVal => {
    visible.value = newVal
    if (newVal) {
      // 对话框打开时重置为默认值
      selectedPayment.value = 'wechat'
    }
  }
)

watch(visible, newVal => {
  emit('update:modelValue', newVal)
})

const handleConfirm = () => {
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

.dialog-tip {
  font-size: 15px;
  color: #606266;
  margin-bottom: 16px;
  text-align: center;
}

.payment-select {
  width: 100%;
}

:deep(.payment-select .el-input__wrapper) {
  padding: 12px 16px;
  background-color: #f8f9fa;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  transition: all 0.2s;
  box-shadow: none;
}

:deep(.payment-select .el-input__wrapper:hover) {
  background-color: #f0f0f0;
  border-color: #d0d0d0;
}

:deep(.payment-select.is-focused .el-input__wrapper) {
  background-color: #ffffff;
  border-color: #67c23a;
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.1);
}

:deep(.payment-select .el-input__inner) {
  font-size: 15px;
  color: #333333;
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
  color: #07c160;
}

.alipay-icon {
  color: #1677ff;
}

.card-icon {
  color: #f5222d;
}

.payment-name {
  font-size: 15px;
  color: #333333;
  font-weight: 500;
}

/* 下拉面板样式 */
:deep(.el-select-dropdown__item) {
  padding: 12px 16px;
  font-size: 15px;
}

:deep(.el-select-dropdown__item.selected) {
  color: #67c23a;
  font-weight: 600;
  background-color: #f0f9ff;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: #f8f9fa;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
