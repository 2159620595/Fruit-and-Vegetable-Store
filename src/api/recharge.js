// src/api/recharge.js
import request from '@/utils/request'

// 获取充值金额配置
export const getRechargeAmountsService = () => request.get('/recharge/amounts')

// 创建充值订单
export const createRechargeOrderService = data =>
  request.post('/recharge/create', data)

// 确认充值支付
export const confirmRechargePaymentService = data =>
  request.post('/recharge/confirm', data)

// 获取充值记录
export const getRechargeRecordsService = params =>
  request.get('/recharge/records', { params })

// 获取余额变动记录
export const getBalanceTransactionsService = params =>
  request.get('/recharge/transactions', { params })

// 获取用户余额信息
export const getUserBalanceService = () => request.get('/recharge/balance')

// 获取会员等级信息
export const getMembershipLevelsService = () =>
  request.get('/recharge/membership-levels')

// 使用余额支付订单
export const payWithBalanceService = data =>
  request.post('/recharge/pay-with-balance', data)

// 申请退款
export const requestRefundService = data =>
  request.post('/recharge/refund', data)
