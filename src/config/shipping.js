/**
 * 运费配置
 * 统一管理运费相关的规则和常量
 */

// 免运费门槛（满多少元包邮）
export const FREE_SHIPPING_THRESHOLD = 99

// 基础运费（标准配送）
export const BASE_SHIPPING_FEE = 8

// 特快配送额外费用
export const EXPRESS_EXTRA_FEE = 5

/**
 * 计算运费
 * @param {number} subtotal - 商品小计金额
 * @param {string} deliveryMethod - 配送方式 ('standard' | 'express')
 * @returns {number} 运费金额
 */
export function calculateShippingFee(subtotal, deliveryMethod = 'standard') {
  // 满额免运费
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0
  }

  // 根据配送方式计算运费
  if (deliveryMethod === 'express') {
    return BASE_SHIPPING_FEE + EXPRESS_EXTRA_FEE
  }

  return BASE_SHIPPING_FEE
}

/**
 * 计算距离免运费还差多少
 * @param {number} subtotal - 商品小计金额
 * @returns {number} 还需购买的金额
 */
export function calculateFreeShippingRemaining(subtotal) {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal
  return remaining > 0 ? remaining : 0
}

/**
 * 格式化运费显示
 * @param {number} fee - 运费金额
 * @returns {string} 格式化后的运费文本
 */
export function formatShippingFee(fee) {
  return fee === 0 ? '免费' : `¥${fee.toFixed(2)}`
}
