import { useUserStore } from '@/stores/userStore'
import axios from 'axios'
import router from '@/router'

const baseURL = 'https://www.xingyunfeicui.xyz/api'

const instance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    if (config.data) {
      console.log('📦 请求数据:', config.data)
    }

    // 添加token到请求头
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    console.error('❌ 请求错误:', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    console.log('✅ API响应:', response.config.url, response.data)

    // 检查业务状态码
    const { code, message, data } = response.data

    // 如果业务状态码表示成功（通常是0或200），直接返回
    if (code === 0 || code === 200) {
      return response
    }

    // 业务状态码表示失败，需要特殊处理
    console.warn('⚠️ 业务错误:', code, message)

    // 处理不同的业务错误码
    switch (code) {
      case 400:
        // 请求参数错误
        console.error('❌ 参数错误:', message)
        break
      case 401:
        // 未授权（用户名或密码错误）
        console.error('❌ 认证失败:', message)
        break
      case 403:
        // 无权限
        console.error('❌ 无权限访问:', message)
        // 清除token并跳转登录页
        const userStore = useUserStore()
        userStore.logout().then(() => {
          router.push('/login')
        })
        break
      case 404:
        console.error('❌ 资源不存在:', message)
        break
      case 500:
        console.error('❌ 服务器错误:', message)
        break
      default:
        console.error('❌ 请求失败:', message)
    }

    // 创建一个错误对象并拒绝
    const error = new Error(message || '请求失败')
    error.code = code
    error.data = data
    return Promise.reject(error)
  },
  (error) => {
    console.error('❌ HTTP错误:', error)

    // 处理HTTP错误（非200状态码）
    if (error.response) {
      const { status, data } = error.response
      console.error(`HTTP状态码: ${status}`, data)

      switch (status) {
        case 401:
          // HTTP 401 - 未授权，清除token并跳转到登录页
          console.warn('⚠️ HTTP 401: 未授权，请重新登录')
          const userStore = useUserStore()
          userStore.logout().then(() => {
            router.push('/login')
          })
          break
        case 403:
          console.warn('⚠️ HTTP 403: 无权限访问')
          break
        case 404:
          console.warn('⚠️ HTTP 404: 请求的资源不存在')
          break
        case 500:
          console.warn('⚠️ HTTP 500: 服务器错误')
          break
        default:
          console.warn('⚠️ HTTP错误:', data?.message || error.message)
      }

      // 将服务器返回的错误信息添加到error对象
      if (data && data.message) {
        error.message = data.message
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('⚠️ 网络错误，请检查网络连接')
      error.message = '网络错误，请检查网络连接'
    } else {
      // 其他错误
      console.error('⚠️ 请求配置错误:', error.message)
    }

    return Promise.reject(error)
  },
)

export default instance
export { baseURL }
