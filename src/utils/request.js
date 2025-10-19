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
  config => {
    if (config.data) {
      // 可以在这里处理请求数据
    }

    // 添加token到请求头
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 检查业务状态码
    const { code, message, data } = response.data

    // 如果业务状态码表示成功（通常是0或200），直接返回
    if (code === 0 || code === 200) {
      return response
    }

    // 业务状态码表示失败，需要特殊处理

    // 处理不同的业务错误码
    switch (code) {
      case 400:
        // 请求参数错误
        break
      case 401:
        // 未授权（用户名或密码错误）
        break
      case 403: {
        // 无权限
        // 清除token并跳转登录页
        const userStore = useUserStore()
        userStore.logout().then(() => {
          router.push('/login')
        })
        break
      }
      case 404:
        break
      case 500:
        break
      default:
    }

    // 创建一个错误对象并拒绝
    const error = new Error(message || '请求失败')
    error.code = code
    error.data = data
    return Promise.reject(error)
  },
  error => {
    // 处理HTTP错误（非200状态码）
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401: {
          // HTTP 401 - 未授权，清除token并跳转到登录页
          const userStore = useUserStore()
          userStore.logout().then(() => {
            router.push('/login')
          })
          break
        }
        case 403:
          break
        case 404:
          break
        case 500:
          break
        default:
      }

      // 将服务器返回的错误信息添加到error对象
      if (data && data.message) {
        error.message = data.message
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      error.message = '网络错误，请检查网络连接'
    } else {
      // 其他错误
    }

    return Promise.reject(error)
  }
)

export default instance
export { baseURL }
