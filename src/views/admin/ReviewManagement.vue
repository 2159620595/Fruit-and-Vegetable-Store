<!-- 评价管理页面 -->
<template>
  <div class="review-management">
    <h1 class="page-title">评价管理</h1>

    <!-- 操作栏 -->
    <el-card class="toolbar" shadow="hover">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8">
          <el-input
            v-model="searchQuery"
            placeholder="搜索商品名称"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-select
            v-model="ratingFilter"
            placeholder="评分筛选"
            clearable
            @change="handleSearch"
            style="width: 100%"
          >
            <el-option label="全部" value="" />
            <el-option label="5星" :value="5" />
            <el-option label="4星" :value="4" />
            <el-option label="3星" :value="3" />
            <el-option label="2星" :value="2" />
            <el-option label="1星" :value="1" />
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <!-- 评价列表 -->
    <el-card class="review-list" shadow="hover">
      <el-table
        v-loading="loading"
        :data="reviewList"
        stripe
        style="width: 100%"
        :empty-text="loading ? '加载中...' : '暂无评价数据'"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="product_name" label="商品" min-width="150" />
        <el-table-column prop="user_name" label="用户" width="120" />
        <el-table-column label="评分" width="150">
          <template #default="{ row }">
            <el-rate
              :model-value="row.rating"
              disabled
              show-score
              text-color="#ff9900"
            />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" min-width="300">
          <template #default="{ row }">
            <div class="review-content-wrapper">
              <div
                :class="['review-content', { 'expanded': row.expanded }]"
                :style="{
                  maxHeight: row.expanded ? 'none' : '60px',
                  overflow: row.expanded ? 'visible' : 'hidden'
                }"
              >
                {{ row.comment || row.content || '暂无评价内容' }}
              </div>
              <el-button
                v-if="(row.comment || row.content) && (row.comment || row.content).length > 80"
                type="text"
                size="small"
                @click="row.expanded = !row.expanded"
                style="margin-top: 4px; padding: 0"
              >
                {{ row.expanded ? '收起' : '展开' }}
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <div v-if="row.images && row.images.length > 0">
              <el-image
                :src="row.images[0]"
                :preview-src-list="row.images"
                fit="cover"
                lazy
                style="width: 60px; height: 60px; border-radius: 4px"
                :z-index="9999"
              >
                <template #placeholder>
                  <div class="image-loading">
                    <el-icon><Loading /></el-icon>
                  </div>
                </template>
                <template #error>
                  <div class="image-loading">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <span v-else style="color: #999">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="评价时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
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

    <!-- 编辑评价对话框 -->
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
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="formData.rating" show-score />
        </el-form-item>
        <el-form-item label="评价内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="6"
            placeholder="请输入评价内容"
          />
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
import { Search, Edit, Delete, Picture, Loading } from '@element-plus/icons-vue'
import { getReviewList, deleteReview, updateReview } from '@/api/admin'

// 搜索关键词
const searchQuery = ref('')
const ratingFilter = ref('')

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 评价列表
const reviewList = ref([])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('编辑评价')

// 表单引用
const formRef = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  content: '',
  rating: 5,
})

// 表单验证规则
const formRules = {
  content: [{ required: true, message: '请输入评价内容', trigger: 'blur' }],
  rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
}

// 加载评价列表
const loadReviewList = async () => {
  loading.value = true
  try {
    const res = await getReviewList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchQuery.value,
      rating: ratingFilter.value,
    })
    if (res.data?.data) {
      const data = res.data.data
      reviewList.value = data.list || data.items || data
      pagination.total = data.total || reviewList.value.length
    } else if (res.data) {
      reviewList.value = res.data.list || res.data.items || res.data
      pagination.total = res.data.total || reviewList.value.length
    }
  } catch (error) {
    console.error('加载评价列表失败:', error)
    ElMessage.error(error.message || '加载评价列表失败')
    reviewList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadReviewList()
}

// 分页大小改变
const handleSizeChange = () => {
  pagination.currentPage = 1
  loadReviewList()
}

// 当前页改变
const handleCurrentChange = () => {
  loadReviewList()
}

// 编辑评价
const handleEdit = row => {
  dialogTitle.value = '编辑评价'
  Object.assign(formData, {
    id: row.id,
    content: row.comment || row.content || '',
    rating: row.rating || 5,
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (!valid) return

    submitting.value = true
    try {
      await updateReview(formData.id, {
        content: formData.content,
        rating: formData.rating,
      })
      ElMessage.success('更新成功')
      dialogVisible.value = false
      loadReviewList()
    } catch (error) {
      console.error('更新失败:', error)
      ElMessage.error(error.message || '更新失败')
    } finally {
      submitting.value = false
    }
  })
}

// 删除评价
const handleDelete = row => {
  ElMessageBox.confirm('确定要删除该评价吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteReview(row.id)
        ElMessage.success('删除成功')
        loadReviewList()
      } catch (error) {
        console.error('删除评价失败:', error)
        ElMessage.error(error.message || '删除失败')
      }
    })
    .catch(() => {})
}

// 页面加载时获取评价列表
onMounted(() => {
  loadReviewList()
})
</script>

<style scoped>
.review-management {
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

.review-list {
  min-height: 400px;
}

.review-content-wrapper {
  display: flex;
  flex-direction: column;
}

.review-content {
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.image-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 20px;
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

