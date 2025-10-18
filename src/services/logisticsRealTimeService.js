import { logisticsApi } from '@/api/logistics'

/**
 * 物流实时更新服务
 */
class LogisticsRealTimeService {
  constructor() {
    this.subscriptions = new Map() // 存储订阅信息
    this.timers = new Map() // 存储定时器
    this.callbacks = new Map() // 存储回调函数
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000
  }

  /**
   * 订阅物流更新
   * @param {string} trackingNumber - 快递单号
   * @param {string} carrier - 承运商
   * @param {Function} callback - 更新回调函数
   * @param {Object} options - 配置选项
   */
  subscribe(trackingNumber, carrier, callback, options = {}) {
    const {
      interval = 30000, // 刷新间隔（毫秒）
      useMock = true, // 是否使用模拟数据
      autoStart = true, // 是否自动开始
      deliveryAddress = null, // 收货地址
      orderStatus = 'shipped', // 订单状态
    } = options

    const subscriptionId = `${trackingNumber}_${carrier}_${Date.now()}`

    // 存储订阅信息
    this.subscriptions.set(subscriptionId, {
      trackingNumber,
      carrier,
      callback,
      interval,
      useMock,
      deliveryAddress,
      orderStatus,
      startTime: new Date().toISOString(),
      lastUpdate: null,
    })

    // 存储回调函数
    this.callbacks.set(subscriptionId, callback)

    if (autoStart) {
      this.startPolling(subscriptionId)
    }

    return subscriptionId
  }

  /**
   * 取消订阅
   * @param {string} subscriptionId - 订阅ID
   */
  unsubscribe(subscriptionId) {
    // 停止轮询
    this.stopPolling(subscriptionId)

    // 清理数据
    this.subscriptions.delete(subscriptionId)
    this.callbacks.delete(subscriptionId)
  }

  /**
   * 开始轮询
   * @param {string} subscriptionId - 订阅ID
   */
  startPolling(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) return

    // 如果已经有定时器，先清除
    this.stopPolling(subscriptionId)

    // 创建定时器
    const timer = setInterval(async () => {
      try {
        await this.fetchAndUpdate(subscriptionId)
      } catch (error) {
        console.error('轮询物流信息失败:', error)
        const callback = this.callbacks.get(subscriptionId)
        if (callback) {
          callback(null, error)
        }
      }
    }, subscription.interval)

    this.timers.set(subscriptionId, timer)

    // 立即执行一次
    this.fetchAndUpdate(subscriptionId)
  }

  /**
   * 停止轮询
   * @param {string} subscriptionId - 订阅ID
   */
  stopPolling(subscriptionId) {
    const timer = this.timers.get(subscriptionId)
    if (timer) {
      clearInterval(timer)
      this.timers.delete(subscriptionId)
    }
  }

  /**
   * 获取并更新物流信息
   * @param {string} subscriptionId - 订阅ID
   */
  async fetchAndUpdate(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) return

    try {
      let data

      if (subscription.useMock) {
        // 使用模拟数据
        data = await this.generateMockLogisticsData(
          subscription.trackingNumber,
          subscription.carrier,
          subscription.deliveryAddress,
          subscription.orderStatus,
        )
      } else {
        // 调用真实API
        data = await logisticsApi.getLogisticsInfo(
          subscription.trackingNumber,
          subscription.carrier,
        )
      }

      // 更新订阅信息
      subscription.lastUpdate = new Date().toISOString()

      // 调用回调函数
      const callback = this.callbacks.get(subscriptionId)
      if (callback) {
        callback(data, null)
      }
    } catch (error) {
      console.error('获取物流信息失败:', error)
      const callback = this.callbacks.get(subscriptionId)
      if (callback) {
        callback(null, error)
      }
    }
  }

  /**
   * 生成模拟物流数据
   * @param {string} trackingNumber - 快递单号
   * @param {string} carrier - 承运商
   * @param {Object} deliveryAddress - 收货地址
   * @param {string} orderStatus - 订单状态
   */
  async generateMockLogisticsData(
    trackingNumber,
    carrier,
    deliveryAddress = null,
    orderStatus = 'shipped',
  ) {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    const now = new Date()

    // 随机发货地址生成
    const getRandomOriginAddress = () => {
      const origins = [
        { province: '北京市', city: '北京市', district: '朝阳区', detail: '望京街道' },
        { province: '上海市', city: '上海市', district: '浦东新区', detail: '陆家嘴街道' },
        { province: '广东省', city: '深圳市', district: '南山区', detail: '科技园街道' },
        { province: '江苏省', city: '南京市', district: '鼓楼区', detail: '新街口街道' },
        { province: '浙江省', city: '杭州市', district: '西湖区', detail: '文三路街道' },
        { province: '四川省', city: '成都市', district: '锦江区', detail: '春熙路街道' },
        { province: '湖北省', city: '武汉市', district: '江汉区', detail: '中山大道街道' },
        { province: '山东省', city: '济南市', district: '历下区', detail: '泉城路街道' },
      ]
      return origins[Math.floor(Math.random() * origins.length)]
    }

    // 根据收货地址生成更准确的物流信息
    const getLocationInfo = (address) => {
      const originAddress = getRandomOriginAddress()

      if (!address) {
        return {
          origin: `${originAddress.province}分拣中心`,
          destination: '上海分拣中心',
          finalLocation: '上海市浦东新区',
          originAddress: originAddress,
        }
      }

      // 根据省份和城市生成相应的物流信息
      const province = address.province || ''
      const city = address.city || ''
      const district = address.district || ''

      // 模拟从随机发货地到目标城市
      let destination = '分拣中心'
      let finalLocation = district || city || province

      if (province.includes('北京') || province.includes('天津') || province.includes('河北')) {
        destination = '华北分拣中心'
      } else if (
        province.includes('上海') ||
        province.includes('江苏') ||
        province.includes('浙江')
      ) {
        destination = '华东分拣中心'
      } else if (
        province.includes('广东') ||
        province.includes('深圳') ||
        province.includes('广州')
      ) {
        destination = '华南分拣中心'
      } else if (
        province.includes('四川') ||
        province.includes('重庆') ||
        province.includes('成都')
      ) {
        destination = '西南分拣中心'
      } else {
        destination = `${province}分拣中心`
      }

      return {
        origin: `${originAddress.province}分拣中心`,
        destination: destination,
        finalLocation: finalLocation || city || province,
        originAddress: originAddress,
      }
    }

    const locationInfo = getLocationInfo(deliveryAddress)

    // 根据订单状态生成相应的物流轨迹
    const generateStepsByOrderStatus = (status, locationInfo) => {
      const logisticsSteps = []
      const now = new Date()

      switch (status) {
        case 'pending':
          // 待支付状态 - 无物流信息
          return []

        case 'processing':
          // 待发货状态 - 只有已发货
          logisticsSteps.push({
            title: '已发货',
            description: `您的订单已从${locationInfo.origin}发出`,
            time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toLocaleString('zh-CN'),
            location: locationInfo.origin,
            status: 'shipped',
            completed: true,
            current: false,
            icon: '🚚',
          })
          break

        case 'shipped':
          // 已发货状态 - 发货和运输中
          logisticsSteps.push({
            title: '已发货',
            description: `您的订单已从${locationInfo.origin}发出`,
            time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
            location: locationInfo.origin,
            status: 'shipped',
            completed: true,
            current: false,
            icon: '🚚',
          })
          logisticsSteps.push({
            title: '运输中',
            description: `正在从${locationInfo.origin}运输到${locationInfo.destination}`,
            time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
            location: `${locationInfo.origin}-${locationInfo.destination}`,
            status: 'in_transit',
            completed: true,
            current: true,
            icon: '🚛',
          })
          break

        case 'in_transit':
          // 运输中状态 - 发货、运输中、到达分拣中心
          logisticsSteps.push({
            title: '已发货',
            description: `您的订单已从${locationInfo.origin}发出`,
            time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
            location: locationInfo.origin,
            status: 'shipped',
            completed: true,
            current: false,
            icon: '🚚',
          })
          logisticsSteps.push({
            title: '运输中',
            description: `正在从${locationInfo.origin}运输到${locationInfo.destination}`,
            time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
            location: `${locationInfo.origin}-${locationInfo.destination}`,
            status: 'in_transit',
            completed: true,
            current: false,
            icon: '🚛',
          })
          logisticsSteps.push({
            title: '到达分拣中心',
            description: `已到达${locationInfo.destination}，准备派送`,
            time: new Date(now.getTime() - 4 * 60 * 60 * 1000).toLocaleString('zh-CN'),
            location: locationInfo.destination,
            status: 'in_transit',
            completed: true,
            current: true,
            icon: '🏢',
          })
          break

        case 'delivered':
          // 已完成状态 - 完整物流轨迹
          logisticsSteps.push({
            title: '已发货',
            description: `您的订单已从${locationInfo.origin}发出`,
            time: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
            location: locationInfo.origin,
            status: 'shipped',
            completed: true,
            current: false,
            icon: '🚚',
          })
          logisticsSteps.push({
            title: '运输中',
            description: `正在从${locationInfo.origin}运输到${locationInfo.destination}`,
            time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
            location: `${locationInfo.origin}-${locationInfo.destination}`,
            status: 'in_transit',
            completed: true,
            current: false,
            icon: '🚛',
          })
          logisticsSteps.push({
            title: '到达分拣中心',
            description: `已到达${locationInfo.destination}，准备派送`,
            time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
            location: locationInfo.destination,
            status: 'in_transit',
            completed: true,
            current: false,
            icon: '🏢',
          })
          logisticsSteps.push({
            title: '派送中',
            description: '快递员正在派送中，请注意查收',
            time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toLocaleString('zh-CN'),
            location: locationInfo.finalLocation,
            status: 'out_for_delivery',
            completed: true,
            current: false,
            icon: '🏍️',
          })
          logisticsSteps.push({
            title: '已送达',
            description: '包裹已签收，感谢您的耐心等待',
            time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toLocaleString('zh-CN'),
            location: locationInfo.finalLocation,
            status: 'delivered',
            completed: true,
            current: true,
            icon: '✅',
          })
          break

        default:
          // 默认状态 - 基本物流信息
          logisticsSteps.push({
            title: '已发货',
            description: `您的订单已从${locationInfo.origin}发出`,
            time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
            location: locationInfo.origin,
            status: 'shipped',
            completed: true,
            current: true,
            icon: '🚚',
          })
      }

      return logisticsSteps
    }

    // 根据订单状态生成物流步骤
    const steps = generateStepsByOrderStatus(orderStatus, locationInfo)

    // 根据收货地址计算预计送达时间
    const getEstimatedDelivery = (address) => {
      if (!address) {
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toLocaleString('zh-CN')
      }

      const province = address.province || ''
      let deliveryDays = 2 // 默认2天

      // 根据距离调整送达时间
      if (province.includes('北京') || province.includes('天津') || province.includes('河北')) {
        deliveryDays = 1 // 华北地区1天
      } else if (
        province.includes('上海') ||
        province.includes('江苏') ||
        province.includes('浙江')
      ) {
        deliveryDays = 2 // 华东地区2天
      } else if (
        province.includes('广东') ||
        province.includes('深圳') ||
        province.includes('广州')
      ) {
        deliveryDays = 3 // 华南地区3天
      } else if (
        province.includes('四川') ||
        province.includes('重庆') ||
        province.includes('成都')
      ) {
        deliveryDays = 3 // 西南地区3天
      } else {
        deliveryDays = 4 // 其他地区4天
      }

      return new Date(now.getTime() + deliveryDays * 24 * 60 * 60 * 1000).toLocaleString('zh-CN')
    }

    return {
      trackingNumber,
      carrier: carrier || '顺丰速运',
      steps,
      estimatedDelivery: getEstimatedDelivery(deliveryAddress),
      lastUpdateTime: now.toLocaleString('zh-CN'),
      status: steps.length > 0 ? steps[steps.length - 1].status : 'pending',
      deliveryAddress: deliveryAddress,
      originAddress: locationInfo.originAddress,
      orderStatus: orderStatus,
    }
  }

  /**
   * 获取订阅状态
   * @param {string} subscriptionId - 订阅ID
   */
  getSubscriptionStatus(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) return null

    return {
      isActive: this.timers.has(subscriptionId),
      trackingNumber: subscription.trackingNumber,
      carrier: subscription.carrier,
      interval: subscription.interval,
      startTime: subscription.startTime,
      lastUpdate: subscription.lastUpdate,
      useMock: subscription.useMock,
    }
  }

  /**
   * 获取所有订阅状态
   */
  getAllSubscriptionStatus() {
    const status = {}
    for (const [subscriptionId, subscription] of this.subscriptions) {
      status[subscriptionId] = this.getSubscriptionStatus(subscriptionId)
    }
    return status
  }

  /**
   * 暂停所有订阅
   */
  pauseAll() {
    for (const subscriptionId of this.subscriptions.keys()) {
      this.stopPolling(subscriptionId)
    }
  }

  /**
   * 恢复所有订阅
   */
  resumeAll() {
    for (const subscriptionId of this.subscriptions.keys()) {
      this.startPolling(subscriptionId)
    }
  }

  /**
   * 清理所有订阅
   */
  cleanup() {
    // 停止所有定时器
    for (const timer of this.timers.values()) {
      clearInterval(timer)
    }

    // 清理所有数据
    this.subscriptions.clear()
    this.timers.clear()
    this.callbacks.clear()
  }

  /**
   * 批量订阅
   * @param {Array} subscriptions - 订阅列表
   */
  batchSubscribe(subscriptions) {
    const subscriptionIds = []

    for (const sub of subscriptions) {
      const { trackingNumber, carrier, callback, options = {} } = sub
      const subscriptionId = this.subscribe(trackingNumber, carrier, callback, options)
      subscriptionIds.push(subscriptionId)
    }

    return subscriptionIds
  }

  /**
   * 批量取消订阅
   * @param {Array} subscriptionIds - 订阅ID列表
   */
  batchUnsubscribe(subscriptionIds) {
    for (const subscriptionId of subscriptionIds) {
      this.unsubscribe(subscriptionId)
    }
  }
}

// 创建单例实例
const logisticsRealTimeService = new LogisticsRealTimeService()

export default logisticsRealTimeService
