import { useUserStore } from '@/stores/modules/user'
import axios from 'axios'
import router from '@/router'
import { ElMessage, ElLoading } from 'element-plus'

const baseURL = 'https://www.xingyunfeicui.xyz/api'

// 全局Loading计数器
let loadingCount = 0
let loadingInstance = null

const instance = axios.create({
  baseURL,
  timeout: 100000,
})

instance.interceptors.request.use(
  (config) => {
    // 每次请求前计数器+1
    loadingCount++

    // 只在第一个请求时打开Loading
    if (loadingCount === 1) {
      loadingInstance = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
    }

    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = userStore.token
    }
    return config
  },
  (err) => {
    // 请求错误时也需要减少计数
    loadingCount--
    if (loadingCount === 0 && loadingInstance) {
      loadingInstance.close()
    }
    return Promise.reject(err)
  },
)

instance.interceptors.response.use(
  (res) => {
    // 每次响应后计数器-1
    loadingCount--

    // 当没有请求进行时关闭Loading
    if (loadingCount === 0 && loadingInstance) {
      loadingInstance.close()
    }

    if (res.data.code === 0) {
      return res
    }

    ElMessage.primary(res.data.message || '服务器出错')
    return Promise.reject(res.data)
  },
  (err) => {
    // 响应错误时也要减少计数
    loadingCount--
    if (loadingCount === 0 && loadingInstance) {
      loadingInstance.close()
    }

    if (err.response?.status === 401) {
      router.push('/login')
    }

    ElMessage.primary(err.response?.data?.message || '服务器出错')
    return Promise.reject(err)
  },
)

export default instance
export { baseURL }
