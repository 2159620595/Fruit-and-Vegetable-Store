import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  logisticsApi,
  logisticsUtils,
  mockLogisticsData,
} from '@/api/logistics'

export const useLogisticsStore = defineStore('logistics', () => {
  // State
  const logisticsData = ref(new Map()) // 存储物流数据，key为trackingNumber
  const loading = ref(false)
  const error = ref(null)
  const subscriptions = ref(new Map()) // 存储订阅信息
  const refreshTimers = ref(new Map()) // 存储刷新定时器

  // Getters
  const getLogisticsByTrackingNumber = computed(() => {
    return trackingNumber => {
      return logisticsData.value.get(trackingNumber) || null
    }
  })

  const getLogisticsByOrderId = computed(() => {
    return orderId => {
      for (const [trackingNumber, data] of logisticsData.value) {
        if (data.orderId === orderId) {
          return data
        }
      }
      return null
    }
  })

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // Actions
  /**
   * 获取物流信息
   * @param {string} trackingNumber - 快递单号
   * @param {string} carrier - 承运商
   * @param {string|number} orderId - 订单ID（可选）
   * @param {boolean} useMock - 是否使用模拟数据
   */
  const fetchLogisticsInfo = async (
    trackingNumber,
    carrier = '',
    orderId = null,
    useMock = true
  ) => {
    if (!trackingNumber) {
      throw new Error('快递单号不能为空')
    }

    loading.value = true
    error.value = null

    try {
      let data

      if (useMock) {
        // 使用模拟数据
        data = mockLogisticsData.generateMockLogisticsInfo(
          trackingNumber,
          carrier
        )
      } else {
        // 调用真实API
        data = await logisticsApi.getLogisticsInfo(trackingNumber, carrier)
      }

      // 添加订单ID
      if (orderId) {
        data.orderId = orderId
      }

      // 存储数据
      logisticsData.value.set(trackingNumber, {
        ...data,
        lastFetchTime: new Date().toISOString(),
        carrier: carrier || data.carrier,
      })

      return data
    } catch (err) {
      error.value = err.message || '获取物流信息失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取订单物流信息
   * @param {string|number} orderId - 订单ID
   * @param {boolean} useMock - 是否使用模拟数据
   */
  const fetchOrderLogistics = async (orderId, useMock = true) => {
    loading.value = true
    error.value = null

    try {
      let data

      if (useMock) {
        // 模拟订单物流数据
        data = {
          orderId,
          trackingNumber: `SF${Date.now()}`,
          carrier: '顺丰速运',
          ...mockLogisticsData.generateMockLogisticsInfo(
            `SF${Date.now()}`,
            '顺丰速运'
          ),
        }
      } else {
        // 调用真实API
        data = await logisticsApi.getOrderLogistics(orderId)
      }

      // 存储数据
      if (data.trackingNumber) {
        logisticsData.value.set(data.trackingNumber, {
          ...data,
          lastFetchTime: new Date().toISOString(),
        })
      }

      return data
    } catch (err) {
      error.value = err.message || '获取订单物流信息失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新物流信息
   * @param {string} trackingNumber - 快递单号
   * @param {boolean} useMock - 是否使用模拟数据
   */
  const refreshLogisticsInfo = async (trackingNumber, useMock = true) => {
    const existingData = logisticsData.value.get(trackingNumber)
    if (!existingData) {
      throw new Error('物流信息不存在')
    }

    return await fetchLogisticsInfo(
      trackingNumber,
      existingData.carrier,
      existingData.orderId,
      useMock
    )
  }

  /**
   * 订阅物流更新
   * @param {string} trackingNumber - 快递单号
   * @param {string} carrier - 承运商
   * @param {number} interval - 刷新间隔（毫秒）
   * @param {boolean} useMock - 是否使用模拟数据
   */
  const subscribeLogisticsUpdates = (
    trackingNumber,
    carrier = '',
    interval = 30000,
    useMock = true
  ) => {
    if (!trackingNumber) {
      throw new Error('快递单号不能为空')
    }

    // 如果已经订阅，先取消
    unsubscribeLogisticsUpdates(trackingNumber)

    // 创建定时器
    const timer = setInterval(async () => {
      try {
        await refreshLogisticsInfo(trackingNumber, useMock)
      } catch {
        // 自动刷新失败时静默处理
      }
    }, interval)

    // 存储订阅信息
    subscriptions.value.set(trackingNumber, {
      carrier,
      interval,
      timer,
      useMock,
      startTime: new Date().toISOString(),
    })

    // 立即执行一次
    refreshLogisticsInfo(trackingNumber, useMock)
  }

  /**
   * 取消物流更新订阅
   * @param {string} trackingNumber - 快递单号
   */
  const unsubscribeLogisticsUpdates = trackingNumber => {
    const subscription = subscriptions.value.get(trackingNumber)
    if (subscription) {
      clearInterval(subscription.timer)
      subscriptions.value.delete(trackingNumber)
    }
  }

  /**
   * 取消所有物流更新订阅
   */
  const unsubscribeAllLogisticsUpdates = () => {
    for (const [trackingNumber, subscription] of subscriptions.value) {
      clearInterval(subscription.timer)
    }
    subscriptions.value.clear()
  }

  /**
   * 更新物流信息
   * @param {string} trackingNumber - 快递单号
   * @param {Object} updateData - 更新数据
   */
  const updateLogisticsInfo = (trackingNumber, updateData) => {
    const existingData = logisticsData.value.get(trackingNumber)
    if (existingData) {
      logisticsData.value.set(trackingNumber, {
        ...existingData,
        ...updateData,
        lastUpdateTime: new Date().toISOString(),
      })
    }
  }

  /**
   * 清除物流数据
   * @param {string} trackingNumber - 快递单号（可选，不传则清除所有）
   */
  const clearLogisticsData = (trackingNumber = null) => {
    if (trackingNumber) {
      logisticsData.value.delete(trackingNumber)
      unsubscribeLogisticsUpdates(trackingNumber)
    } else {
      logisticsData.value.clear()
      unsubscribeAllLogisticsUpdates()
    }
  }

  /**
   * 获取支持的快递公司列表
   * @param {boolean} useMock - 是否使用模拟数据
   */
  const getSupportedCarriers = async (useMock = true) => {
    try {
      if (useMock) {
        return [
          { code: 'SF', name: '顺丰速运', icon: '🚀' },
          { code: 'YTO', name: '圆通速递', icon: '🔵' },
          { code: 'ZTO', name: '中通快递', icon: '🟡' },
          { code: 'STO', name: '申通快递', icon: '🔴' },
          { code: 'YD', name: '韵达速递', icon: '🟢' },
          { code: 'JD', name: '京东物流', icon: '🐕' },
          { code: 'EMS', name: '邮政EMS', icon: '📮' },
        ]
      } else {
        return await logisticsApi.getSupportedCarriers()
      }
    } catch (err) {
      throw err
    }
  }

  /**
   * 验证快递单号
   * @param {string} trackingNumber - 快递单号
   * @param {string} carrier - 承运商
   */
  const validateTrackingNumber = (trackingNumber, carrier) => {
    return logisticsUtils.validateTrackingNumber(trackingNumber, carrier)
  }

  /**
   * 格式化物流状态
   * @param {string} status - 状态
   */
  const formatLogisticsStatus = status => {
    return logisticsUtils.formatLogisticsStatus(status)
  }

  /**
   * 格式化时间
   * @param {string|Date} time - 时间
   */
  const formatTime = time => {
    return logisticsUtils.formatTime(time)
  }

  /**
   * 获取快递公司图标
   * @param {string} carrier - 承运商
   */
  const getCarrierIcon = carrier => {
    return logisticsUtils.getCarrierIcon(carrier)
  }

  /**
   * 计算预计送达时间
   * @param {string} shippedTime - 发货时间
   * @param {string} carrier - 承运商
   */
  const calculateEstimatedDelivery = (shippedTime, carrier) => {
    return logisticsUtils.calculateEstimatedDelivery(shippedTime, carrier)
  }

  /**
   * 获取订阅状态
   * @param {string} trackingNumber - 快递单号
   */
  const getSubscriptionStatus = trackingNumber => {
    const subscription = subscriptions.value.get(trackingNumber)
    return subscription
      ? {
          isSubscribed: true,
          carrier: subscription.carrier,
          interval: subscription.interval,
          startTime: subscription.startTime,
          useMock: subscription.useMock,
        }
      : {
          isSubscribed: false,
        }
  }

  /**
   * 获取所有订阅状态
   */
  const getAllSubscriptionStatus = () => {
    const status = {}
    for (const [trackingNumber, subscription] of subscriptions.value) {
      status[trackingNumber] = {
        carrier: subscription.carrier,
        interval: subscription.interval,
        startTime: subscription.startTime,
        useMock: subscription.useMock,
      }
    }
    return status
  }

  return {
    // State
    logisticsData,
    loading,
    error,
    subscriptions,
    refreshTimers,

    // Getters
    getLogisticsByTrackingNumber,
    getLogisticsByOrderId,
    isLoading,
    hasError,

    // Actions
    fetchLogisticsInfo,
    fetchOrderLogistics,
    refreshLogisticsInfo,
    subscribeLogisticsUpdates,
    unsubscribeLogisticsUpdates,
    unsubscribeAllLogisticsUpdates,
    updateLogisticsInfo,
    clearLogisticsData,
    getSupportedCarriers,
    validateTrackingNumber,
    formatLogisticsStatus,
    formatTime,
    getCarrierIcon,
    calculateEstimatedDelivery,
    getSubscriptionStatus,
    getAllSubscriptionStatus,
  }
})
