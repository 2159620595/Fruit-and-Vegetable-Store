<template>
  <div class="address-selector">
    <div class="address-header">
      <h2 class="section-title">收货地址</h2>
      <button class="add-address-btn" @click="showAddressForm = true">
        <span class="plus-icon">+</span>
        新增地址
      </button>
    </div>

    <!-- 地址列表 -->
    <div v-if="addressStore.addresses.length > 0" class="address-list">
      <div
        v-for="address in addressStore.addresses"
        :key="address.id"
        class="address-item"
        :class="{ selected: selectedAddressId === address.id }"
        @click="selectAddress(address.id)"
      >
        <div class="address-content">
          <div class="address-header-row">
            <span class="recipient-name">{{ address.recipient_name }}</span>
            <span class="phone">{{ address.phone }}</span>
            <span v-if="address.is_default" class="default-tag">默认</span>
            <span v-if="address.label" class="label-tag">
              {{ address.label }}
            </span>
          </div>
          <div class="address-detail">
            <span v-if="address.region">{{ address.region }}</span>
            {{ address.detailed_address }}
          </div>
        </div>
        <div class="address-actions">
          <button class="action-btn edit" @click.stop="editAddress(address)">
            编辑
          </button>
          <button
            class="action-btn delete"
            @click.stop="deleteAddress(address.id)"
          >
            删除
          </button>
        </div>
        <div v-if="selectedAddressId === address.id" class="selected-icon">
          ✓
        </div>
      </div>
    </div>

    <!-- 无地址提示 -->
    <div v-else class="no-address">
      <p>暂无收货地址，请添加新地址</p>
    </div>

    <!-- 新增/编辑地址弹窗 -->
    <div
      v-if="showAddressForm"
      class="address-modal"
      @click.self="closeAddressForm"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingAddress ? '编辑地址' : '新增地址' }}</h3>
          <button class="close-btn" @click="closeAddressForm">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>收货人 *</label>
            <input
              v-model="addressForm.recipient_name"
              type="text"
              placeholder="请输入收货人姓名"
              class="form-input"
              :class="{ error: formErrors.recipient_name }"
            />
            <div v-if="formErrors.recipient_name" class="error-text">
              {{ formErrors.recipient_name }}
            </div>
          </div>

          <div class="form-group">
            <label>联系电话 *</label>
            <input
              v-model="addressForm.phone"
              type="tel"
              placeholder="请输入手机号"
              class="form-input"
              :class="{ error: formErrors.phone }"
            />
            <div v-if="formErrors.phone" class="error-text">
              {{ formErrors.phone }}
            </div>
          </div>

          <div class="form-group">
            <label>所在地区</label>
            <RegionSelector v-model="addressForm.region" />
          </div>

          <div class="form-group">
            <label>详细地址 *</label>
            <textarea
              v-model="addressForm.detailed_address"
              placeholder="街道、楼牌号等详细地址"
              class="form-textarea"
              :class="{ error: formErrors.detailed_address }"
              rows="3"
            ></textarea>
            <div v-if="formErrors.detailed_address" class="error-text">
              {{ formErrors.detailed_address }}
            </div>
          </div>

          <div class="form-group">
            <label>地址标签</label>
            <div class="label-options">
              <button
                v-for="label in labelOptions"
                :key="label"
                class="label-option"
                :class="{ active: addressForm.label === label }"
                @click="addressForm.label = label"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="addressForm.is_default" type="checkbox" />
              <span>设为默认地址</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="closeAddressForm">取消</button>
          <button
            class="submit-btn"
            @click="submitAddress"
            :disabled="submitting"
          >
            {{ submitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAddressStore } from '@/stores/addressStore'
import RegionSelector from './RegionSelector.vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const addressStore = useAddressStore()

// 选中的地址ID
const selectedAddressId = ref(props.modelValue)

// 地址表单显示
const showAddressForm = ref(false)
const editingAddress = ref(null)

// 地址表单数据
const addressForm = ref({
  recipient_name: '',
  phone: '',
  region: '',
  detailed_address: '',
  label: '',
  is_default: false,
})

// 表单错误
const formErrors = ref({
  recipient_name: '',
  phone: '',
  detailed_address: '',
})

// 提交状态
const submitting = ref(false)

// 标签选项
const labelOptions = ['家', '公司', '学校']

// 监听 props 变化
watch(
  () => props.modelValue,
  newVal => {
    selectedAddressId.value = newVal
  }
)

// 监听选中地址变化
watch(selectedAddressId, newVal => {
  emit('update:modelValue', newVal)
  const address = addressStore.addresses.find(addr => addr.id === newVal)
  emit('change', address)
})

// 页面加载时获取地址列表
onMounted(async () => {
  await addressStore.fetchAddresses()

  // 如果没有选中地址，自动选中默认地址
  if (!selectedAddressId.value && addressStore.defaultAddress) {
    selectedAddressId.value = addressStore.defaultAddress.id
  }
})

// 选择地址
const selectAddress = id => {
  selectedAddressId.value = id
}

// 编辑地址
const editAddress = address => {
  editingAddress.value = address
  addressForm.value = {
    recipient_name: address.recipient_name,
    phone: address.phone,
    region: address.region || '',
    detailed_address: address.detailed_address,
    label: address.label || '',
    is_default: address.is_default,
  }
  showAddressForm.value = true
}

// 删除地址
const deleteAddress = async id => {
  try {
    await ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  try {
    await addressStore.deleteAddress(id)

    // 如果删除的是当前选中的地址，清空选中
    if (selectedAddressId.value === id) {
      selectedAddressId.value = null
      // 自动选中默认地址
      if (addressStore.defaultAddress) {
        selectedAddressId.value = addressStore.defaultAddress.id
      }
    }
  } catch (error) {
    ElMessage.error('删除地址失败：' + error.message)
  }
}

// 验证表单
const validateForm = () => {
  // 清空错误
  formErrors.value = {
    recipient_name: '',
    phone: '',
    detailed_address: '',
  }

  let isValid = true

  // 验证收货人
  if (!addressForm.value.recipient_name.trim()) {
    formErrors.value.recipient_name = '请输入收货人姓名'
    isValid = false
  }

  // 验证手机号
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!addressForm.value.phone.trim()) {
    formErrors.value.phone = '请输入联系电话'
    isValid = false
  } else if (!phoneRegex.test(addressForm.value.phone)) {
    formErrors.value.phone = '请输入正确的手机号'
    isValid = false
  }

  // 验证详细地址
  if (!addressForm.value.detailed_address.trim()) {
    formErrors.value.detailed_address = '请输入详细地址'
    isValid = false
  }

  return isValid
}

// 提交地址
const submitAddress = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    if (editingAddress.value) {
      // 编辑地址
      await addressStore.updateAddress(
        editingAddress.value.id,
        addressForm.value
      )
    } else {
      // 新增地址
      const result = await addressStore.addAddress(addressForm.value)

      // 自动选中新增的地址
      if (result && result.address_id) {
        selectedAddressId.value = result.address_id
      }
    }

    closeAddressForm()
    ElMessage.success('保存地址成功')
  } catch (error) {
    ElMessage.error('保存地址失败：' + error.message)
  } finally {
    submitting.value = false
  }
}

// 关闭地址表单
const closeAddressForm = () => {
  showAddressForm.value = false
  editingAddress.value = null
  addressForm.value = {
    recipient_name: '',
    phone: '',
    region: '',
    detailed_address: '',
    label: '',
    is_default: false,
  }
  formErrors.value = {
    recipient_name: '',
    phone: '',
    detailed_address: '',
  }
}
</script>

<style scoped>
.address-selector {
  margin-bottom: 32px;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color) 333;
  margin: 0;
}

.add-address-btn {
  padding: 8px 16px;
  background-color: var(--bg-secondary);
  color: var(--primary-dark);
  border: 1px solid var(--primary-dark);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.add-address-btn:hover {
  background-color: var(--primary-dark);
  color: var(--bg-card);
}

.plus-icon {
  font-size: 16px;
  font-weight: bold;
}

/* 地址列表 */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-item {
  position: relative;
  padding: 16px;
  background-color: var(--bg-tertiary);
  border: 2px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.address-item:hover {
  border-color: var(--primary-dark);
  background-color: rgba(74, 129, 87, 0.05);
}

.address-item.selected {
  border-color: var(--primary-dark);
  background-color: rgba(74, 129, 87, 0.05);
}

.address-content {
  flex: 1;
  min-width: 0;
}

.address-header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.recipient-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color) 333;
}

.phone {
  font-size: 14px;
  color: var(--text-secondary) 666;
}

.default-tag {
  padding: 2px 8px;
  background-color: var(--error-color);
  color: var(--bg-card);
  border-radius: 4px;
  font-size: 12px;
}

.label-tag {
  padding: 2px 8px;
  background-color: var(--primary-dark);
  color: var(--bg-card);
  border-radius: 4px;
  font-size: 12px;
}

.address-detail {
  font-size: 14px;
  color: var(--text-secondary) 666;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
}

.action-btn {
  padding: 4px 12px;
  background-color: transparent;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  color: var(--text-secondary) 666;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: var(--primary-dark);
  color: var(--primary-dark);
}

.action-btn.delete:hover {
  border-color: var(--error-color);
  color: var(--error-color);
}

.selected-icon {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background-color: var(--primary-dark);
  color: var(--bg-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.no-address {
  padding: 40px;
  text-align: center;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  color: var(--text-light) 999;
}

/* 地址表单弹窗 */
.address-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color) 333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: var(--text-light) 999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-color) 333;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color) 333;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-dark);
}

.form-input.error,
.form-textarea.error {
  border-color: var(--error-color);
}

.error-text {
  color: var(--error-color);
  font-size: 12px;
  margin-top: 4px;
}

.label-options {
  display: flex;
  gap: 12px;
}

.label-option {
  padding: 8px 20px;
  background-color: var(--bg-tertiary);
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-secondary) 666;
  cursor: pointer;
  transition: all 0.2s;
}

.label-option:hover {
  border-color: var(--primary-dark);
  color: var(--primary-dark);
}

.label-option.active {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
  color: var(--bg-card);
}

.checkbox-group {
  margin-bottom: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
  margin-bottom: 0;
}

.checkbox-label input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.submit-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary) 666;
}

.cancel-btn:hover {
  background-color: var(--border-light);
}

.submit-btn {
  background-color: var(--primary-dark);
  color: var(--bg-card);
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--primary-color);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 768px) {
  .address-item {
    flex-direction: column;
  }

  .address-actions {
    margin-left: 0;
    margin-top: 12px;
    align-self: flex-end;
  }

  .modal-content {
    width: 95%;
  }
}
</style>
