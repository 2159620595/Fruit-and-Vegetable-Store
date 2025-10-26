<!-- 用户管理页面 -->
<template>
  <div class="user-management">
    <h1 class="page-title">用户管理</h1>

    <!-- 操作栏 -->
    <el-card class="toolbar" shadow="hover">
      <el-row :gutter="20" justify="space-between">
        <el-col :xs="24" :sm="16">
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户名或手机号"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="max-width: 400px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="8" style="text-align: right">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加用户
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="user-list" shadow="hover">
      <el-table
        v-loading="loading"
        :data="userList"
        stripe
        style="width: 100%"
        :empty-text="loading ? '加载中...' : '暂无用户数据'"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" :size="50">
              {{ row.nickname?.charAt(0) || 'U' }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              link
              size="small"
              @click="toggleStatus(row)"
            >
              <el-icon>
                <Lock v-if="row.status === 'active'" />
                <Unlock v-else />
              </el-icon>
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            :disabled="!!formData.id"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item v-if="!formData.id" label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码（6位以上）"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="formData.role">
            <el-radio value="user">普通用户</el-radio>
            <el-radio value="admin">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Lock, Unlock, Delete } from '@element-plus/icons-vue'
import { getUserList, disableUser, enableUser, addUser, updateUser, deleteUser } from '@/api/admin'

// 搜索关键词
const searchQuery = ref('')

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 用户列表
const userList = ref([])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')

// 表单引用
const formRef = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  username: '',
  nickname: '',
  phone: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active',
})

// 表单验证规则
const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchQuery.value,
    })
    if (res.data?.data) {
      const data = res.data.data
      userList.value = data.list || data.items || data
      pagination.total = data.total || userList.value.length
    } else if (res.data) {
      userList.value = res.data.list || res.data.items || res.data
      pagination.total = res.data.total || userList.value.length
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error(error.message || '加载用户列表失败')
    userList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadUserList()
}

// 分页大小改变
const handleSizeChange = () => {
  pagination.currentPage = 1
  loadUserList()
}

// 当前页改变
const handleCurrentChange = () => {
  loadUserList()
}

// 添加用户
const handleAdd = () => {
  dialogTitle.value = '添加用户'
  resetForm()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = row => {
  dialogTitle.value = '编辑用户'
  Object.assign(formData, {
    id: row.id,
    username: row.username,
    nickname: row.nickname || '',
    phone: row.phone || '',
    email: row.email || '',
    password: '',
    role: row.role || 'user',
    status: row.status || 'active',
  })
  dialogVisible.value = true
}

// 删除用户
const handleDelete = row => {
  ElMessageBox.confirm('确定要删除该用户吗？此操作不可恢复！', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteUser(row.id)
        ElMessage.success('删除成功')
        loadUserList()
      } catch (error) {
        console.error('删除用户失败:', error)
        ElMessage.error(error.message || '删除失败')
      }
    })
    .catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (!valid) return

    submitting.value = true
    try {
      if (formData.id) {
        // 编辑
        await updateUser(formData.id, {
          nickname: formData.nickname,
          phone: formData.phone,
          email: formData.email,
          role: formData.role,
          status: formData.status,
        })
        ElMessage.success('更新成功')
      } else {
        // 添加
        await addUser(formData)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      loadUserList()
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error(error.message || '提交失败')
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  formData.id = null
  formData.username = ''
  formData.nickname = ''
  formData.phone = ''
  formData.email = ''
  formData.password = ''
  formData.role = 'user'
  formData.status = 'active'
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 切换用户状态
const toggleStatus = row => {
  const action = row.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        if (row.status === 'active') {
          await disableUser(row.id)
        } else {
          await enableUser(row.id)
        }
        ElMessage.success(`${action}成功`)
        loadUserList()
      } catch (error) {
        console.error(`${action}用户失败:`, error)
        ElMessage.error(error.message || `${action}失败`)
      }
    })
    .catch(() => {})
}

// 页面加载时获取用户列表
onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.user-management {
  padding: 0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: #000;
}

.toolbar {
  margin-bottom: 20px;
}

.user-list {
  min-height: 400px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table__empty-text) {
  line-height: 60px;
  color: #909399;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .toolbar :deep(.el-col) {
    margin-bottom: 10px;
  }
}
</style>

