# Fresh Harvest 电商系统后端 API 文档

## 📋 项目说明

这是 Fresh Harvest 电商系统的完整后端代码，包含所有优化和新增功能。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

修改 `app.js` 中的数据库配置：

```javascript
const pool = mysql.createPool({
  host: 'your_host',
  user: 'your_user',
  password: 'your_password',
  database: 'fresh_harvest',
  // ...
})
```

### 3. 启动服务器

```bash
# 开发环境
node app.js

# 或使用 nodemon 自动重启
npx nodemon app.js

# 生产环境
NODE_ENV=production node app.js
```

服务器默认运行在 `http://localhost:3000`

## 📦 依赖包

```json
{
  "express": "^4.18.0",
  "cors": "^2.8.5",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "mysql2": "^3.0.0"
}
```

## 🗄️ 数据库优化

运行以下 SQL 语句优化数据库性能：

```sql
-- 为 orders 表添加物流单号字段
ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(50) DEFAULT NULL;
ALTER TABLE orders ADD INDEX idx_tracking_number (tracking_number);

-- 为 orders 表添加更多索引以提升查询性能
ALTER TABLE orders ADD INDEX idx_user_status (user_id, status);
ALTER TABLE orders ADD INDEX idx_order_number (order_number);

-- 为 order_items 表添加商品名称索引（支持商品搜索）
ALTER TABLE order_items ADD INDEX idx_product_name (product_name);
```

## 📚 API 接口列表

### 1. 用户认证

| 方法 | 路径                    | 说明       |
| ---- | ----------------------- | ---------- |
| POST | `/api/auth/register`    | 用户注册   |
| POST | `/api/auth/login`       | 用户登录   |
| POST | `/api/auth/send-code`   | 发送验证码 |
| POST | `/api/auth/third-party` | 第三方登录 |

### 2. 首页

| 方法 | 路径          | 说明         |
| ---- | ------------- | ------------ |
| GET  | `/api/home`   | 获取首页数据 |
| GET  | `/api/search` | 搜索商品     |

### 3. 商品

| 方法 | 路径                           | 说明         |
| ---- | ------------------------------ | ------------ |
| GET  | `/api/products/:id`            | 获取商品详情 |
| GET  | `/api/products/:id/reviews`    | 获取商品评价 |
| GET  | `/api/categories/:id/products` | 获取分类商品 |

### 4. 购物车

| 方法   | 路径                     | 说明           |
| ------ | ------------------------ | -------------- |
| GET    | `/api/cart`              | 获取购物车     |
| POST   | `/api/cart`              | 添加到购物车   |
| PUT    | `/api/cart/:id`          | 更新购物车     |
| DELETE | `/api/cart/:id`          | 删除购物车商品 |
| DELETE | `/api/cart`              | 清空购物车     |
| POST   | `/api/cart/batch-delete` | 批量删除       |
| PUT    | `/api/cart/:id/select`   | 选中/取消选中  |
| PUT    | `/api/cart/select-all`   | 全选/取消全选  |
| GET    | `/api/cart/count`        | 获取购物车数量 |

### 5. 订单（优化版）⭐

| 方法   | 路径                              | 说明         | 新增/优化                |
| ------ | --------------------------------- | ------------ | ------------------------ |
| POST   | `/api/orders`                     | 创建订单     |                          |
| GET    | `/api/orders`                     | 获取订单列表 | ✨ 添加 total 和完整分页 |
| GET    | `/api/orders/:id`                 | 获取订单详情 |                          |
| PUT    | `/api/orders/:id/status`          | 更新订单状态 | ✨ 状态流转验证          |
| POST   | `/api/orders/:id/pay`             | 支付订单     |                          |
| PUT    | `/api/orders/:id/cancel`          | 取消订单     |                          |
| PUT    | `/api/orders/:id/confirm`         | 确认收货     |                          |
| DELETE | `/api/orders/:id`                 | 删除订单     |                          |
| POST   | `/api/orders/:id/buy-again`       | 再次购买     |                          |
| POST   | `/api/buy-now`                    | 立即购买     |                          |
| GET    | `/api/orders/count`               | 获取订单统计 |                          |
| GET    | `/api/logistics/:orderId`         | 获取物流信息 | 🆕 新增                  |
| GET    | `/api/orders/search`              | 订单搜索     | 🆕 新增                  |
| POST   | `/api/orders/batch-update-status` | 批量更新状态 | 🆕 新增                  |
| GET    | `/api/orders/statistics`          | 订单数据统计 | 🆕 新增                  |

### 6. 收货地址

| 方法   | 路径                 | 说明         |
| ------ | -------------------- | ------------ |
| GET    | `/api/addresses`     | 获取地址列表 |
| POST   | `/api/addresses`     | 添加地址     |
| PUT    | `/api/addresses/:id` | 更新地址     |
| DELETE | `/api/addresses/:id` | 删除地址     |

### 7. 收藏

| 方法 | 路径             | 说明          |
| ---- | ---------------- | ------------- |
| POST | `/api/favorites` | 添加/取消收藏 |
| GET  | `/api/favorites` | 获取收藏列表  |

### 8. 评价

| 方法 | 路径                    | 说明     |
| ---- | ----------------------- | -------- |
| POST | `/api/reviews`          | 添加评价 |
| POST | `/api/reviews/:id/like` | 评价点赞 |

### 9. 用户中心

| 方法 | 路径                        | 说明         |
| ---- | --------------------------- | ------------ |
| GET  | `/api/user/profile`         | 获取用户信息 |
| PUT  | `/api/user/profile`         | 更新用户信息 |
| PUT  | `/api/user/change-password` | 修改密码     |

### 10. 系统管理

| 方法 | 路径               | 说明     |
| ---- | ------------------ | -------- |
| GET  | `/api/health`      | 健康检查 |
| GET  | `/api/admin/stats` | 系统统计 |

## 🔄 订单状态流转规则

```
pending (待支付)
  ↓ 支付成功
processing (待发货)
  ↓ 商家发货
shipped (已发货)
  ↓ 运输中
in_transit (运输中)
  ↓ 送达
delivered (已送达)

任何状态 → cancelled (已取消)
```

### 状态流转验证

后端会自动验证状态流转是否合法：

- ✅ `pending` → `processing` (支付成功)
- ✅ `processing` → `shipped` (商家发货)
- ✅ `shipped` → `in_transit` (运输中)
- ✅ `in_transit` → `delivered` (送达)
- ❌ `delivered` → `shipped` (不允许)
- ❌ `cancelled` → 任何状态 (不允许)

## 💻 前端调用示例

### 1. 订单列表（带分页）

```javascript
// src/api/order.js
export const getOrderList = params => {
  return request.get('/orders', { params })
}

// 调用
const result = await getOrderList({
  status: 'all', // 或 'pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled'
  page: 1,
  page_size: 10
})

// 返回数据
{
  code: 200,
  message: '获取成功',
  data: {
    orders: [...],
    total: 53,        // ⭐ 总订单数
    page: 1,
    page_size: 10,
    counts: {         // ⭐ 各状态数量
      to_pay: 3,
      to_ship: 4,
      to_receive: 8,
      in_transit: 5,
      to_review: 31,
      cancelled: 2
    }
  }
}
```

### 2. 更新订单状态（自动流转）

```javascript
// src/api/order.js
export const updateOrderStatus = (id, status) => {
  return request.put(`/orders/${id}/status`, { status })
}

// 调用
const result = await updateOrderStatus(orderId, 'shipped')

// 成功返回
{
  code: 200,
  message: '订单状态更新成功',
  data: { order对象 }
}

// 失败返回（状态流转不合法）
{
  code: 400,
  message: '订单状态不能从"待支付"变更为"已发货"'
}
```

### 3. 获取物流信息

```javascript
// src/api/logistics.js
export const getLogistics = orderId => {
  return request.get(`/logistics/${orderId}`)
}

// 返回数据
{
  code: 200,
  message: '获取成功',
  data: {
    order_id: 55,
    order_number: 'ORD1760870718178E39KNDJGB',
    tracking_number: 'SF1234567890',
    carrier: '顺丰速运',
    status: 'delivered',
    traces: [
      {
        time: '2025-10-20T10:30:00.000Z',
        status: '已签收',
        description: '快件已签收，签收人：本人'
      },
      // ...更多轨迹
    ]
  }
}
```

### 4. 订单搜索

```javascript
// src/api/order.js
export const searchOrders = params => {
  return request.get('/orders/search', { params })
}

// 调用
const result = await searchOrders({
  keyword: '芒果',
  page: 1,
  page_size: 10,
})
```

### 5. 批量更新订单状态

```javascript
// src/api/order.js
export const batchUpdateOrderStatus = data => {
  return request.post('/orders/batch-update-status', data)
}

// 调用
const result = await batchUpdateOrderStatus({
  order_ids: [1, 2, 3],
  status: 'shipped'
})

// 返回
{
  code: 200,
  message: '批量更新完成',
  data: {
    success_count: 2,
    error_count: 1,
    results: [
      { order_id: 1, success: true },
      { order_id: 2, success: true }
    ],
    errors: [
      { order_id: 3, error: '订单状态不能从"待支付"变更为"已发货"' }
    ]
  }
}
```

## 🔧 环境变量配置

创建 `.env` 文件：

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
DB_HOST=120.78.238.149
DB_USER=root
DB_PASSWORD=123456
DB_NAME=fresh_harvest

# JWT配置
JWT_SECRET=your-secret-key-change-in-production
```

## 📝 日志输出

服务器会输出增强的请求日志：

```
✅ [2025-10-20T10:30:00.123Z] GET /api/orders - 200 (45ms)
❌ [2025-10-20T10:30:01.456Z] PUT /api/orders/123/status - 400 (12ms)
🔄 更新订单状态: 55 (ORD1760870718178E39KNDJGB) pending -> processing
✅ 订单状态更新成功: 55 -> processing
📦 已恢复订单 52 的商品库存
```

## ⚠️ 注意事项

1. **安全性**
   - 生产环境请修改 `JWT_SECRET`
   - 数据库密码使用环境变量
   - 启用 HTTPS

2. **性能优化**
   - 已添加数据库索引
   - 使用连接池
   - 并行查询优化

3. **错误处理**
   - 所有接口都有统一的错误处理
   - 生产环境不返回详细错误信息

4. **数据一致性**
   - 订单创建使用事务
   - 状态更新带流转验证
   - 取消订单自动恢复库存

## 🎯 自动状态流转使用

前端可以使用定时器实现自动状态流转：

```javascript
// OrderList.vue
const startAutoStatusFlow = orderId => {
  const statusFlow = ['processing', 'shipped', 'in_transit', 'delivered']
  let currentIndex = 0

  const timer = setInterval(async () => {
    if (currentIndex >= statusFlow.length) {
      clearInterval(timer)
      return
    }

    const nextStatus = statusFlow[currentIndex]

    try {
      await orderStore.updateOrderStatus(orderId, nextStatus)
      ElMessage.success(`订单状态已更新为：${getStatusText(nextStatus)}`)
      currentIndex++
    } catch (error) {
      clearInterval(timer)
      // 后端会返回具体的错误信息
      console.error('状态更新失败:', error)
    }
  }, 60000) // 每60秒执行一次
}
```

## 📞 技术支持

如有问题，请查看：

- 完整代码：`app.js`
- API 文档：本文件
- 数据库优化：见上方 SQL 语句

---

**版本**: 1.0.0 (完整优化版)  
**最后更新**: 2025-10-20
