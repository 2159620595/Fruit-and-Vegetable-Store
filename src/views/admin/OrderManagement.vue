<!-- 订单管理页面 -->
<template>
  <div class="order-management">
    <h1 class="page-title">订单管理</h1>

    <!-- 操作栏 -->
    <el-card class="toolbar" shadow="hover">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8">
          <el-input
            v-model="searchQuery"
            placeholder="搜索订单号"
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
            v-model="statusFilter"
            placeholder="订单状态"
            clearable
            @change="handleSearch"
            style="width: 100%"
          >
            <el-option label="全部" value="" />
            <el-option label="待付款" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已发货" value="shipped" />
            <el-option label="运输中" value="in_transit" />
            <el-option label="已送达" value="delivered" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="order-list" shadow="hover">
      <el-table
        v-loading="loading"
        :data="orderList"
        stripe
        style="width: 100%"
        :empty-text="loading ? '加载中...' : '暂无订单数据'"
      >
        <el-table-column prop="order_number" label="订单号" width="180" />
        <el-table-column prop="user_name" label="用户" width="120" />
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="order-items">
              <div
                v-for="item in row.items"
                :key="item.id"
                class="order-item"
              >
                <div class="order-item-content">
                  <el-image
                    v-if="item.product_image"
                    :src="item.product_image"
                    fit="cover"
                    lazy
                    style="width: 50px; height: 50px; border-radius: 4px; margin-right: 8px;"
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
                  <div class="order-item-info">
                    <div class="order-item-name">{{ item.product_name }}</div>
                    <div class="order-item-quantity">x{{ item.quantity }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="总金额" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 600"
              >¥{{ row.total_amount }}</span
            >
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" width="180" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button
              v-if="row.status !== 'cancelled'"
              type="warning"
              link
              size="small"
              @click="updateStatus(row)"
            >
              <el-icon><Edit /></el-icon>
              状态
            </el-button>
            <el-button type="info" link size="small" @click="handleEdit(row)">
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

    <!-- 更新状态对话框 -->
    <el-dialog v-model="statusDialogVisible" title="更新订单状态" width="400px">
      <el-form>
        <el-form-item label="订单状态">
          <el-select v-model="selectedStatus" style="width: 100%">
            <el-option label="待付款" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已发货" value="shipped" />
            <el-option label="运输中" value="in_transit" />
            <el-option label="已送达" value="delivered" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdateStatus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, View, Edit, Delete, Loading, Picture } from '@element-plus/icons-vue'
import { getOrderList, updateOrderStatus, deleteOrder } from '@/api/admin'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索关键词
const searchQuery = ref('')
const statusFilter = ref('')

// 加载状态
const loading = ref(false)

// 订单列表
const orderList = ref([])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 状态对话框
const statusDialogVisible = ref(false)
const selectedStatus = ref('')
const currentOrder = ref(null)

// 获取状态类型
const getStatusType = status => {
  const statusMap = {
    pending: 'warning',      // 待付款
    processing: 'primary',   // 处理中
    shipped: 'info',        // 已发货
    in_transit: 'info',     // 运输中
    delivered: 'success',   // 已送达
    cancelled: 'danger',     // 已取消
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = status => {
  const statusMap = {
    pending: '待付款',
    processing: '处理中',
    shipped: '已发货',
    in_transit: '运输中',
    delivered: '已送达',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

// 加载订单列表
const loadOrderList = async () => {
  loading.value = true
  try {
    const res = await getOrderList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchQuery.value,
      status: statusFilter.value,
    })
    if (res.data?.data) {
      const data = res.data.data
      orderList.value = data.list || data.items || data
      pagination.total = data.total || orderList.value.length
    } else if (res.data) {
      orderList.value = res.data.list || res.data.items || res.data
      pagination.total = res.data.total || orderList.value.length
    }
  } catch (error) {
    console.error('加载订单列表失败:', error)
    ElMessage.error(error.message || '加载订单列表失败')
    orderList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadOrderList()
}

// 分页大小改变
const handleSizeChange = () => {
  pagination.currentPage = 1
  loadOrderList()
}

// 当前页改变
const handleCurrentChange = () => {
  loadOrderList()
}

// 查看详情
const viewDetail = row => {
  router.push(`/orders/${row.id}`)
}

// 更新状态
const updateStatus = row => {
  currentOrder.value = row
  selectedStatus.value = row.status
  statusDialogVisible.value = true
}

// 确认更新状态
const confirmUpdateStatus = async () => {
  if (!currentOrder.value) return

  try {
    await updateOrderStatus(currentOrder.value.id, selectedStatus.value)
    ElMessage.success('更新状态成功')
    statusDialogVisible.value = false
    loadOrderList()
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error(error.message || '更新状态失败')
  }
}

// 编辑订单
const handleEdit = row => {
  ElMessage.info('订单编辑功能：可修改收货地址、备注等信息')
  // 这里可以添加编辑对话框
}

// 删除订单
const handleDelete = row => {
  ElMessageBox.confirm('确定要删除该订单吗？此操作不可恢复！', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteOrder(row.id)
        ElMessage.success('删除成功')
        loadOrderList()
      } catch (error) {
        console.error('删除订单失败:', error)
        ElMessage.error(error.message || '删除失败')
      }
    })
    .catch(() => {})
}

// 页面加载时获取订单列表
onMounted(() => {
  loadOrderList()
})
</script>

<style scoped>
.order-management {
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

.order-list {
  min-height: 400px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item {
  font-size: 13px;
  color: #666;
}

.order-item-content {
  display: flex;
  align-items: center;
}

.order-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-item-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.order-item-quantity {
  font-size: 12px;
  color: #999;
}

.image-slot {
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

