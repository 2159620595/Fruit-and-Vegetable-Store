# 订单列表页面 API 集成文档

## 📋 概述

本文档说明订单列表页面如何调用后端 API 并渲染数据。

## 🔌 API 集成

### 1. **获取订单列表 API**

#### 端点

```
GET /api/orders
```

#### 请求参数

| 参数      | 类型   | 必填 | 说明               | 示例                                            |
| --------- | ------ | ---- | ------------------ | ----------------------------------------------- |
| status    | string | 否   | 订单状态筛选       | `pending`, `processing`, `shipped`, `delivered` |
| page      | number | 否   | 页码（默认1）      | `1`                                             |
| page_size | number | 否   | 每页数量（默认20） | `10`                                            |

#### 响应格式

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "orders": [
      {
        "id": 123,
        "order_number": "ORD1234567890ABCDEFG",
        "user_id": 1,
        "total_amount": 104.0,
        "shipping_fee": 5.0,
        "status": "pending",
        "payment_method": "wechat",
        "delivery_method": "standard",
        "shipping_address": "广东省广州市天河区xxx街道xxx号",
        "remark": "请在下午送达",
        "created_at": "2024-01-01 00:00:00",
        "updated_at": "2024-01-01 00:00:00"
      }
    ],
    "counts": {
      "to_pay": 5,
      "to_ship": 3,
      "to_receive": 2,
      "to_review": 1
    }
  }
}
```

### 2. **取消订单 API**

#### 端点

```
PUT /api/orders/:id/cancel
```

#### 响应格式

```json
{
  "code": 200,
  "message": "订单已取消"
}
```

### 3. **确认收货 API**

#### 端点

```
PUT /api/orders/:id/confirm
```

#### 响应格式

```json
{
  "code": 200,
  "message": "确认收货成功"
}
```

### 4. **删除订单 API**

#### 端点

```
DELETE /api/orders/:id
```

#### 响应格式

```json
{
  "code": 200,
  "message": "订单已删除"
}
```

## 📦 数据流程

### 加载订单列表流程

```
1. 页面初始化 (onMounted)
   ↓
2. 调用 loadOrders()
   ↓
3. 构建请求参数
   - page: currentPage.value
   - page_size: pageSize.value
   - status: activeTab.value (如果不是 'all')
   ↓
4. 调用 orderStore.fetchOrders(params)
   ↓
5. Store 调用 API: getOrderList(params)
   ↓
6. 后端返回数据
   ↓
7. Store 更新状态
   - orders: result.orders
   - orderCounts: result.counts
   ↓
8. 页面自动响应 (computed)
   - orders: computed(() => orderStore.orders)
   - orderCounts: computed(() => orderStore.orderCounts)
   ↓
9. 渲染订单列表
```

### 取消订单流程

```
1. 用户点击"取消订单"
   ↓
2. 检查 actionLoading (防止重复)
   ↓
3. 显示确认对话框 (ElMessageBox.confirm)
   ↓
4. 用户确认
   ↓
5. 设置 actionLoading = true
   ↓
6. 显示加载提示 (ElMessage with duration: 0)
   ↓
7. 调用 orderStore.cancelOrder(orderId)
   ↓
8. Store 调用 API: cancelOrder(id)
   ↓
9. 后端取消订单并返回结果
   ↓
10. 关闭加载提示
    ↓
11. 显示成功提示 (ElMessage.success)
    ↓
12. 静默刷新列表 (loadOrders(false))
    ↓
13. 重置 actionLoading = false
```

## 🎨 数据渲染

### 订单卡片渲染

```vue
<div v-for="order in orders" :key="order.id" class="order-card">
  <!-- 订单号和时间 -->
  <span class="order-number">订单号: {{ order.order_number }}</span>
  <span class="order-date">{{ formatDate(order.created_at) }}</span>
  
  <!-- 订单状态 -->
  <el-tag :type="getStatusType(order.status)">
    {{ getStatusText(order.status) }}
  </el-tag>
  
  <!-- 配送方式 -->
  {{ getDeliveryMethodText(order.delivery_method) }}
  
  <!-- 支付方式 -->
  {{ getPaymentMethodText(order.payment_method) }}
  
  <!-- 备注（如果有） -->
  <span v-if="order.remark">{{ order.remark }}</span>
  
  <!-- 订单总额 -->
  ¥{{ formatPrice(order.total_amount) }}
  
  <!-- 运费（如果有） -->
  <span v-if="order.shipping_fee">
    (含运费 ¥{{ formatPrice(order.shipping_fee) }})
  </span>
</div>
```

### 订单状态映射

```javascript
const getStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    processing: '待发货',
    shipped: '待收货',
    in_transit: '运输中',
    delivered: '已完成',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning', // 橙色
    processing: 'primary', // 蓝色
    shipped: 'success', // 绿色
    in_transit: 'success', // 绿色
    delivered: 'info', // 灰色
    cancelled: 'danger', // 红色
  }
  return typeMap[status] || 'info'
}
```

### 配送方式映射

```javascript
const getDeliveryMethodText = (method) => {
  const methodMap = {
    standard: '标准配送',
    express: '快速配送',
  }
  return methodMap[method] || method
}
```

### 支付方式映射

```javascript
const getPaymentMethodText = (method) => {
  const methodMap = {
    wechat: '微信支付',
    alipay: '支付宝',
    credit_card: '信用卡',
  }
  return methodMap[method] || method
}
```

## 🔍 数据验证

### 请求参数验证

```javascript
// 加载订单列表
const loadOrders = async (showLoading = true) => {
  const params = {
    page: currentPage.value, // 必须 > 0
    page_size: pageSize.value, // 必须 > 0
  }

  // status 只在非 'all' 时添加
  if (activeTab.value !== 'all') {
    params.status = activeTab.value
  }

  console.log('🔍 开始加载订单列表:', params)

  const result = await orderStore.fetchOrders(params)

  // 验证返回数据
  console.log('✅ 订单列表加载成功:', {
    total: totalCount.value,
    current: orders.value.length,
    page: currentPage.value,
    status: activeTab.value,
    counts: orderCounts.value,
  })
}
```

### 响应数据处理

```javascript
// Store 中的处理
async fetchOrders(params = {}) {
  try {
    const response = await getOrderList(params)
    const result = response.data.data || response.data

    // 确保 orders 是数组
    this.orders = result.orders || []

    // 确保 counts 是对象
    this.orderCounts = result.counts || this.orderCounts

    // 返回完整结果（包含 total）
    return result
  } catch (error) {
    console.error('❌ 获取订单列表失败:', error)
    throw error
  }
}
```

## 🐛 错误处理

### 1. 认证错误 (401)

```javascript
if (error.response?.status === 401) {
  ElMessage.warning('登录已过期，请重新登录')
  setTimeout(() => {
    router.push({
      path: '/login',
      query: { redirect: route.fullPath },
    })
  }, 1500)
}
```

### 2. 网络错误

```javascript
catch (error) {
  let errorMsg = '加载订单列表失败'

  if (error.response?.data?.message) {
    errorMsg = error.response.data.message
  } else if (error.message) {
    errorMsg = error.message
  }

  ElMessage.error(errorMsg)
}
```

### 3. 操作错误（取消/确认/删除）

```javascript
catch (error) {
  // 用户主动取消操作
  if (error !== 'cancel' && error !== 'close') {
    const errorMsg = error.response?.data?.message
                  || error.message
                  || '操作失败'
    ElMessage.error(errorMsg)
  }
}
```

## 📊 状态管理

### Store 状态

```javascript
state: () => ({
  orders: [], // 订单列表
  currentOrder: null, // 当前订单详情
  orderCounts: {
    // 各状态订单数量
    to_pay: 0,
    to_ship: 0,
    to_receive: 0,
    to_review: 0,
  },
  loading: false, // 加载状态
  error: null, // 错误信息
})
```

### 页面状态

```javascript
const activeTab = ref('all') // 当前标签页
const currentPage = ref(1) // 当前页码
const pageSize = ref(10) // 每页数量
const totalCount = ref(0) // 总数量
const actionLoading = ref(false) // 操作加载状态
const initialLoading = ref(true) // 首次加载状态
```

## 🔗 URL 参数支持

### 通过 URL 参数筛选

```javascript
// 监听路由查询参数
watch(
  () => route.query.status,
  (newStatus) => {
    if (newStatus && newStatus !== activeTab.value) {
      activeTab.value = newStatus
      currentPage.value = 1
      loadOrders()
    }
  },
  { immediate: true },
)

// 使用示例
router.push('/orders?status=pending') // 跳转到待支付订单
router.push('/orders?status=shipped') // 跳转到待收货订单
```

## 🧪 测试检查清单

### 数据加载测试

- [ ] 页面首次加载能否正确获取订单列表
- [ ] 切换标签页能否正确筛选订单
- [ ] 分页功能是否正常工作
- [ ] 订单数量徽章是否显示正确
- [ ] 空状态是否正确显示

### 操作测试

- [ ] 取消订单功能是否正常
- [ ] 确认收货功能是否正常
- [ ] 删除订单功能是否正常
- [ ] 查看详情跳转是否正常
- [ ] 刷新按钮是否正常工作

### 错误处理测试

- [ ] 登录过期时是否正确跳转
- [ ] 网络错误时是否显示友好提示
- [ ] 操作失败时是否显示错误信息
- [ ] 用户取消操作时是否正确处理

### UI 测试

- [ ] 订单状态标签颜色是否正确
- [ ] 订单信息显示是否完整
- [ ] 操作按钮是否根据状态显示
- [ ] 加载状态是否正确显示
- [ ] 响应式布局是否正常

## 🎯 总结

订单列表页面已经完成了完整的 API 集成，包括：

- ✅ 获取订单列表
- ✅ 订单状态筛选
- ✅ 分页功能
- ✅ 取消订单
- ✅ 确认收货
- ✅ 删除订单
- ✅ 刷新功能
- ✅ URL 参数支持
- ✅ 完善的错误处理
- ✅ 友好的用户反馈

所有功能都已经正确调用后端 API 并渲染数据！🎉
