import request from '@/utils/request'

/**
 * 物流跟踪API
 * ⚠️ 注意：后端只实现了 GET /api/logistics/:orderId
 * 其他接口暂未实现，建议使用模拟数据或前端逻辑
 */
export const logisticsApi = {
  /**
   * 获取订单的物流信息（后端已实现）
   * @param {string|number} orderId - 订单ID
   * @returns {Promise} 订单物流信息
   */
  async getOrderLogistics(orderId) {
    try {
      // ✅ 使用 order.js 中的 getLogistics 接口
      const response = await request.get(`/logistics/${orderId}`)
      return response.data
    } catch (error) {
      console.error('获取订单物流信息失败:', error)
      throw error
    }
  },

  /**
   * ⚠️ 以下接口后端暂未实现，返回模拟数据
   */

  /**
   * 获取物流跟踪信息（暂未实现）
   */
  async getLogisticsInfo(trackingNumber, carrier = '') {
    console.warn('⚠️ 后端暂未实现此接口，请使用 getOrderLogistics')
    return Promise.resolve({
      code: 200,
      message: '请使用订单ID获取物流信息',
      data: null,
    })
  },

  /**
   * 获取支持的快递公司列表（暂未实现）
   */
  async getSupportedCarriers() {
    console.warn('⚠️ 后端暂未实现此接口')
    return Promise.resolve({
      code: 200,
      data: [
        '顺丰速运',
        '圆通速递',
        '中通快递',
        '申通快递',
        '韵达速递',
        '京东物流',
        '邮政EMS',
      ],
    })
  },

  /**
   * 订阅物流更新通知（暂未实现）
   */
  async subscribeLogisticsUpdates(trackingNumber, carrier, callbackUrl) {
    console.warn('⚠️ 后端暂未实现此接口')
    return Promise.resolve({
      code: 200,
      message: '暂不支持订阅功能',
    })
  },

  /**
   * 取消物流更新订阅（暂未实现）
   */
  async unsubscribeLogisticsUpdates(subscriptionId) {
    console.warn('⚠️ 后端暂未实现此接口')
    return Promise.resolve({
      code: 200,
      message: '暂不支持取消订阅',
    })
  },

  /**
   * 更新订单物流信息（暂未实现）
   */
  async updateOrderLogistics(orderId, logisticsData) {
    console.warn('⚠️ 后端暂未实现此接口，物流信息由后端自动更新')
    return Promise.resolve({
      code: 200,
      message: '物流信息由系统自动更新',
    })
  },
}

/**
 * 物流工具函数
 */
export const logisticsUtils = {
  /**
   * 格式化物流状态
   * @param {string} status - 原始状态
   * @returns {Object} 格式化后的状态信息
   */
  formatLogisticsStatus(status) {
    const statusMap = {
      pending: {
        text: '待发货',
        icon: '📦',
        color: '#e6a23c',
        description: '商家正在准备商品',
      },
      shipped: {
        text: '已发货',
        icon: '🚚',
        color: '#409eff',
        description: '商品已发出，正在配送',
      },
      in_transit: {
        text: '运输中',
        icon: '🚛',
        color: '#67c23a',
        description: '商品正在运输途中',
      },
      out_for_delivery: {
        text: '派送中',
        icon: '🏍️',
        color: '#007bff',
        description: '快递员正在派送中',
      },
      delivered: {
        text: '已送达',
        icon: '✅',
        color: '#67c23a',
        description: '包裹已签收',
      },
      exception: {
        text: '异常',
        icon: '⚠️',
        color: '#f56c6c',
        description: '物流出现异常，请联系客服',
      },
      returned: {
        text: '已退回',
        icon: '↩️',
        color: '#909399',
        description: '包裹已退回',
      },
    }

    return (
      statusMap[status] || {
        text: status || '未知状态',
        icon: '❓',
        color: '#909399',
        description: '状态未知',
      }
    )
  },

  /**
   * 格式化时间
   * @param {string|Date} time - 时间
   * @returns {string} 格式化后的时间
   */
  formatTime(time) {
    if (!time) return ''

    const date = new Date(time)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  },

  /**
   * 计算预计送达时间
   * @param {string} shippedTime - 发货时间
   * @param {string} carrier - 承运商
   * @returns {string} 预计送达时间
   */
  calculateEstimatedDelivery(shippedTime, carrier) {
    if (!shippedTime) return ''

    const shippedDate = new Date(shippedTime)
    const carrierDays = {
      顺丰速运: 1,
      圆通速递: 2,
      中通快递: 2,
      申通快递: 2,
      韵达速递: 2,
      京东物流: 1,
      邮政EMS: 3,
    }

    const days = carrierDays[carrier] || 2
    const estimatedDate = new Date(
      shippedDate.getTime() + days * 24 * 60 * 60 * 1000
    )

    return estimatedDate.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  },

  /**
   * 验证快递单号格式
   * @param {string} trackingNumber - 快递单号
   * @param {string} carrier - 承运商
   * @returns {boolean} 是否有效
   */
  validateTrackingNumber(trackingNumber, carrier) {
    if (!trackingNumber) return false

    const patterns = {
      顺丰速运: /^SF\d{12}$/,
      圆通速递: /^YT\d{13}$/,
      中通快递: /^ZTO\d{12}$/,
      申通快递: /^STO\d{12}$/,
      韵达速递: /^YD\d{12}$/,
      京东物流: /^JD\d{12}$/,
      邮政EMS: /^EM\d{13}$/,
    }

    const pattern = patterns[carrier]
    return pattern ? pattern.test(trackingNumber) : trackingNumber.length >= 8
  },

  /**
   * 获取快递公司图标
   * @param {string} carrier - 承运商
   * @returns {string} 图标
   */
  getCarrierIcon(carrier) {
    const icons = {
      顺丰速运: '🚀',
      圆通速递: '🔵',
      中通快递: '🟡',
      申通快递: '🔴',
      韵达速递: '🟢',
      京东物流: '🐕',
      邮政EMS: '📮',
    }

    return icons[carrier] || '📦'
  },
}

/**
 * 模拟物流数据（用于开发测试）
 */
export const mockLogisticsData = {
  /**
   * 生成模拟物流步骤
   * @param {string} trackingNumber - 快递单号
   * @param {string} carrier - 承运商
   * @returns {Array} 物流步骤
   */
  generateMockSteps(trackingNumber, carrier = '顺丰速运') {
    const now = new Date()
    const steps = []

    // 已发货
    const shippedTime = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    steps.push({
      title: '已发货',
      description: '您的订单已从北京分拣中心发出',
      time: shippedTime.toLocaleString('zh-CN'),
      location: '北京分拣中心',
      status: 'shipped',
      completed: true,
      current: false,
      icon: '🚚',
    })

    // 运输中
    const transitTime = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
    steps.push({
      title: '运输中',
      description: '正在运输途中，预计明天到达',
      time: transitTime.toLocaleString('zh-CN'),
      location: '运输途中',
      status: 'in_transit',
      completed: true,
      current: false,
      icon: '🚛',
    })

    // 到达分拣中心
    const arrivedTime = new Date(now.getTime() - 4 * 60 * 60 * 1000)
    steps.push({
      title: '到达分拣中心',
      description: '已到达上海分拣中心，准备派送',
      time: arrivedTime.toLocaleString('zh-CN'),
      location: '上海分拣中心',
      status: 'in_transit',
      completed: true,
      current: false,
      icon: '🏢',
    })

    // 派送中
    const deliveryTime = new Date(now.getTime() - 1 * 60 * 60 * 1000)
    steps.push({
      title: '派送中',
      description: '快递员正在派送中，请注意查收',
      time: deliveryTime.toLocaleString('zh-CN'),
      location: '上海市浦东新区',
      status: 'out_for_delivery',
      completed: false,
      current: true,
      icon: '🏍️',
    })

    // 已送达（可选）
    const deliveredTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    steps.push({
      title: '已送达',
      description: '包裹已签收，感谢您的耐心等待',
      time: deliveredTime.toLocaleString('zh-CN'),
      location: '上海市浦东新区',
      status: 'delivered',
      completed: false,
      current: false,
      icon: '✅',
    })

    return steps
  },

  /**
   * 生成模拟物流信息
   * @param {string} trackingNumber - 快递单号
   * @param {string} carrier - 承运商
   * @returns {Object} 物流信息
   */
  generateMockLogisticsInfo(trackingNumber, carrier = '顺丰速运') {
    const steps = this.generateMockSteps(trackingNumber, carrier)
    const now = new Date()
    const estimatedDelivery = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    return {
      trackingNumber,
      carrier,
      steps,
      estimatedDelivery: estimatedDelivery.toLocaleString('zh-CN'),
      lastUpdateTime: now.toLocaleString('zh-CN'),
      status: 'out_for_delivery',
    }
  },
}

export default logisticsApi
