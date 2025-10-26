<!-- 商品管理页面 -->
<template>
  <div class="product-management">
    <h1 class="page-title">商品管理</h1>

    <!-- 操作栏 -->
    <el-card class="toolbar" shadow="hover">
      <el-row :gutter="20" justify="space-between" style="margin-bottom: 15px">
        <el-col :xs="24" :sm="12" :md="10">
          <el-input
            v-model="searchQuery"
            placeholder="搜索商品名称"
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
        <el-col :xs="24" :sm="12" :md="8" style="text-align: right">
          <el-button @click="handleManageCategories">
            <el-icon><Management /></el-icon>
            管理分类
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="24">
          <el-tag
            v-for="cat in categories"
            :key="cat.id"
            :type="selectedCategory === cat.name ? 'primary' : 'info'"
            @click="handleCategoryFilter(cat.name)"
            style="cursor: pointer; margin-right: 10px; margin-bottom: 5px"
          >
            {{ cat.name }}
          </el-tag>
          <el-tag
            v-if="selectedCategory"
            type="danger"
            @click="handleCategoryFilter('')"
            style="cursor: pointer"
          >
            清除筛选
          </el-tag>
        </el-col>
      </el-row>
    </el-card>

    <!-- 商品列表 -->
    <el-card class="product-list" shadow="hover">
      <el-table
        v-loading="loading"
        :data="productList"
        stripe
        style="width: 100%"
        @sort-change="handleSortChange"
        :empty-text="loading ? '加载中...' : '暂无数据'"
      >
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />
        <el-table-column label="商品图片" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.image_url || row.imageUrl"
              fit="cover"
              lazy
              style="width: 80px; height: 80px; border-radius: 4px"
              :preview-src-list="[row.image_url || row.imageUrl]"
              :z-index="99999"
              preview-teleported
            >
              <template #placeholder>
                <div class="image-slot">
                  <el-icon><Loading /></el-icon>
                </div>
              </template>
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column
          prop="price"
          label="价格"
          width="120"
          sortable="custom"
        >
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 600"
              >¥{{ row.price }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="stock"
          label="库存"
          width="100"
          sortable="custom"
        >
          <template #default="{ row }">
            <el-tag :type="row.stock > 10 ? 'success' : 'warning'">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
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

    <!-- 添加/编辑商品对话框 -->
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
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select
            v-model="formData.category"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="formData.stock"
            :min="0"
            :step="1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="formData.unit" placeholder="例如：斤、kg、个" />
        </el-form-item>
        <el-form-item label="图片URL" prop="imageUrl">
          <el-input
            v-model="formData.imageUrl"
            placeholder="请输入图片URL"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">上架</el-radio>
            <el-radio value="inactive">下架</el-radio>
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

    <!-- 分类管理对话框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      title="管理分类"
      width="800px"
      :close-on-click-modal="false"
    >
      <div style="margin-bottom: 20px">
        <el-button type="primary" @click="handleAddCategory">
          <el-icon><Plus /></el-icon>
          添加分类
        </el-button>
      </div>

      <el-table :data="allCategories" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" min-width="120" />
        <el-table-column prop="name_en" label="英文名称" min-width="120" />
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column label="图标" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.icon"
              :src="row.icon"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
            />
            <span v-else style="color: #909399">无图标</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEditCategory(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDeleteCategory(row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加/编辑分类对话框 -->
      <el-dialog
        v-model="categoryFormDialogVisible"
        :title="categoryFormTitle"
        width="500px"
        :close-on-click-modal="false"
        append-to-body
      >
        <el-form
          ref="categoryFormRef"
          :model="categoryFormData"
          :rules="categoryFormRules"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="categoryFormData.name" placeholder="请输入分类名称" />
          </el-form-item>
          <el-form-item label="英文名称" prop="name_en">
            <el-input v-model="categoryFormData.name_en" placeholder="请输入英文名称" />
          </el-form-item>
          <el-form-item label="图标URL" prop="icon">
            <el-input v-model="categoryFormData.icon" placeholder="请输入图标URL" />
          </el-form-item>
          <el-form-item label="排序" prop="sort_order">
            <el-input-number
              v-model="categoryFormData.sort_order"
              :min="0"
              :step="1"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="categoryFormDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSubmitCategory"
            :loading="categorySubmitting"
          >
            确定
          </el-button>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Edit,
  Delete,
  Picture,
  Loading,
  Management,
} from '@element-plus/icons-vue'
import {
  getProductList,
  addProduct,
  updateProduct,
  deleteProduct,
  getCategoryList,
  addCategory,
  updateCategory,
  deleteCategory,
} from '@/api/admin'

// 搜索关键词
const searchQuery = ref('')
const selectedCategory = ref('')

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 分类相关
const categories = ref([])
const categoryDialogVisible = ref(false)
const categoryFormDialogVisible = ref(false)
const categoryFormTitle = ref('添加分类')
const categorySubmitting = ref(false)
const allCategories = ref([])
const categoryFormRef = ref(null)

// 分类表单数据
const categoryFormData = reactive({
  id: null,
  name: '',
  name_en: '',
  icon: '',
  sort_order: 0,
})

// 分类表单验证规则
const categoryFormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

// 商品列表
const productList = ref([])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 排序数据
const sortData = reactive({
  prop: '',
  order: '',
})

// 对话框显示状态
const dialogVisible = ref(false)
const dialogTitle = ref('添加商品')

// 表单引用
const formRef = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  category: '',
  price: 0,
  stock: 0,
  unit: '',
  imageUrl: '',
  description: '',
  status: 'active',
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
  imageUrl: [{ required: true, message: '请输入图片URL', trigger: 'blur' }],
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const res = await getCategoryList()
    
    // 处理不同的数据返回格式
    let categoryList = []
    if (res.data?.data?.list) {
      categoryList = res.data.data.list
    } else if (res.data?.data) {
      categoryList = Array.isArray(res.data.data) ? res.data.data : (res.data.data.list || [])
    } else if (res.data?.list) {
      categoryList = res.data.list
    } else if (Array.isArray(res.data)) {
      categoryList = res.data
    }
    
    // 确保返回的是数组
    categories.value = Array.isArray(categoryList) ? categoryList : []
  } catch (error) {
    console.error('加载分类列表失败:', error)
    categories.value = []
  }
}

// 加载商品列表
const loadProductList = async () => {
  loading.value = true
  try {
    const res = await getProductList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchQuery.value,
      category: selectedCategory.value,
      sortProp: sortData.prop,
      sortOrder: sortData.order,
    })
    if (res.data?.data) {
      const data = res.data.data
      productList.value = data.list || data.items || data
      pagination.total = data.total || productList.value.length
    } else if (res.data) {
      productList.value = res.data.list || res.data.items || res.data
      pagination.total = res.data.total || productList.value.length
    }
  } catch (error) {
    console.error('加载商品列表失败:', error)
    ElMessage.error(error.message || '加载商品列表失败')
    // 即使失败也显示空列表，不影响用户操作
    productList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadProductList()
}

// 排序
const handleSortChange = ({ prop, order }) => {
  sortData.prop = prop
  sortData.order = order
  loadProductList()
}

// 分页大小改变
const handleSizeChange = () => {
  pagination.currentPage = 1
  loadProductList()
}

// 当前页改变
const handleCurrentChange = () => {
  loadProductList()
}

// 添加商品
const handleAdd = () => {
  dialogTitle.value = '添加商品'
  resetForm()
  dialogVisible.value = true
}

// 编辑商品
const handleEdit = row => {
  dialogTitle.value = '编辑商品'
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    stock: row.stock,
    unit: row.unit,
    imageUrl: row.image_url || row.imageUrl,
    description: row.description,
    status: row.status,
  })
  dialogVisible.value = true
}

// 删除商品
const handleDelete = row => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteProduct(row.id)
        ElMessage.success('删除成功')
        loadProductList()
      } catch (error) {
        console.error('删除商品失败:', error)
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
        await updateProduct(formData.id, formData)
        ElMessage.success('更新成功')
      } else {
        // 添加
        await addProduct(formData)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      loadProductList()
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
  formData.name = ''
  formData.category = ''
  formData.price = 0
  formData.stock = 0
  formData.unit = ''
  formData.imageUrl = ''
  formData.description = ''
  formData.status = 'active'
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 分类筛选
const handleCategoryFilter = category => {
  selectedCategory.value = category
  pagination.currentPage = 1
  loadProductList()
}

// 打开分类管理
const handleManageCategories = async () => {
  categoryDialogVisible.value = true
  await loadCategoryList()
}

// 加载所有分类（用于分类管理）
const loadCategoryList = async () => {
  try {
    const res = await getCategoryList()
    
    // 处理不同的数据返回格式
    let categories = []
    if (res.data?.data?.list) {
      categories = res.data.data.list
    } else if (res.data?.data) {
      categories = Array.isArray(res.data.data) ? res.data.data : (res.data.data.list || [])
    } else if (res.data?.list) {
      categories = res.data.list
    } else if (Array.isArray(res.data)) {
      categories = res.data
    }
    
    // 确保返回的是数组
    allCategories.value = Array.isArray(categories) ? categories : []
  } catch (error) {
    console.error('加载分类列表失败:', error)
    ElMessage.error('加载分类列表失败')
    allCategories.value = []
  }
}

// 添加分类
const handleAddCategory = () => {
  categoryFormTitle.value = '添加分类'
  resetCategoryForm()
  categoryFormDialogVisible.value = true
}

// 编辑分类
const handleEditCategory = row => {
  categoryFormTitle.value = '编辑分类'
  Object.assign(categoryFormData, {
    id: row.id,
    name: row.name,
    name_en: row.name_en || '',
    icon: row.icon || '',
    sort_order: row.sort_order || 0,
  })
  categoryFormDialogVisible.value = true
}

// 删除分类
const handleDeleteCategory = row => {
  ElMessageBox.confirm(
    `确定要删除分类"${row.name}"吗？如果有商品使用此分类，将无法删除。`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        await deleteCategory(row.id)
        ElMessage.success('删除成功')
        await loadCategoryList()
        // 如果删除的是当前筛选的分类，清除筛选
        if (selectedCategory.value === row.name) {
          selectedCategory.value = ''
          loadProductList()
        }
        // 重新加载分类列表用于商品选择
        await loadCategories()
      } catch (error) {
        console.error('删除分类失败:', error)
        ElMessage.error(error.message || '删除失败')
      }
    })
    .catch(() => {})
}

// 提交分类表单
const handleSubmitCategory = async () => {
  if (!categoryFormRef.value) return

  await categoryFormRef.value.validate(async valid => {
    if (!valid) return

    categorySubmitting.value = true
    try {
      if (categoryFormData.id) {
        // 编辑
        await updateCategory(categoryFormData.id, categoryFormData)
        ElMessage.success('更新成功')
      } else {
        // 添加
        await addCategory(categoryFormData)
        ElMessage.success('添加成功')
      }
      categoryFormDialogVisible.value = false
      await loadCategoryList()
      // 重新加载分类列表用于商品选择
      await loadCategories()
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error(error.message || '提交失败')
    } finally {
      categorySubmitting.value = false
    }
  })
}

// 重置分类表单
const resetCategoryForm = () => {
  categoryFormData.id = null
  categoryFormData.name = ''
  categoryFormData.name_en = ''
  categoryFormData.icon = ''
  categoryFormData.sort_order = 0
  if (categoryFormRef.value) {
    categoryFormRef.value.clearValidate()
  }
}

// 页面加载时获取商品列表和分类列表
onMounted(async () => {
  await loadCategories()
  await loadProductList()
})
</script>

<style scoped>
.product-management {
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

.product-list {
  min-height: 400px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table__empty-text) {
  line-height: 60px;
  color: #909399;
}

:deep(.el-pagination) {
  margin-top: 20px;
  justify-content: center;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .toolbar :deep(.el-col) {
    margin-bottom: 10px;
  }
}
</style>

