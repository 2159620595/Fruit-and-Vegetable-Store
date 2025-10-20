// ============================================
// Fresh Harvest 电商系统后端 - app.js
// 完整版本 - 包含所有优化和新增功能
// ============================================

const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mysql = require('mysql2/promise')
const pinyinMatch = require('pinyin-match')

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// ============================================
// 数据库连接池配置
// ============================================
const pool = mysql.createPool({
  host: process.env.DB_HOST || '120.78.238.149',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'fresh_harvest',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
})

// ============================================
// 中间件配置
// ============================================
app.use(
  cors({
    origin: '*', // 允许所有来源访问
    credentials: false, // 允许所有来源时需要设置为 false
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
)
// 增加请求体大小限制以支持头像上传（base64格式）
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use('/images', express.static('images'))

// 增强的请求日志中间件
app.use((req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const logLevel = res.statusCode >= 400 ? '❌' : '✅'
    console.log(
      `${logLevel} [${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    )
  })

  next()
})

// ============================================
// 认证中间件
// ============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ code: 401, message: '未授权访问，请先登录' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ code: 403, message: '令牌无效或已过期' })
    }
    req.user = user
    next()
  })
}

// ============================================
// 工具函数
// ============================================

// 生成订单号
const generateOrderNumber = () => {
  return (
    'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase()
  )
}

// 统一响应格式
const sendResponse = (res, code, message, data = null) => {
  res.json({ code, message, data })
}

// 统一错误处理
const handleError = (res, error, customMessage = '服务器错误') => {
  console.error('Error:', error)
  res.status(500).json({
    code: 500,
    message: customMessage,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  })
}

// 订单状态流转规则
const ORDER_STATUS_FLOW = {
  pending: ['processing', 'cancelled'], // 待支付 -> 待发货/已取消
  processing: ['shipped', 'cancelled'], // 待发货 -> 已发货/已取消
  shipped: ['in_transit', 'delivered'], // 已发货 -> 运输中/已送达
  in_transit: ['delivered'], // 运输中 -> 已送达
  delivered: [], // 已送达（终态）
  cancelled: [], // 已取消（终态）
}

const STATUS_NAMES = {
  pending: '待支付',
  processing: '待发货',
  shipped: '已发货',
  in_transit: '运输中',
  delivered: '已送达',
  cancelled: '已取消',
}

// 模拟支付
async function simulatePayment(order, paymentMethod) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const success = Math.random() > 0.1
  return {
    success,
    transactionId: success
      ? `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      : null,
    message: success ? '支付成功' : '支付失败，请重试',
  }
}

// 生成物流信息
const generateLogisticsInfo = (orderStatus, trackingNumber) => {
  const baseTraces = [
    {
      time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: '已下单',
      description: '商家已接单，等待商家发货',
    },
  ]

  if (
    ['processing', 'shipped', 'in_transit', 'delivered'].includes(orderStatus)
  ) {
    baseTraces.push({
      time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: '已发货',
      description: '商家已发货，物流公司揽件中',
    })
  }

  if (['shipped', 'in_transit', 'delivered'].includes(orderStatus)) {
    baseTraces.push({
      time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: '运输中',
      description: '快件已到达【深圳转运中心】',
    })
    baseTraces.push({
      time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: '运输中',
      description: '快件已到达【广州转运中心】',
    })
  }

  if (['in_transit', 'delivered'].includes(orderStatus)) {
    baseTraces.push({
      time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      status: '派送中',
      description: '快件正在派送中，快递员：张三，电话：138****8888',
    })
  }

  if (orderStatus === 'delivered') {
    baseTraces.push({
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: '已签收',
      description: '快件已签收，签收人：本人',
    })
  }

  return baseTraces
}

// ============================================
// 1. 用户认证路由
// ============================================

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, confirm_password, phone, verification_code } =
      req.body

    if (!username || !password || !phone || !verification_code) {
      return sendResponse(res, 400, '请填写完整信息')
    }

    if (password !== confirm_password) {
      return sendResponse(res, 400, '两次输入的密码不一致')
    }

    if (verification_code !== '123456') {
      return sendResponse(res, 400, '验证码错误')
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR phone = ?',
      [username, phone]
    )

    if (existingUsers.length > 0) {
      return sendResponse(res, 400, '用户名或手机号已存在')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      'INSERT INTO users (username, password, phone) VALUES (?, ?, ?)',
      [username, hashedPassword, phone]
    )

    const token = jwt.sign({ userId: result.insertId, username }, JWT_SECRET, {
      expiresIn: '7d',
    })

    sendResponse(res, 200, '注册成功', {
      user_id: result.insertId,
      username,
      token,
    })
  } catch (error) {
    handleError(res, error, '注册失败')
  }
})

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return sendResponse(res, 400, '请输入用户名和密码')
    }

    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [
      username,
    ])

    if (users.length === 0) {
      return sendResponse(res, 401, '用户名或密码错误')
    }

    const user = users[0]
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return sendResponse(res, 401, '用户名或密码错误')
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: '7d',
      }
    )

    sendResponse(res, 200, '登录成功', {
      user_id: user.id,
      username: user.username,
      avatar: user.avatar,
      member_since: user.member_since,
      token,
    })
  } catch (error) {
    handleError(res, error, '登录失败')
  }
})

// 发送验证码
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return sendResponse(res, 400, '请输入手机号')
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000)

    await pool.query(
      'INSERT INTO verification_codes (phone, code, expired_at) VALUES (?, ?, ?)',
      [phone, code, expiredAt]
    )

    console.log(`验证码发送到 ${phone}: ${code}`)

    sendResponse(res, 200, '验证码已发送', {
      code: process.env.NODE_ENV === 'development' ? code : undefined,
    })
  } catch (error) {
    handleError(res, error, '发送验证码失败')
  }
})

// 第三方登录
app.post('/api/auth/third-party', async (req, res) => {
  try {
    sendResponse(res, 200, '第三方登录功能开发中')
  } catch (error) {
    handleError(res, error, '第三方登录失败')
  }
})

// ============================================
// 2. 首页路由
// ============================================

// 获取首页数据
app.get('/api/home', async (req, res) => {
  try {
    const userId = req.query.user_id || null

    const [
      banners,
      categories,
      popularPicks,
      customerFavorites,
      newArrivals,
      limitedOffers,
      customerReviews,
    ] = await Promise.all([
      pool
        .query(
          'SELECT * FROM banners WHERE is_active = TRUE ORDER BY sort_order'
        )
        .then(([rows]) => rows)
        .catch(() => []),
      pool
        .query('SELECT * FROM categories ORDER BY sort_order')
        .then(([rows]) => rows)
        .catch(() => []),
      pool
        .query(
          `
        SELECT p.*, 
          CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END as is_favorite
        FROM products p
        LEFT JOIN favorites f ON p.id = f.product_id AND f.user_id = ?
        WHERE p.rating >= 4.5
        ORDER BY p.rating DESC, p.review_count DESC
        LIMIT 4
      `,
          [userId]
        )
        .then(([rows]) => rows)
        .catch(() => []),
      pool
        .query(
          `
        SELECT p.* 
        FROM products p
        INNER JOIN (
          SELECT product_id, COUNT(*) as fav_count
          FROM favorites 
          GROUP BY product_id 
          ORDER BY fav_count DESC 
          LIMIT 4
        ) f ON p.id = f.product_id
        ORDER BY f.fav_count DESC
      `
        )
        .then(([rows]) => rows)
        .catch(() => []),
      pool
        .query(
          'SELECT * FROM products WHERE is_new = TRUE ORDER BY created_at DESC LIMIT 4'
        )
        .then(([rows]) => rows)
        .catch(() => []),
      pool
        .query('SELECT * FROM products WHERE is_discount = TRUE LIMIT 4')
        .then(([rows]) => rows)
        .catch(() => []),
      pool
        .query(
          `
        SELECT r.*, u.username as user_name, u.avatar as user_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
        LIMIT 5
      `
        )
        .then(([rows]) => rows)
        .catch(() => []),
    ])

    sendResponse(res, 200, '获取成功', {
      banner: banners,
      categories,
      popular_picks: popularPicks,
      customer_favorites: customerFavorites,
      new_arrivals: newArrivals,
      limited_offers: limitedOffers,
      customer_reviews: customerReviews,
    })
  } catch (error) {
    handleError(res, error, '获取首页数据失败')
  }
})

// 搜索商品
app.get('/api/search', async (req, res) => {
  try {
    const { keyword, page = 1, page_size = 20 } = req.query
    const offset = (page - 1) * page_size

    if (!keyword) {
      return sendResponse(res, 400, '请输入搜索关键词')
    }

    const searchTerm = `%${keyword}%`

    const [products] = await pool.query(
      `
      SELECT * FROM products
      WHERE name LIKE ? OR name_en LIKE ? OR description LIKE ?
      LIMIT ? OFFSET ?
    `,
      [searchTerm, searchTerm, searchTerm, parseInt(page_size), offset]
    )

    const [[{ total }]] = await pool.query(
      `
      SELECT COUNT(*) as total FROM products
      WHERE name LIKE ? OR name_en LIKE ? OR description LIKE ?
    `,
      [searchTerm, searchTerm, searchTerm]
    )

    sendResponse(res, 200, '搜索成功', {
      total,
      page: parseInt(page),
      page_size: parseInt(page_size),
      products,
    })
  } catch (error) {
    handleError(res, error, '搜索失败')
  }
})

// ============================================
// 3. 商品路由
// ============================================

// 获取商品详情
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.query.user_id || null

    // 从请求头获取当前登录用户ID（用于点赞状态）
    const token = req.headers.authorization?.split(' ')[1]
    let currentUserId = null

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        currentUserId = decoded.userId
      } catch (err) {
        // Token无效或过期，继续作为未登录用户
      }
    }

    const [[product]] = await pool.query(
      `
      SELECT p.*,
        CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END as is_favorite
      FROM products p
      LEFT JOIN favorites f ON p.id = f.product_id AND f.user_id = ?
      WHERE p.id = ?
    `,
      [userId || currentUserId, id]
    )

    if (!product) {
      return sendResponse(res, 404, '商品不存在')
    }

    const [reviews] = await pool.query(
      `
      SELECT r.*, u.username as user_name, u.avatar as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `,
      [id]
    )

    // 如果用户已登录，获取用户对这些评论的点赞/踩状态
    if (currentUserId && reviews.length > 0) {
      const reviewIds = reviews.map(r => r.id)
      const [userLikes] = await pool.query(
        `SELECT review_id, type FROM review_likes 
         WHERE user_id = ? AND review_id IN (?)`,
        [currentUserId, reviewIds]
      )

      // 创建一个映射
      const likesMap = {}
      userLikes.forEach(like => {
        likesMap[like.review_id] = like.type
      })

      // 为每条评论添加用户的操作状态
      reviews.forEach(review => {
        review.userAction = likesMap[review.id] || null
      })
    } else {
      // 未登录用户，所有评论的userAction都为null
      reviews.forEach(review => {
        review.userAction = null
      })
    }

    const [relatedProducts] = await pool.query(
      `
      SELECT * FROM products
      WHERE category_id = ? AND id != ?
      LIMIT 3
    `,
      [product.category_id, id]
    )

    sendResponse(res, 200, '获取成功', {
      product,
      reviews,
      related_products: relatedProducts,
    })
  } catch (error) {
    handleError(res, error, '获取商品详情失败')
  }
})

// 根据分类获取商品
app.get('/api/categories/:id/products', async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, page_size = 20, sort = 'default' } = req.query
    const offset = (page - 1) * page_size

    let orderBy = 'p.created_at DESC'

    switch (sort) {
      case 'price_asc':
        orderBy = 'p.price ASC'
        break
      case 'price_desc':
        orderBy = 'p.price DESC'
        break
      case 'rating':
        orderBy = 'p.rating DESC'
        break
      case 'sales':
        orderBy = 'p.sales_count DESC'
        break
    }

    const [products] = await pool.query(
      `
      SELECT * FROM products p
      WHERE p.category_id = ?
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `,
      [id, parseInt(page_size), offset]
    )

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM products WHERE category_id = ?',
      [id]
    )

    sendResponse(res, 200, '获取成功', {
      total,
      page: parseInt(page),
      page_size: parseInt(page_size),
      products,
    })
  } catch (error) {
    handleError(res, error, '获取分类商品失败')
  }
})

// ============================================
// 4. 购物车路由
// ============================================

// 获取购物车
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const [cartItems] = await pool.query(
      `
      SELECT c.*, p.name, p.name_en, p.price, p.image_url, p.stock,
        (c.quantity * p.price) as subtotal
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `,
      [req.user.userId]
    )

    const subtotal = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.subtotal),
      0
    )
    const shipping = subtotal > 0 ? 5.0 : 0
    const total = subtotal + shipping

    sendResponse(res, 200, '获取成功', {
      items: cartItems,
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
    })
  } catch (error) {
    handleError(res, error, '获取购物车失败')
  }
})

// 添加到购物车
app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body

    if (!product_id) {
      return sendResponse(res, 400, '商品ID不能为空')
    }

    const [[product]] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [product_id]
    )
    if (!product) {
      return sendResponse(res, 404, '商品不存在')
    }

    if (product.stock < quantity) {
      return sendResponse(res, 400, '库存不足')
    }

    const [[existingItem]] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.userId, product_id]
    )

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      if (product.stock < newQuantity) {
        return sendResponse(res, 400, '库存不足')
      }

      await pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [
        newQuantity,
        existingItem.id,
      ])
    } else {
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.userId, product_id, quantity]
      )
    }

    sendResponse(res, 200, '添加成功')
  } catch (error) {
    handleError(res, error, '添加到购物车失败')
  }
})

// 更新购物车商品数量
app.put('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return sendResponse(res, 400, '数量必须大于0')
    }

    const [[cartItem]] = await pool.query(
      'SELECT c.*, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = ? AND c.user_id = ?',
      [id, req.user.userId]
    )

    if (!cartItem) {
      return sendResponse(res, 404, '购物车项不存在')
    }

    if (cartItem.stock < quantity) {
      return sendResponse(res, 400, '库存不足')
    }

    await pool.query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, req.user.userId]
    )

    sendResponse(res, 200, '更新成功')
  } catch (error) {
    handleError(res, error, '更新购物车失败')
  }
})

// 删除购物车商品
app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const [result] = await pool.query(
      'DELETE FROM cart WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    )

    if (result.affectedRows === 0) {
      return sendResponse(res, 404, '购物车项不存在')
    }

    sendResponse(res, 200, '删除成功')
  } catch (error) {
    handleError(res, error, '删除购物车商品失败')
  }
})

// 清空购物车
app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM cart WHERE user_id = ?', [
      req.user.userId,
    ])

    sendResponse(res, 200, '购物车已清空', {
      deletedCount: result.affectedRows,
    })
  } catch (error) {
    handleError(res, error, '清空购物车失败')
  }
})

// 批量删除购物车商品
app.post('/api/cart/batch-delete', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendResponse(res, 400, '请提供要删除的商品ID列表')
    }

    const placeholders = ids.map(() => '?').join(',')
    const [result] = await pool.query(
      `DELETE FROM cart WHERE id IN (${placeholders}) AND user_id = ?`,
      [...ids, req.user.userId]
    )

    sendResponse(res, 200, '批量删除成功', {
      deletedCount: result.affectedRows,
    })
  } catch (error) {
    handleError(res, error, '批量删除购物车商品失败')
  }
})

// 购物车商品选中/取消选中
app.put('/api/cart/:id/select', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { selected } = req.body

    if (typeof selected !== 'boolean') {
      return sendResponse(res, 400, '选中状态必须是布尔值')
    }

    const [[cartItem]] = await pool.query(
      'SELECT * FROM cart WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    )

    if (!cartItem) {
      return sendResponse(res, 404, '购物车项不存在')
    }

    await pool.query(
      'UPDATE cart SET selected = ? WHERE id = ? AND user_id = ?',
      [selected, id, req.user.userId]
    )

    sendResponse(res, 200, '选中状态更新成功')
  } catch (error) {
    handleError(res, error, '更新选中状态失败')
  }
})

// 全选/取消全选
app.put('/api/cart/select-all', authenticateToken, async (req, res) => {
  try {
    const { selected } = req.body

    if (typeof selected !== 'boolean') {
      return sendResponse(res, 400, '选中状态必须是布尔值')
    }

    const [result] = await pool.query(
      'UPDATE cart SET selected = ? WHERE user_id = ?',
      [selected, req.user.userId]
    )

    sendResponse(res, 200, '全选状态更新成功', {
      updatedCount: result.affectedRows,
    })
  } catch (error) {
    handleError(res, error, '更新全选状态失败')
  }
})

// 获取购物车数量
app.get('/api/cart/count', authenticateToken, async (req, res) => {
  try {
    const [[result]] = await pool.query(
      'SELECT SUM(quantity) as count FROM cart WHERE user_id = ?',
      [req.user.userId]
    )

    const count = result.count || 0

    sendResponse(res, 200, '获取成功', { count })
  } catch (error) {
    handleError(res, error, '获取购物车数量失败')
  }
})

// ============================================
// 5. 订单路由（优化版）
// ============================================

// 创建订单
app.post('/api/orders', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const {
      items,
      shipping_address,
      delivery_method,
      payment_method,
      remark,
      shipping_fee,
      total_amount,
    } = req.body

    if (!items || items.length === 0) {
      return sendResponse(res, 400, '订单商品不能为空')
    }

    if (!shipping_address) {
      return sendResponse(res, 400, '收货地址不能为空')
    }

    const orderNumber = generateOrderNumber()

    let calculatedSubtotal = 0
    const orderItems = []

    for (const item of items) {
      const [[product]] = await connection.query(
        'SELECT * FROM products WHERE id = ?',
        [item.product_id]
      )

      if (!product) {
        throw new Error(`商品ID ${item.product_id} 不存在`)
      }

      if (product.stock < item.quantity) {
        throw new Error(`商品 ${product.name} 库存不足`)
      }

      const subtotal = product.price * item.quantity
      calculatedSubtotal += subtotal

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      })

      await connection.query(
        'UPDATE products SET stock = stock - ?, sales_count = sales_count + ? WHERE id = ?',
        [item.quantity, item.quantity, product.id]
      )
    }

    // 使用前端传递的运费和总金额，如果没有则使用计算值
    const shippingFee =
      shipping_fee !== undefined
        ? parseFloat(shipping_fee)
        : delivery_method === 'express'
          ? 10.0
          : 5.0
    const finalTotal =
      total_amount !== undefined
        ? parseFloat(total_amount)
        : calculatedSubtotal + shippingFee

    const [orderResult] = await connection.query(
      `
      INSERT INTO orders (order_number, user_id, total_amount, shipping_fee, 
        status, payment_method, delivery_method, shipping_address, remark)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `,
      [
        orderNumber,
        req.user.userId,
        finalTotal,
        shippingFee,
        payment_method,
        delivery_method,
        shipping_address,
        remark,
      ]
    )

    const orderId = orderResult.insertId

    for (const item of orderItems) {
      await connection.query(
        `
        INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          orderId,
          item.product_id,
          item.product_name,
          item.product_image,
          item.quantity,
          item.price,
          item.subtotal,
        ]
      )
    }

    await connection.query(
      `
      INSERT INTO order_status_history (order_id, status, status_name)
      VALUES (?, 'pending', '订单已创建')
    `,
      [orderId]
    )

    await connection.query('DELETE FROM cart WHERE user_id = ?', [
      req.user.userId,
    ])

    await connection.commit()

    sendResponse(res, 200, '订单创建成功', {
      order_id: orderId,
      order_number: orderNumber,
    })
  } catch (error) {
    await connection.rollback()
    handleError(res, error, error.message || '创建订单失败')
  } finally {
    connection.release()
  }
})

// 获取订单列表（优化版 - 带分页和total）
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, page_size = 10 } = req.query
    const offset = (page - 1) * page_size

    let whereClause = 'WHERE user_id = ?'
    const params = [req.user.userId]

    if (status && status !== 'all') {
      whereClause += ' AND status = ?'
      params.push(status)
    }

    // 获取总数
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM orders ${whereClause}`,
      params
    )

    // 获取订单列表
    const query = `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    const queryParams = [...params, parseInt(page_size), offset]
    const [orders] = await pool.query(query, queryParams)

    // 为每个订单获取商品信息
    const ordersWithItems = await Promise.all(
      orders.map(async order => {
        const [orderItems] = await pool.query(
          `
          SELECT 
            oi.id,
            oi.order_id,
            oi.product_id,
            oi.quantity,
            oi.price,
            COALESCE(p.name, oi.product_name) as product_name,
            COALESCE(p.image_url, oi.product_image) as product_image
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `,
          [order.id]
        )

        return {
          ...order,
          items: orderItems,
        }
      })
    )

    // 统计各状态订单数量（修复：单独统计每个状态）
    const [[counts]] = await pool.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as to_pay,
        COALESCE(SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END), 0) as to_ship,
        COALESCE(SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END), 0) as shipped,
        COALESCE(SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END), 0) as in_transit,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0) as to_review,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled
      FROM orders WHERE user_id = ?
    `,
      [req.user.userId]
    )

    const countsWithNumbers = {
      to_pay: parseInt(counts.to_pay) || 0,
      to_ship: parseInt(counts.to_ship) || 0,
      shipped: parseInt(counts.shipped) || 0,
      in_transit: parseInt(counts.in_transit) || 0,
      to_review: parseInt(counts.to_review) || 0,
      cancelled: parseInt(counts.cancelled) || 0,
    }

    sendResponse(res, 200, '获取成功', {
      orders: ordersWithItems,
      total: parseInt(total),
      page: parseInt(page),
      page_size: parseInt(page_size),
      counts: countsWithNumbers,
    })
  } catch (error) {
    console.error('❌ 获取订单列表失败:', error)
    handleError(res, error, '获取订单列表失败')
  }
})

// ============================================
// 订单搜索（支持模糊搜索和拼音搜索）
// 注意：必须放在 /api/orders/:id 之前，否则 search 会被当作 id
// ============================================

app.get('/api/orders/search', authenticateToken, async (req, res) => {
  try {
    const { keyword, page = 1, page_size = 10 } = req.query
    const offset = (page - 1) * page_size
    const userId = req.user.userId

    console.log('🔍 收到搜索请求:', { keyword, page, page_size, userId })

    if (!keyword || !keyword.trim()) {
      return sendResponse(res, 400, '请输入搜索关键词')
    }

    const searchTerm = `%${keyword.trim()}%`

    // 模糊搜索：订单号、商品名称、收货人姓名、手机号
    const query = `
      SELECT DISTINCT o.* 
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
        AND (
          o.order_number LIKE ?
          OR oi.product_name LIKE ?
          OR o.shipping_address LIKE ?
        )
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `

    const [orders] = await pool.query(query, [
      userId,
      searchTerm,
      searchTerm,
      searchTerm,
      parseInt(page_size),
      offset,
    ])

    console.log('🔍 数据库搜索结果数量:', orders.length)

    // 获取订单商品信息
    const ordersWithItems = await Promise.all(
      orders.map(async order => {
        const [orderItems] = await pool.query(
          `
          SELECT 
            oi.id,
            oi.order_id,
            oi.product_id,
            oi.quantity,
            oi.price,
            COALESCE(p.name, oi.product_name) as product_name,
            COALESCE(p.image_url, oi.product_image) as product_image
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `,
          [order.id]
        )

        return {
          ...order,
          items: orderItems,
        }
      })
    )

    // 🆕 拼音搜索增强：如果数据库搜索结果较少，尝试拼音匹配
    const finalOrders = [...ordersWithItems]
    if (ordersWithItems.length < 5 && /^[a-zA-Z]+$/.test(keyword.trim())) {
      // 如果关键词是纯字母，可能是拼音搜索
      const allOrdersQuery = `
        SELECT DISTINCT o.* 
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
        LIMIT 100
      `
      const [allOrders] = await pool.query(allOrdersQuery, [userId])

      const pinyinMatched = []
      for (const order of allOrders) {
        const [items] = await pool.query(
          'SELECT product_name FROM order_items WHERE order_id = ?',
          [order.id]
        )

        // 检查商品名称是否匹配拼音
        const hasMatch = items.some(item =>
          pinyinMatch.match(item.product_name, keyword.trim())
        )

        if (hasMatch) {
          const [orderItems] = await pool.query(
            `
            SELECT 
              oi.id,
              oi.order_id,
              oi.product_id,
              oi.quantity,
              oi.price,
              COALESCE(p.name, oi.product_name) as product_name,
              COALESCE(p.image_url, oi.product_image) as product_image
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
          `,
            [order.id]
          )
          pinyinMatched.push({
            ...order,
            items: orderItems,
          })
        }
      }

      // 合并结果并去重
      const existingIds = new Set(ordersWithItems.map(o => o.id))
      pinyinMatched.forEach(order => {
        if (!existingIds.has(order.id)) {
          finalOrders.push(order)
        }
      })
    }

    const responseData = {
      orders: finalOrders.slice(0, parseInt(page_size)),
      total: finalOrders.length,
      page: parseInt(page),
      page_size: parseInt(page_size),
      keyword,
    }

    console.log('🔍 返回搜索结果:', {
      订单数量: responseData.orders.length,
      总数: responseData.total,
    })

    sendResponse(res, 200, '搜索成功', responseData)
  } catch (error) {
    console.error('❌ 搜索订单失败:', error)
    handleError(res, error, '搜索订单失败')
  }
})

// 获取订单详情
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const [[order]] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    )

    if (!order) {
      return sendResponse(res, 404, '订单不存在')
    }

    const [items] = await pool.query(
      `
      SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        COALESCE(p.name, oi.product_name) as product_name,
        COALESCE(p.image_url, oi.product_image) as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `,
      [id]
    )

    const [statusHistory] = await pool.query(
      'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at',
      [id]
    )

    sendResponse(res, 200, '获取成功', {
      order,
      items,
      status_history: statusHistory,
    })
  } catch (error) {
    handleError(res, error, '获取订单详情失败')
  }
})

// 更新订单状态（优化版 - 带流转验证）
app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { id } = req.params
    const { status } = req.body
    const userId = req.user.userId

    const validStatuses = Object.keys(ORDER_STATUS_FLOW)
    if (!validStatuses.includes(status)) {
      return sendResponse(res, 400, '无效的订单状态')
    }

    const [[order]] = await connection.query(
      'SELECT id, status, order_number FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    )

    if (!order) {
      return sendResponse(res, 404, '订单不存在')
    }

    const currentStatus = order.status

    if (currentStatus === status) {
      await connection.commit()
      return sendResponse(res, 200, '订单状态未变化', { order })
    }

    const allowedNextStatuses = ORDER_STATUS_FLOW[currentStatus] || []
    if (!allowedNextStatuses.includes(status)) {
      await connection.rollback()
      return sendResponse(
        res,
        400,
        `订单状态不能从"${STATUS_NAMES[currentStatus]}"变更为"${STATUS_NAMES[status]}"`
      )
    }

    console.log(
      `🔄 更新订单状态: ${id} (${order.order_number}) ${currentStatus} -> ${status}`
    )

    await connection.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [status, id, userId]
    )

    await connection.query(
      `
      INSERT INTO order_status_history (order_id, status, status_name)
      VALUES (?, ?, ?)
    `,
      [id, status, STATUS_NAMES[status]]
    )

    if (
      status === 'cancelled' &&
      ['pending', 'processing'].includes(currentStatus)
    ) {
      const [orderItems] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      )

      for (const item of orderItems) {
        await connection.query(
          'UPDATE products SET stock = stock + ?, sales_count = GREATEST(0, sales_count - ?) WHERE id = ?',
          [item.quantity, item.quantity, item.product_id]
        )
      }
      console.log(`📦 已恢复订单 ${id} 的商品库存`)
    }

    await connection.commit()

    const [[updatedOrder]] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    )

    console.log(`✅ 订单状态更新成功: ${id} -> ${status}`)

    sendResponse(res, 200, '订单状态更新成功', updatedOrder)
  } catch (error) {
    await connection.rollback()
    console.error('❌ 更新订单状态失败:', error)
    handleError(res, error, '更新订单状态失败')
  } finally {
    connection.release()
  }
})

// 支付订单
app.post('/api/orders/:id/pay', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { payment_method } = req.body
    const userId = req.user.userId

    const [[order]] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    )

    if (!order) {
      return sendResponse(res, 404, '订单不存在')
    }

    if (order.status !== 'pending') {
      return sendResponse(res, 400, '订单状态不允许支付')
    }

    const paymentResult = await simulatePayment(order, payment_method)

    if (paymentResult.success) {
      await pool.query(
        'UPDATE orders SET status = ?, payment_method = ?, updated_at = NOW() WHERE id = ?',
        ['processing', payment_method, id]
      )

      await pool.query(
        `
        INSERT INTO order_status_history (order_id, status, status_name)
        VALUES (?, 'processing', '支付成功')
      `,
        [id]
      )

      sendResponse(res, 200, '支付成功', {
        order_id: id,
        payment_method,
        transaction_id: paymentResult.transactionId,
      })
    } else {
      sendResponse(res, 400, '支付失败', paymentResult)
    }
  } catch (error) {
    handleError(res, error, '支付处理失败')
  }
})

// 取消订单
app.put('/api/orders/:id/cancel', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { id } = req.params

    const [[order]] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    )

    if (!order) {
      return sendResponse(res, 404, '订单不存在')
    }

    if (order.status !== 'pending') {
      return sendResponse(res, 400, '只能取消待支付的订单')
    }

    await connection.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      ['cancelled', id]
    )

    const [orderItems] = await connection.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [id]
    )

    for (const item of orderItems) {
      await connection.query(
        'UPDATE products SET stock = stock + ?, sales_count = sales_count - ? WHERE id = ?',
        [item.quantity, item.quantity, item.product_id]
      )
    }

    await connection.query(
      `
      INSERT INTO order_status_history (order_id, status, status_name)
      VALUES (?, 'cancelled', '订单已取消')
    `,
      [id]
    )

    await connection.commit()

    sendResponse(res, 200, '订单已取消')
  } catch (error) {
    await connection.rollback()
    handleError(res, error, '取消订单失败')
  } finally {
    connection.release()
  }
})

// 确认收货
app.put('/api/orders/:id/confirm', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const [[order]] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    )

    if (!order) {
      return sendResponse(res, 404, '订单不存在')
    }

    if (!['shipped', 'in_transit'].includes(order.status)) {
      return sendResponse(res, 400, '当前订单状态不允许确认收货')
    }

    await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      ['delivered', id, userId]
    )

    await pool.query(
      `
      INSERT INTO order_status_history (order_id, status, status_name)
      VALUES (?, 'delivered', '用户确认收货')
    `,
      [id]
    )

    sendResponse(res, 200, '确认收货成功')
  } catch (error) {
    handleError(res, error, '确认收货失败')
  }
})

// 删除订单
app.delete('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const [[order]] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    )

    if (!order) {
      return sendResponse(res, 404, '订单不存在')
    }

    if (order.status !== 'cancelled') {
      return sendResponse(res, 400, '只能删除已取消的订单')
    }

    await pool.query('DELETE FROM orders WHERE id = ? AND user_id = ?', [
      id,
      userId,
    ])

    await pool.query('DELETE FROM order_items WHERE order_id = ?', [id])
    await pool.query('DELETE FROM order_status_history WHERE order_id = ?', [
      id,
    ])

    sendResponse(res, 200, '订单删除成功')
  } catch (error) {
    handleError(res, error, '删除订单失败')
  }
})

// 再次购买
app.post('/api/orders/:id/buy-again', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const [[order]] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    )

    if (!order) {
      return sendResponse(res, 404, '订单不存在')
    }

    const [items] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    )

    const availableItems = []
    for (const item of items) {
      const [[product]] = await pool.query(
        'SELECT * FROM products WHERE id = ?',
        [item.product_id]
      )

      if (product && product.stock > 0) {
        availableItems.push({
          product_id: item.product_id,
          quantity: Math.min(item.quantity, product.stock),
        })
      }
    }

    if (availableItems.length === 0) {
      return sendResponse(res, 400, '订单中的商品已下架或库存不足')
    }

    sendResponse(res, 200, '商品已添加到购物车', {
      items: availableItems,
    })
  } catch (error) {
    handleError(res, error, '再次购买失败')
  }
})

// 立即购买
app.post('/api/buy-now', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const {
      product_id,
      quantity,
      shipping_address,
      delivery_method,
      payment_method,
      remark,
    } = req.body

    if (!product_id || !quantity) {
      return sendResponse(res, 400, '商品信息不完整')
    }

    if (!shipping_address) {
      return sendResponse(res, 400, '收货地址不能为空')
    }

    const [[product]] = await connection.query(
      'SELECT * FROM products WHERE id = ?',
      [product_id]
    )

    if (!product) {
      throw new Error('商品不存在')
    }

    if (product.stock < quantity) {
      throw new Error('库存不足')
    }

    const orderNumber = generateOrderNumber()

    const subtotal = product.price * quantity
    const shippingFee = delivery_method === 'express' ? 10.0 : 5.0
    const totalAmount = subtotal + shippingFee

    const [orderResult] = await connection.query(
      `
      INSERT INTO orders (order_number, user_id, total_amount, shipping_fee, 
        status, payment_method, delivery_method, shipping_address, remark)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `,
      [
        orderNumber,
        req.user.userId,
        totalAmount,
        shippingFee,
        payment_method,
        delivery_method,
        shipping_address,
        remark,
      ]
    )

    const orderId = orderResult.insertId

    await connection.query(
      `
      INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        orderId,
        product.id,
        product.name,
        product.image_url,
        quantity,
        product.price,
        subtotal,
      ]
    )

    await connection.query(
      `
      INSERT INTO order_status_history (order_id, status, status_name)
      VALUES (?, 'pending', '订单已创建')
    `,
      [orderId]
    )

    await connection.query(
      'UPDATE products SET stock = stock - ?, sales_count = sales_count + ? WHERE id = ?',
      [quantity, quantity, product.id]
    )

    await connection.commit()

    sendResponse(res, 200, '下单成功', {
      order_id: orderId,
      order_number: orderNumber,
    })
  } catch (error) {
    await connection.rollback()
    handleError(res, error, error.message || '下单失败')
  } finally {
    connection.release()
  }
})

// 获取订单统计
app.get('/api/orders/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    const [[counts]] = await pool.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as to_pay,
        COALESCE(SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END), 0) as to_ship,
        COALESCE(SUM(CASE WHEN status IN ('shipped', 'in_transit') THEN 1 ELSE 0 END), 0) as to_receive,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0) as to_review,
        COALESCE(SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END), 0) as in_transit,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled
      FROM orders WHERE user_id = ?
    `,
      [userId]
    )

    const countsWithNumbers = {
      to_pay: parseInt(counts.to_pay) || 0,
      to_ship: parseInt(counts.to_ship) || 0,
      to_receive: parseInt(counts.to_receive) || 0,
      to_review: parseInt(counts.to_review) || 0,
      in_transit: parseInt(counts.in_transit) || 0,
      cancelled: parseInt(counts.cancelled) || 0,
    }

    sendResponse(res, 200, '获取成功', countsWithNumbers)
  } catch (error) {
    handleError(res, error, '获取订单统计失败')
  }
})

// ============================================
// 6. 新增：物流信息查询
// ============================================

app.get('/api/logistics/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params
    const userId = req.user.userId

    const [[order]] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    )

    if (!order) {
      return sendResponse(res, 404, '订单不存在')
    }

    if (!['shipped', 'in_transit', 'delivered'].includes(order.status)) {
      return sendResponse(res, 200, '订单暂无物流信息', {
        order_id: orderId,
        order_number: order.order_number,
        status: order.status,
        traces: [],
      })
    }

    const trackingNumber =
      order.tracking_number || `SF${Date.now().toString().slice(-10)}`

    const traces = generateLogisticsInfo(order.status, trackingNumber)

    sendResponse(res, 200, '获取成功', {
      order_id: orderId,
      order_number: order.order_number,
      tracking_number: trackingNumber,
      carrier: '顺丰速运',
      status: order.status,
      traces: traces.reverse(),
    })
  } catch (error) {
    console.error('❌ 获取物流信息失败:', error)
    handleError(res, error, '获取物流信息失败')
  }
})

// ============================================
// 8. 新增：批量更新订单状态
// ============================================

app.post(
  '/api/orders/batch-update-status',
  authenticateToken,
  async (req, res) => {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const { order_ids, status } = req.body
      const userId = req.user.userId

      if (!order_ids || !Array.isArray(order_ids) || order_ids.length === 0) {
        return sendResponse(res, 400, '请提供要更新的订单ID列表')
      }

      const validStatuses = Object.keys(ORDER_STATUS_FLOW)
      if (!validStatuses.includes(status)) {
        return sendResponse(res, 400, '无效的订单状态')
      }

      const results = []
      const errors = []

      for (const orderId of order_ids) {
        try {
          const [[order]] = await connection.query(
            'SELECT id, status, order_number FROM orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
          )

          if (!order) {
            errors.push({ order_id: orderId, error: '订单不存在' })
            continue
          }

          const allowedNextStatuses = ORDER_STATUS_FLOW[order.status] || []
          if (!allowedNextStatuses.includes(status)) {
            errors.push({
              order_id: orderId,
              error: `订单状态不能从"${STATUS_NAMES[order.status]}"变更为"${STATUS_NAMES[status]}"`,
            })
            continue
          }

          await connection.query(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, orderId]
          )

          await connection.query(
            'INSERT INTO order_status_history (order_id, status, status_name) VALUES (?, ?, ?)',
            [orderId, status, STATUS_NAMES[status]]
          )

          results.push({ order_id: orderId, success: true })
        } catch (error) {
          errors.push({ order_id: orderId, error: error.message })
        }
      }

      await connection.commit()

      sendResponse(res, 200, '批量更新完成', {
        success_count: results.length,
        error_count: errors.length,
        results,
        errors,
      })
    } catch (error) {
      await connection.rollback()
      console.error('❌ 批量更新订单状态失败:', error)
      handleError(res, error, '批量更新订单状态失败')
    } finally {
      connection.release()
    }
  }
)

// ============================================
// 9. 新增:订单数据统计
// ============================================

app.get('/api/orders/statistics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { period = 'month' } = req.query

    let dateFilter = ''
    switch (period) {
      case 'day':
        dateFilter = 'DATE(created_at) = CURDATE()'
        break
      case 'week':
        dateFilter = 'YEARWEEK(created_at) = YEARWEEK(NOW())'
        break
      case 'month':
        dateFilter =
          'YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())'
        break
      case 'year':
        dateFilter = 'YEAR(created_at) = YEAR(NOW())'
        break
      default:
        dateFilter = '1=1'
    }

    const [[summary]] = await pool.query(
      `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as total_amount,
        COALESCE(AVG(CASE WHEN status != 'cancelled' THEN total_amount ELSE NULL END), 0) as avg_amount
      FROM orders 
      WHERE user_id = ? AND ${dateFilter}
    `,
      [userId]
    )

    const [[statusCounts]] = await pool.query(
      `
      SELECT 
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as in_transit,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM orders 
      WHERE user_id = ? AND ${dateFilter}
    `,
      [userId]
    )

    sendResponse(res, 200, '获取成功', {
      period,
      summary: {
        total_orders: parseInt(summary.total_orders),
        total_amount: parseFloat(summary.total_amount).toFixed(2),
        avg_amount: parseFloat(summary.avg_amount).toFixed(2),
      },
      status_counts: statusCounts,
    })
  } catch (error) {
    console.error('❌ 获取订单统计失败:', error)
    handleError(res, error, '获取订单统计失败')
  }
})

// ============================================
// 10. 收货地址路由
// ============================================

// 获取地址列表
app.get('/api/addresses', authenticateToken, async (req, res) => {
  try {
    const [addresses] = await pool.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.userId]
    )

    sendResponse(res, 200, '获取成功', addresses)
  } catch (error) {
    handleError(res, error, '获取地址列表失败')
  }
})

// 添加地址
app.post('/api/addresses', authenticateToken, async (req, res) => {
  try {
    const {
      recipient_name,
      phone,
      region,
      detailed_address,
      label,
      is_default,
    } = req.body

    if (!recipient_name || !phone || !detailed_address) {
      return sendResponse(res, 400, '请填写完整的地址信息')
    }

    if (is_default) {
      await pool.query(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
        [req.user.userId]
      )
    }

    const [result] = await pool.query(
      `
      INSERT INTO addresses (user_id, recipient_name, phone, region, detailed_address, label, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        req.user.userId,
        recipient_name,
        phone,
        region,
        detailed_address,
        label,
        is_default || false,
      ]
    )

    sendResponse(res, 200, '添加成功', {
      address_id: result.insertId,
    })
  } catch (error) {
    handleError(res, error, '添加地址失败')
  }
})

// 更新地址
app.put('/api/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const {
      recipient_name,
      phone,
      region,
      detailed_address,
      label,
      is_default,
    } = req.body

    const [[address]] = await pool.query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    )

    if (!address) {
      return sendResponse(res, 404, '地址不存在')
    }

    if (is_default) {
      await pool.query(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?',
        [req.user.userId, id]
      )
    }

    await pool.query(
      `
      UPDATE addresses 
      SET recipient_name = ?, phone = ?, region = ?, detailed_address = ?, label = ?, is_default = ?
      WHERE id = ? AND user_id = ?
    `,
      [
        recipient_name,
        phone,
        region,
        detailed_address,
        label,
        is_default || false,
        id,
        req.user.userId,
      ]
    )

    sendResponse(res, 200, '更新成功')
  } catch (error) {
    handleError(res, error, '更新地址失败')
  }
})

// 删除地址
app.delete('/api/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const [result] = await pool.query(
      'DELETE FROM addresses WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    )

    if (result.affectedRows === 0) {
      return sendResponse(res, 404, '地址不存在')
    }

    sendResponse(res, 200, '删除成功')
  } catch (error) {
    handleError(res, error, '删除地址失败')
  }
})

// ============================================
// 11. 收藏路由
// ============================================

// 添加/取消收藏
app.post('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const { product_id } = req.body

    if (!product_id) {
      return sendResponse(res, 400, '商品ID不能为空')
    }

    const [[product]] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [product_id]
    )
    if (!product) {
      return sendResponse(res, 404, '商品不存在')
    }

    const [[existing]] = await pool.query(
      'SELECT * FROM favorites WHERE user_id = ? AND product_id = ?',
      [req.user.userId, product_id]
    )

    if (existing) {
      await pool.query(
        'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
        [req.user.userId, product_id]
      )
      return sendResponse(res, 200, '已取消收藏', { is_favorite: false })
    } else {
      await pool.query(
        'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
        [req.user.userId, product_id]
      )
      return sendResponse(res, 200, '收藏成功', { is_favorite: true })
    }
  } catch (error) {
    handleError(res, error, '操作失败')
  }
})

// 获取收藏列表
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const { page = 1, page_size = 20 } = req.query
    const offset = (page - 1) * page_size

    const [favorites] = await pool.query(
      `
      SELECT p.*, f.created_at as favorite_date, TRUE as is_favorite
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [req.user.userId, parseInt(page_size), offset]
    )

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM favorites WHERE user_id = ?',
      [req.user.userId]
    )

    sendResponse(res, 200, '获取成功', {
      total,
      page: parseInt(page),
      page_size: parseInt(page_size),
      products: favorites,
    })
  } catch (error) {
    handleError(res, error, '获取收藏列表失败')
  }
})

// ============================================
// 12. 评价路由
// ============================================

// 添加商品评价
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { product_id, order_id, rating, comment, images } = req.body

    if (!product_id || !rating) {
      return sendResponse(res, 400, '商品ID和评分不能为空')
    }

    if (rating < 1 || rating > 5) {
      return sendResponse(res, 400, '评分必须在1-5之间')
    }

    if (order_id) {
      const [[orderItem]] = await pool.query(
        `
        SELECT oi.* FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = ? AND oi.product_id = ? AND o.id = ?
      `,
        [req.user.userId, product_id, order_id]
      )

      if (!orderItem) {
        return sendResponse(res, 400, '您未在此订单中购买过此商品')
      }

      const [[existingReview]] = await pool.query(
        'SELECT * FROM reviews WHERE user_id = ? AND product_id = ? AND order_id = ?',
        [req.user.userId, product_id, order_id]
      )

      if (existingReview) {
        return sendResponse(res, 400, '您已评价过此商品')
      }
    }

    const [result] = await pool.query(
      `
      INSERT INTO reviews (user_id, product_id, order_id, rating, comment, images)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        req.user.userId,
        product_id,
        order_id || null,
        rating,
        comment || null,
        images ? JSON.stringify(images) : null,
      ]
    )

    await pool.query(
      `
      UPDATE products p
      SET rating = (SELECT AVG(rating) FROM reviews WHERE product_id = p.id),
          review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = p.id)
      WHERE id = ?
    `,
      [product_id]
    )

    sendResponse(res, 200, '评价成功', {
      review_id: result.insertId,
    })
  } catch (error) {
    handleError(res, error, '评价失败')
  }
})

// 评价点赞/取消点赞
app.post('/api/reviews/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // 检查评价是否存在
    const [[review]] = await pool.query('SELECT * FROM reviews WHERE id = ?', [
      id,
    ])

    if (!review) {
      return sendResponse(res, 404, '评价不存在')
    }

    // 检查用户是否已经对该评价有操作
    const [[existingLike]] = await pool.query(
      'SELECT * FROM review_likes WHERE review_id = ? AND user_id = ?',
      [id, userId]
    )

    let action = ''
    let likesChange = 0
    let dislikesChange = 0

    if (existingLike) {
      if (existingLike.type === 1) {
        // 已经点赞，取消点赞
        await pool.query(
          'DELETE FROM review_likes WHERE review_id = ? AND user_id = ?',
          [id, userId]
        )
        likesChange = -1
        action = 'cancel_like'
      } else {
        // 已经踩，改为点赞
        await pool.query(
          'UPDATE review_likes SET type = 1 WHERE review_id = ? AND user_id = ?',
          [id, userId]
        )
        likesChange = 1
        dislikesChange = -1
        action = 'like'
      }
    } else {
      // 新增点赞
      await pool.query(
        'INSERT INTO review_likes (review_id, user_id, type) VALUES (?, ?, 1)',
        [id, userId]
      )
      likesChange = 1
      action = 'like'
    }

    // 更新评价表的统计数据
    await pool.query(
      'UPDATE reviews SET likes = likes + ?, dislikes = dislikes + ? WHERE id = ?',
      [likesChange, dislikesChange, id]
    )

    // 获取更新后的数据
    const [[updatedReview]] = await pool.query(
      'SELECT likes, dislikes FROM reviews WHERE id = ?',
      [id]
    )

    const message =
      action === 'cancel_like'
        ? '已取消点赞'
        : action === 'like'
          ? '点赞成功'
          : '操作成功'

    sendResponse(res, 200, message, {
      likes: updatedReview.likes,
      dislikes: updatedReview.dislikes,
      userAction: action === 'cancel_like' ? null : 1, // 1=点赞, -1=踩, null=无操作
    })
  } catch (error) {
    handleError(res, error, '点赞失败')
  }
})

// 评价踩/取消踩
app.post('/api/reviews/:id/dislike', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // 检查评价是否存在
    const [[review]] = await pool.query('SELECT * FROM reviews WHERE id = ?', [
      id,
    ])

    if (!review) {
      return sendResponse(res, 404, '评价不存在')
    }

    // 检查用户是否已经对该评价有操作
    const [[existingLike]] = await pool.query(
      'SELECT * FROM review_likes WHERE review_id = ? AND user_id = ?',
      [id, userId]
    )

    let action = ''
    let likesChange = 0
    let dislikesChange = 0

    if (existingLike) {
      if (existingLike.type === -1) {
        // 已经踩，取消踩
        await pool.query(
          'DELETE FROM review_likes WHERE review_id = ? AND user_id = ?',
          [id, userId]
        )
        dislikesChange = -1
        action = 'cancel_dislike'
      } else {
        // 已经点赞，改为踩
        await pool.query(
          'UPDATE review_likes SET type = -1 WHERE review_id = ? AND user_id = ?',
          [id, userId]
        )
        likesChange = -1
        dislikesChange = 1
        action = 'dislike'
      }
    } else {
      // 新增踩
      await pool.query(
        'INSERT INTO review_likes (review_id, user_id, type) VALUES (?, ?, -1)',
        [id, userId]
      )
      dislikesChange = 1
      action = 'dislike'
    }

    // 更新评价表的统计数据
    await pool.query(
      'UPDATE reviews SET likes = likes + ?, dislikes = dislikes + ? WHERE id = ?',
      [likesChange, dislikesChange, id]
    )

    // 获取更新后的数据
    const [[updatedReview]] = await pool.query(
      'SELECT likes, dislikes FROM reviews WHERE id = ?',
      [id]
    )

    const message =
      action === 'cancel_dislike'
        ? '已取消'
        : action === 'dislike'
          ? '操作成功'
          : '操作成功'

    sendResponse(res, 200, message, {
      likes: updatedReview.likes,
      dislikes: updatedReview.dislikes,
      userAction: action === 'cancel_dislike' ? null : -1, // 1=点赞, -1=踩, null=无操作
    })
  } catch (error) {
    handleError(res, error, '操作失败')
  }
})

// 获取商品评价列表
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, page_size = 20, rating_filter } = req.query
    const offset = (page - 1) * page_size

    // 从请求头获取用户ID（如果已登录）
    const token = req.headers.authorization?.split(' ')[1]
    let currentUserId = null

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        currentUserId = decoded.userId
      } catch (err) {
        // Token无效或过期，继续作为未登录用户
      }
    }

    let query = `
      SELECT r.*, u.username as user_name, u.avatar as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
    `
    const params = [id]

    if (rating_filter) {
      query += ' AND r.rating = ?'
      params.push(rating_filter)
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(page_size), offset)

    const [reviews] = await pool.query(query, params)

    // 如果用户已登录，获取用户对这些评论的点赞/踩状态
    if (currentUserId && reviews.length > 0) {
      const reviewIds = reviews.map(r => r.id)
      const [userLikes] = await pool.query(
        `SELECT review_id, type FROM review_likes 
         WHERE user_id = ? AND review_id IN (?)`,
        [currentUserId, reviewIds]
      )

      // 创建一个映射
      const likesMap = {}
      userLikes.forEach(like => {
        likesMap[like.review_id] = like.type
      })

      // 为每条评论添加用户的操作状态
      reviews.forEach(review => {
        review.userAction = likesMap[review.id] || null
      })
    } else {
      // 未登录用户，所有评论的userAction都为null
      reviews.forEach(review => {
        review.userAction = null
      })
    }

    const [[stats]] = await pool.query(
      `
      SELECT 
        COUNT(*) as total,
        AVG(rating) as avg_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews WHERE product_id = ?
    `,
      [id]
    )

    sendResponse(res, 200, '获取成功', {
      reviews,
      stats,
      page: parseInt(page),
      page_size: parseInt(page_size),
    })
  } catch (error) {
    handleError(res, error, '获取评价列表失败')
  }
})

// ============================================
// 13. 用户中心路由
// ============================================

// 获取用户信息
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const [[user]] = await pool.query(
      'SELECT id, username, phone, avatar, member_since FROM users WHERE id = ?',
      [req.user.userId]
    )

    if (!user) {
      return sendResponse(res, 404, '用户不存在')
    }

    const [[orderStats]] = await pool.query(
      `
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as to_pay,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as to_ship,
        SUM(CASE WHEN status IN ('shipped', 'in_transit') THEN 1 ELSE 0 END) as to_receive,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as to_review,
        COALESCE(SUM(total_amount), 0) as total_spent
      FROM orders WHERE user_id = ?
    `,
      [req.user.userId]
    )

    const [[{ favorite_count }]] = await pool.query(
      'SELECT COUNT(*) as favorite_count FROM favorites WHERE user_id = ?',
      [req.user.userId]
    )

    sendResponse(res, 200, '获取成功', {
      user,
      order_stats: orderStats,
      favorite_count,
    })
  } catch (error) {
    handleError(res, error, '获取用户信息失败')
  }
})

// 更新用户信息
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { username, phone, avatar } = req.body

    const updates = []
    const params = []

    if (username) {
      updates.push('username = ?')
      params.push(username)
    }
    if (phone) {
      updates.push('phone = ?')
      params.push(phone)
    }
    if (avatar) {
      updates.push('avatar = ?')
      params.push(avatar)
    }

    if (updates.length === 0) {
      return sendResponse(res, 400, '没有需要更新的信息')
    }

    params.push(req.user.userId)

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    )

    sendResponse(res, 200, '更新成功')
  } catch (error) {
    handleError(res, error, '更新用户信息失败')
  }
})

// 修改密码
app.put('/api/user/change-password', authenticateToken, async (req, res) => {
  try {
    const { old_password, new_password, confirm_password } = req.body

    if (!old_password || !new_password || !confirm_password) {
      return sendResponse(res, 400, '请填写完整信息')
    }

    if (new_password !== confirm_password) {
      return sendResponse(res, 400, '两次输入的新密码不一致')
    }

    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [
      req.user.userId,
    ])

    const isPasswordValid = await bcrypt.compare(old_password, user.password)
    if (!isPasswordValid) {
      return sendResponse(res, 401, '旧密码错误')
    }

    const hashedPassword = await bcrypt.hash(new_password, 10)

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [
      hashedPassword,
      req.user.userId,
    ])

    sendResponse(res, 200, '密码修改成功')
  } catch (error) {
    handleError(res, error, '修改密码失败')
  }
})

// ============================================
// 14. 系统管理路由
// ============================================

// 获取系统统计信息
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.query(
      'SELECT COUNT(*) as total_users FROM users'
    )

    const [[{ total_products }]] = await pool.query(
      'SELECT COUNT(*) as total_products FROM products'
    )

    const [[{ total_orders }]] = await pool.query(
      'SELECT COUNT(*) as total_orders FROM orders'
    )

    const [[{ today_orders }]] = await pool.query(
      'SELECT COUNT(*) as today_orders FROM orders WHERE DATE(created_at) = CURDATE()'
    )

    const [[{ total_sales }]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total_sales FROM orders WHERE status != 'cancelled'"
    )

    sendResponse(res, 200, '获取成功', {
      total_users,
      total_products,
      total_orders,
      today_orders,
      total_sales: parseFloat(total_sales).toFixed(2),
    })
  } catch (error) {
    handleError(res, error, '获取统计信息失败')
  }
})

// ============================================
// 健康检查和错误处理
// ============================================

// 健康检查接口
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    sendResponse(res, 200, '服务正常运行', {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '服务异常',
      status: 'unhealthy',
    })
  }
})

// 404处理
app.use((req, res) => {
  sendResponse(res, 404, '接口不存在')
})

// 全局错误处理
app.use((err, req, res) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// ============================================
// 启动服务器
// ============================================

app.listen(PORT, () => {
  console.log('='.repeat(60))
  console.log(`🚀 Fresh Harvest 电商系统后端服务已启动 (完整优化版)`)
  console.log(`📍 服务地址: http://localhost:${PORT}`)
  console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`)
  console.log(`🌍 运行环境: ${process.env.NODE_ENV || 'development'}`)
  console.log('='.repeat(60))
  console.log('\n✅ 新增/优化的接口:\n')
  console.log('【订单管理 - 优化】')
  console.log(
    '  GET    /api/orders                     - ✨ 添加分页total和完整counts'
  )
  console.log('  PUT    /api/orders/:id/status          - ✨ 添加状态流转验证')
  console.log('  GET    /api/logistics/:orderId         - 🆕 获取物流信息')
  console.log('  GET    /api/orders/search              - 🆕 订单搜索')
  console.log('  POST   /api/orders/batch-update-status - 🆕 批量更新订单状态')
  console.log('  GET    /api/orders/statistics          - 🆕 订单数据统计')
  console.log('\n💡 支持自动状态流转（前端调用 PUT /api/orders/:id/status）')
  console.log('='.repeat(60) + '\n')
})

// 优雅关闭
// process.on('SIGTERM', async () => {
//   console.log('收到 SIGTERM 信号，正在优雅关闭服务器...')
//   await pool.end()
//   process.exit(0)
// })

// process.on('SIGINT', async () => {
//   console.log('\n收到 SIGINT 信号，正在优雅关闭服务器...')
//   await pool.end()
//   process.exit(0)
// })

// module.exports = app
