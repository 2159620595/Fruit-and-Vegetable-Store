<!-- src/views/AddressManagement.vue -->
<template>
  <div class="address-management-page">
    <!-- Main Content -->
    <div class="main-content">
      <!-- 面包屑导航 -->
      <Breadcrumb current-page="收货地址" />

      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">收货地址</h1>
        <p class="page-subtitle">管理您的收货地址</p>
      </div>

      <!-- 地址列表 -->
      <div class="addresses-content">
        <!-- 工具栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <span class="total-count">共 {{ addresses.length }} 个地址</span>
          </div>
          <div class="toolbar-right">
            <el-button type="primary" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>
              添加新地址
            </el-button>
          </div>
        </div>

        <!-- 地址卡片列表 -->
        <div v-loading="loading" class="addresses-grid">
          <div v-if="addresses.length === 0" class="no-addresses">
            <p>暂无地址数据，请检查API调用</p>
            <p>当前地址数量: {{ addresses.length }}</p>
          </div>
          <div
            v-for="address in addresses"
            :key="address.id"
            class="address-card"
            :class="{ default: address.is_default === 1 }"
          >
            <div class="card-header">
              <div class="address-info">
                <div class="receiver-name">
                  {{ address.recipient_name }}
                  <span class="phone">{{ address.phone }}</span>
                  <span v-if="address.label" class="address-label">
                    {{ address.label }}
                  </span>
                </div>
                <div class="address-detail">
                  {{ address.region }} {{ address.detailed_address }}
                </div>
              </div>
              <div class="card-actions">
                <el-button
                  v-if="address.is_default !== 1"
                  type="primary"
                  size="small"
                  @click="setDefault(address.id)"
                >
                  设为默认
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="editAddress(address)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="deleteAddress(address.id)"
                >
                  删除
                </el-button>

                <div v-if="address.is_default === 1" class="default-badge">
                  <el-icon><Check /></el-icon>
                  默认地址
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 添加/编辑地址对话框 -->
  <el-dialog
    v-model="showAddDialog"
    :title="editingAddress ? '编辑地址' : '添加地址'"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="addressFormRef"
      :model="addressForm"
      :rules="addressRules"
      label-width="80px"
    >
      <el-form-item label="收货人" prop="recipient_name">
        <el-input
          v-model="addressForm.recipient_name"
          placeholder="请输入收货人姓名"
        />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="addressForm.phone"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </el-form-item>

      <el-form-item label="所在地区" prop="region">
        <RegionSelector
          ref="regionSelectorRef"
          v-model="addressForm.region"
          @change="handleRegionChange"
        />
      </el-form-item>

      <el-form-item label="详细地址" prop="detailed_address">
        <el-input
          v-model="addressForm.detailed_address"
          type="textarea"
          :rows="3"
          placeholder="请输入详细地址"
        />
      </el-form-item>

      <el-form-item label="地址标签" prop="label">
        <el-select
          v-model="addressForm.label"
          placeholder="请选择地址标签"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="option in labelOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="设为默认">
        <el-switch
          v-model="addressForm.is_default"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelEdit">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveAddress">
          {{ saving ? '保存中...' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Check } from '@element-plus/icons-vue'
import Breadcrumb from '../components/Breadcrumb.vue'
import RegionSelector from '../components/RegionSelector.vue'
import {
  getAddressList,
  createAddress,
  updateAddress,
  deleteAddress as deleteAddressAPI,
} from '../api/address.js'

// 地址标签选项
const labelOptions = [
  { value: '家', label: '家' },
  { value: '公司', label: '公司' },
  { value: '学校', label: '学校' },
  { value: '父母家', label: '父母家' },
  { value: '朋友家', label: '朋友家' },
  { value: '其他', label: '其他' },
]

// 响应式数据
const addresses = ref([])
const showAddDialog = ref(false)
const editingAddress = ref(null)
const saving = ref(false)
const loading = ref(false)

const addressFormRef = ref(null)
const regionSelectorRef = ref(null)
const addressForm = ref({
  recipient_name: '',
  phone: '',
  region: [], // 用于级联选择器的数组
  regionString: '', // 用于提交的字符串
  detailed_address: '',
  label: '',
  is_default: false,
})

const addressRules = {
  recipient_name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur',
    },
  ],
  region: [{ required: true, message: '请选择所在地区', trigger: 'change' }],
  detailed_address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    {
      min: 5,
      max: 100,
      message: '地址长度在 5 到 100 个字符',
      trigger: 'blur',
    },
  ],
  label: [
    {
      validator: (rule, value, callback) => {
        if (value && !labelOptions.some(option => option.value === value)) {
          callback(new Error('请选择有效的地址标签'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}

// 方法
const loadAddresses = async () => {
  loading.value = true
  try {
    // 调用获取地址列表的API
    const response = await getAddressList()

    // 处理后端返回的数据结构
    if (response.data && response.data.code === 200) {
      // 后端返回格式: { code: 200, message: "获取成功", data: [...] }
      addresses.value = response.data.data || []
    } else if (Array.isArray(response.data)) {
      // 如果后端直接返回数组
      addresses.value = response.data
    } else {
      // 如果API调用失败，使用模拟数据
      addresses.value = [
        {
          id: 1,
          user_id: 6,
          recipient_name: '张三',
          phone: '13800138000',
          region: '北京市 北京市 朝阳区',
          detailed_address: '三里屯街道工体北路8号',
          label: '家',
          is_default: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          user_id: 6,
          recipient_name: '李四',
          phone: '13900139000',
          region: '上海市 上海市 浦东新区',
          detailed_address: '陆家嘴环路1000号',
          label: '公司',
          is_default: 0,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ]
    }
  } catch {
    ElMessage.error('加载地址列表失败')
    addresses.value = []
  } finally {
    loading.value = false
  }
}

const handleRegionChange = regionData => {
  if (regionData && regionData.string) {
    addressForm.value.regionString = regionData.string
  }
}

const editAddress = address => {
  editingAddress.value = address

  // 使用 RegionSelector 组件的解析方法
  let regionArray = []
  if (regionSelectorRef.value && address.region) {
    regionArray = regionSelectorRef.value.parseRegionString(address.region)
  }

  addressForm.value = {
    recipient_name: address.recipient_name,
    phone: address.phone,
    region: regionArray,
    regionString: address.region, // 直接使用字符串格式
    detailed_address: address.detailed_address,
    label: address.label || '',
    is_default: address.is_default === 1,
  }
  showAddDialog.value = true
}

const cancelEdit = () => {
  showAddDialog.value = false
  editingAddress.value = null
  resetForm()
}

const resetForm = () => {
  addressForm.value = {
    recipient_name: '',
    phone: '',
    region: [],
    regionString: '',
    detailed_address: '',
    label: '',
    is_default: false,
  }
  addressFormRef.value?.resetFields()
}

const validateAddressData = data => {
  const errors = []

  // 验证收货人姓名
  if (!data.recipient_name || data.recipient_name.trim().length < 2) {
    errors.push('收货人姓名至少需要2个字符')
  }

  // 验证手机号
  if (!data.phone || !/^1[3-9]\d{9}$/.test(data.phone)) {
    errors.push('请输入正确的手机号')
  }

  // 验证地区 - region是字符串格式
  if (!data.region || data.region.trim().length < 5) {
    errors.push('请选择完整的省市区信息')
  }

  // 验证详细地址
  if (!data.detailed_address || data.detailed_address.trim().length < 5) {
    errors.push('详细地址至少需要5个字符')
  }

  return errors
}

const saveAddress = async () => {
  if (!addressFormRef.value) return

  try {
    await addressFormRef.value.validate()

    // 准备提交的数据
    const addressData = {
      recipient_name: addressForm.value.recipient_name,
      phone: addressForm.value.phone,
      region: addressForm.value.regionString, // 使用字符串格式
      detailed_address: addressForm.value.detailed_address,
      label: addressForm.value.label,
      is_default: addressForm.value.is_default ? 1 : 0,
    }

    // 额外的数据验证
    const validationErrors = validateAddressData(addressData)
    if (validationErrors.length > 0) {
      ElMessage.error(validationErrors.join('；'))
      return
    }

    saving.value = true

    if (editingAddress.value) {
      // 更新现有地址
      const response = await updateAddress(editingAddress.value.id, addressData)

      // 处理后端返回的更新后数据
      const updatedAddress = response.data?.data ||
        response.data || {
          ...editingAddress.value,
          ...addressData,
          updated_at: new Date().toISOString(),
        }

      // 更新本地状态
      const index = addresses.value.findIndex(
        addr => addr.id === editingAddress.value.id
      )
      if (index > -1) {
        addresses.value[index] = updatedAddress
      }

      // 如果设置为默认地址，需要更新其他地址的默认状态
      if (addressData.is_default === 1) {
        addresses.value.forEach((addr, idx) => {
          if (idx !== index) {
            addr.is_default = 0
          }
        })
      }

      ElMessage.success('地址更新成功')
    } else {
      // 添加新地址
      const response = await createAddress(addressData)

      // 处理后端返回的数据
      const newAddress = response.data?.data ||
        response.data || {
          id: Date.now(),
          user_id: 6, // 当前用户ID
          ...addressData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

      // 如果设置为默认地址，需要更新其他地址的默认状态
      if (addressData.is_default === 1) {
        addresses.value.forEach(addr => {
          addr.is_default = 0
        })
      }

      addresses.value.unshift(newAddress)
      ElMessage.success('地址添加成功')
    }

    showAddDialog.value = false
    editingAddress.value = null
    resetForm()

    // 重新加载地址列表以确保数据最新
    await loadAddresses()
  } catch (error) {
    if (error.message) {
      ElMessage.error('保存失败: ' + error.message)
    } else {
      ElMessage.error('保存失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

const setDefault = async addressId => {
  try {
    await ElMessageBox.confirm('确定要设为默认地址吗？', '设置默认地址', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })

    // 找到要设置为默认的地址
    const targetAddress = addresses.value.find(addr => addr.id === addressId)
    if (!targetAddress) {
      ElMessage.error('地址不存在')
      return
    }

    // 使用updateAddress接口来设置默认地址
    const addressData = {
      recipient_name: targetAddress.recipient_name,
      phone: targetAddress.phone,
      region: targetAddress.region,
      detailed_address: targetAddress.detailed_address,
      label: targetAddress.label,
      is_default: 1, // 设置为默认地址
    }

    // 调用更新地址的API
    await updateAddress(addressId, addressData)

    // 更新本地状态
    addresses.value.forEach(addr => {
      addr.is_default = addr.id === addressId ? 1 : 0
    })

    ElMessage.success('设置成功')

    // 重新加载地址列表以确保数据最新
    await loadAddresses()
  } catch (error) {
    if (error !== 'cancel') {
      if (error.message) {
        ElMessage.error('设置失败: ' + error.message)
      } else {
        ElMessage.error('设置失败，请重试')
      }
    }
  }
}

const deleteAddress = async addressId => {
  try {
    await ElMessageBox.confirm('确定要删除这个地址吗？', '删除地址', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用删除地址的API
    await deleteAddressAPI(addressId)

    // 更新本地状态
    const deletedAddress = addresses.value.find(addr => addr.id === addressId)
    addresses.value = addresses.value.filter(addr => addr.id !== addressId)

    // 如果删除的是默认地址，需要设置新的默认地址
    if (
      deletedAddress &&
      deletedAddress.is_default === 1 &&
      addresses.value.length > 0
    ) {
      // 自动设置第一个地址为默认地址
      const firstAddress = addresses.value[0]
      firstAddress.is_default = 1
      try {
        const addressData = {
          recipient_name: firstAddress.recipient_name,
          phone: firstAddress.phone,
          region: firstAddress.region,
          detailed_address: firstAddress.detailed_address,
          label: firstAddress.label,
          is_default: 1,
        }
        await updateAddress(firstAddress.id, addressData)
        ElMessage.success('删除成功，已自动设置新的默认地址')
      } catch {
        ElMessage.success('删除成功')
      }
    } else {
      ElMessage.success('删除成功')
    }

    // 重新加载地址列表以确保数据最新
    await loadAddresses()
  } catch (error) {
    if (error !== 'cancel') {
      if (error.message) {
        ElMessage.error('删除失败: ' + error.message)
      } else {
        ElMessage.error('删除失败，请重试')
      }
    }
  }
}

// 生命周期
onMounted(() => {
  loadAddresses()
})
</script>

<style scoped>
.address-management-page {
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

.addresses-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.total-count {
  font-size: 14px;
  color: var(--text-secondary);
}

.addresses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.address-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  position: relative;
}

.address-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.address-card.default {
  border-color: var(--primary-color);
  background: linear-gradient(
    135deg,
    rgba(103, 194, 58, 0.05) 0%,
    rgba(133, 206, 97, 0.05) 100%
  );
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.address-info {
  flex: 1;
}

.receiver-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}

.phone {
  font-size: 14px;
  color: var(--text-secondary);
  margin-left: 12px;
  font-weight: normal;
}

.address-label {
  font-size: 12px;
  color: var(--primary-color);
  background: rgba(103, 194, 58, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.address-detail {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.default-badge {
  background: var(--primary-color);
  color: var(--text-inverse);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-left: 8px;
}

.no-addresses {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  background: var(--bg-input);
  border-radius: 8px;
  color: var(--text-secondary);
}

.no-addresses p {
  margin: 8px 0;
}

.empty-icon {
  margin-bottom: 24px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 24px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .address-management-page {
    padding: 16px;
  }

  .main-content {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .addresses-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .address-card {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .card-actions {
    width: 100%;
    justify-content: flex-start;
    gap: 12px;
  }

  .default-badge {
    position: static;
    align-self: flex-start;
  }

  .add-address-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .address-management-page {
    padding: 12px;
  }

  .main-content {
    padding: 12px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .addresses-grid {
    gap: 12px;
  }

  .address-card {
    padding: 12px;
  }

  .card-header {
    gap: 10px;
  }

  .recipient-name {
    font-size: 15px;
  }

  .phone-number {
    font-size: 13px;
  }

  .address-detail {
    font-size: 13px;
  }

  .card-actions {
    gap: 8px;
  }
}
</style>
