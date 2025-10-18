import request from '@/utils/request'

/**
 * 物流跟踪API
 */
export const logisticsApi = {
  /**
   * 获取物流跟踪信息
   * @param {string} trackingNumber - 快递单号
   * @param {string} carrier - 承运商
   * @returns {Promise} 物流跟踪信息
   */
  async getLogisticsInfo(trackingNumber, carrier = '') {
    try {
      const response = await request.get('/api/logistics/track', {
        params: {
          tracking_number: trackingNumber,
          carrier: carrier,
        },
      })
      return response.data
    } catch (error) {
      console.error('获取物流信息失败:', error)
      throw error
    }
  },

  /**
   * 获取支持的快递公司列表
   * @returns {Promise} 快递公司列表
   */
  async getSupportedCarriers() {
    try {
      const response = await request.get('/api/logistics/carriers')
      return response.data
    } catch (error) {
      console.error('获取快递公司列表失败:', error)
      throw error
    }
  },

  /**
   * 订阅物流更新通知
   * @param {string} trackingNumber - 快递单号
   * @param {string} carrier - 承运商
   * @param {string} callbackUrl - 回调URL
   * @returns {Promise} 订阅结果
   */
  async subscribeLogisticsUpdates(trackingNumber, carrier, callbackUrl) {
    try {
      const response = await request.post('/api/logistics/subscribe', {
        tracking_number: trackingNumber,
        carrier: carrier,
        callback_url: callbackUrl,
      })
      return response.data
    } catch (error) {
      console.error('订阅物流更新失败:', error)
      throw error
    }
  },

  /**
   * 取消物流更新订阅
   * @param {string} subscriptionId - 订阅ID
   * @returns {Promise} 取消结果
   */
  async unsubscribeLogisticsUpdates(subscriptionId) {
    try {
      const response = await request.delete(`/api/logistics/subscribe/${subscriptionId}`)
      return response.data
    } catch (error) {
      console.error('取消物流订阅失败:', error)
      throw error
    }
  },

  /**
   * 获取订单的物流信息
   * @param {string|number} orderId - 订单ID
   * @returns {Promise} 订单物流信息
   */
  async getOrderLogistics(orderId) {
    try {
      const response = await request.get(`/api/orders/${orderId}/logistics`)
      return response.data
    } catch (error) {
      console.error('获取订单物流信息失败:', error)
      throw error
    }
  },

  /**
   * 更新订单物流信息
   * @param {string|number} orderId - 订单ID
   * @param {Object} logisticsData - 物流数据
   * @returns {Promise} 更新结果
   */
  async updateOrderLogistics(orderId, logisticsData) {
    try {
      const response = await request.put(`/api/orders/${orderId}/logistics`, logisticsData)
      return response.data
    } catch (error) {
      console.error('更新订单物流信息失败:', error)
      throw error
    }
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
    const estimatedDate = new Date(shippedDate.getTime() + days * 24 * 60 * 60 * 1000)

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
