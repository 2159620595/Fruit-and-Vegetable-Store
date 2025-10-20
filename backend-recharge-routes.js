// backend-recharge-routes.js
// 充值系统后端路由和控制器

const express = require('express')
const router = express.Router()
const db = require('./database') // 假设您有数据库连接模块

// 中间件：验证用户身份
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ code: 401, message: '未授权访问' })
  }

  // 这里应该验证JWT token并获取用户信息
  // 假设验证成功，设置用户ID
  req.userId = 1 // 实际应该从token中解析
  next()
}

// 1. 获取充值金额配置
router.get('/amounts', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT amount, bonus_amount, is_active, sort_order 
      FROM recharge_amounts 
      WHERE is_active = TRUE 
      ORDER BY sort_order ASC
    `)

    res.json({
      code: 200,
      message: '获取成功',
      data: rows,
    })
  } catch (error) {
    console.error('获取充值金额配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    })
  }
})

// 2. 创建充值订单
router.post('/create', authenticateUser, async (req, res) => {
  try {
    const { amount, payment_method } = req.body
    const userId = req.userId

    // 验证充值金额
    const [amountConfig] = await db.execute(
      `
      SELECT bonus_amount FROM recharge_amounts 
      WHERE amount = ? AND is_active = TRUE
    `,
      [amount]
    )

    if (amountConfig.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '无效的充值金额',
      })
    }

    const bonusAmount = amountConfig[0].bonus_amount || 0
    const totalAmount = amount + bonusAmount

    // 创建充值记录
    const [result] = await db.execute(
      `
      INSERT INTO recharge_records 
      (user_id, amount, bonus_amount, total_amount, payment_method, payment_status) 
      VALUES (?, ?, ?, ?, ?, 'pending')
    `,
      [userId, amount, bonusAmount, totalAmount, payment_method]
    )

    const rechargeId = result.insertId

    // 生成支付参数（这里需要根据实际支付接口调整）
    const paymentData = {
      recharge_id: rechargeId,
      amount: amount,
      total_amount: totalAmount,
      payment_method: payment_method,
      // 这里应该调用第三方支付接口获取支付参数
      payment_url: `https://payment.example.com/pay?amount=${amount}&method=${payment_method}&order_id=${rechargeId}`,
    }

    res.json({
      code: 200,
      message: '充值订单创建成功',
      data: paymentData,
    })
  } catch (error) {
    console.error('创建充值订单失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    })
  }
})

// 3. 确认充值支付
router.post('/confirm', authenticateUser, async (req, res) => {
  try {
    const { recharge_id, transaction_id, payment_status } = req.body
    const userId = req.userId

    // 更新充值记录状态
    const [result] = await db.execute(
      `
      UPDATE recharge_records 
      SET payment_status = ?, transaction_id = ?, updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `,
      [payment_status, transaction_id, recharge_id, userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '充值记录不存在',
      })
    }

    // 如果支付成功，触发器会自动处理余额更新
    if (payment_status === 'success') {
      // 获取充值信息
      const [rechargeInfo] = await db.execute(
        `
        SELECT amount, bonus_amount, total_amount 
        FROM recharge_records 
        WHERE id = ?
      `,
        [recharge_id]
      )

      res.json({
        code: 200,
        message: '充值成功',
        data: {
          recharge_id: recharge_id,
          amount: rechargeInfo[0].amount,
          bonus_amount: rechargeInfo[0].bonus_amount,
          total_amount: rechargeInfo[0].total_amount,
        },
      })
    } else {
      res.json({
        code: 200,
        message: '支付状态已更新',
        data: { payment_status },
      })
    }
  } catch (error) {
    console.error('确认充值支付失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    })
  }
})

// 4. 获取充值记录
router.get('/records', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const [rows] = await db.execute(
      `
      SELECT id, amount, bonus_amount, total_amount, payment_method, 
             payment_status, transaction_id, created_at, updated_at
      FROM recharge_records 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `,
      [userId, parseInt(limit), offset]
    )

    const [countResult] = await db.execute(
      `
      SELECT COUNT(*) as total FROM recharge_records WHERE user_id = ?
    `,
      [userId]
    )

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        records: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit),
        },
      },
    })
  } catch (error) {
    console.error('获取充值记录失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    })
  }
})

// 5. 获取余额变动记录
router.get('/transactions', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId
    const { page = 1, limit = 10, type } = req.query
    const offset = (page - 1) * limit

    let whereClause = 'WHERE user_id = ?'
    const params = [userId]

    if (type) {
      whereClause += ' AND transaction_type = ?'
      params.push(type)
    }

    params.push(parseInt(limit), offset)

    const [rows] = await db.execute(
      `
      SELECT id, transaction_type, amount, balance_before, balance_after, 
             related_id, description, created_at
      FROM balance_transactions 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `,
      params
    )

    const [countResult] = await db.execute(
      `
      SELECT COUNT(*) as total FROM balance_transactions ${whereClause}
    `,
      params.slice(0, -2)
    )

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        transactions: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit),
        },
      },
    })
  } catch (error) {
    console.error('获取余额变动记录失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    })
  }
})

// 6. 获取用户余额信息
router.get('/balance', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId

    const [rows] = await db.execute(
      `
      SELECT id, username, balance, membership_level, total_recharge, 
             discount_rate, benefits
      FROM v_user_balance_info 
      WHERE id = ?
    `,
      [userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      })
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: rows[0],
    })
  } catch (error) {
    console.error('获取用户余额信息失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    })
  }
})

// 7. 获取会员等级信息
router.get('/membership-levels', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT level_name, level_icon, min_amount, discount_rate, benefits
      FROM membership_levels 
      ORDER BY min_amount ASC
    `)

    res.json({
      code: 200,
      message: '获取成功',
      data: rows,
    })
  } catch (error) {
    console.error('获取会员等级信息失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    })
  }
})

// 8. 使用余额支付订单
router.post('/pay-with-balance', authenticateUser, async (req, res) => {
  try {
    const { order_id, amount, description } = req.body
    const userId = req.userId

    // 开始事务
    await db.beginTransaction()

    try {
      // 调用存储过程处理余额支付
      const [result] = await db.execute(
        `
        CALL sp_process_balance_payment(?, ?, ?, ?)
      `,
        [userId, amount, order_id, description]
      )

      // 更新订单支付状态
      await db.execute(
        `
        UPDATE orders 
        SET payment_status = 'paid', payment_method = 'balance', updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `,
        [order_id, userId]
      )

      await db.commit()

      res.json({
        code: 200,
        message: '支付成功',
        data: {
          order_id: order_id,
          paid_amount: amount,
          payment_method: 'balance',
          balance_after: result[0][0].balance_after,
        },
      })
    } catch (error) {
      await db.rollback()
      throw error
    }
  } catch (error) {
    console.error('余额支付失败:', error)
    if (error.message === '余额不足') {
      res.status(400).json({
        code: 400,
        message: '余额不足',
      })
    } else {
      res.status(500).json({
        code: 500,
        message: '服务器内部错误',
      })
    }
  }
})

// 9. 申请退款
router.post('/refund', authenticateUser, async (req, res) => {
  try {
    const { transaction_id, amount, reason } = req.body
    const userId = req.userId

    // 验证交易记录
    const [transaction] = await db.execute(
      `
      SELECT id, amount, transaction_type, related_id
      FROM balance_transactions 
      WHERE id = ? AND user_id = ? AND transaction_type = 'purchase'
    `,
      [transaction_id, userId]
    )

    if (transaction.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '交易记录不存在',
      })
    }

    const refundAmount = Math.min(amount, Math.abs(transaction[0].amount))

    // 开始事务
    await db.beginTransaction()

    try {
      // 增加用户余额
      await db.execute(
        `
        UPDATE users SET balance = balance + ? WHERE id = ?
      `,
        [refundAmount, userId]
      )

      // 记录退款交易
      await db.execute(
        `
        INSERT INTO balance_transactions 
        (user_id, transaction_type, amount, balance_before, balance_after, 
         related_id, description)
        VALUES (?, 'refund', ?, 
                (SELECT balance - ? FROM users WHERE id = ?),
                (SELECT balance FROM users WHERE id = ?),
                ?, ?)
      `,
        [
          userId,
          refundAmount,
          refundAmount,
          userId,
          userId,
          transaction_id,
          `退款: ${reason || '用户申请退款'}`,
        ]
      )

      await db.commit()

      res.json({
        code: 200,
        message: '退款成功',
        data: {
          refund_amount: refundAmount,
          transaction_id: transaction_id,
        },
      })
    } catch (error) {
      await db.rollback()
      throw error
    }
  } catch (error) {
    console.error('退款失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    })
  }
})

module.exports = router
