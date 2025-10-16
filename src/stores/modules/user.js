import { defineStore } from 'pinia'
import { ref } from 'vue'
// import { userGetInfService } from '@/api/user'
// 用户模块 token setToken removeToken
export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    // 获取token
    const setToken = (newToken) => {
      token.value = newToken
    }
    // 删除token
    const removeToken = () => {
      token.value = ''
    }
    // 获取个人信息
    const user = ref({})
    const getUser = async () => {
      const res = await userGetInfService() // 请求获取数据
      user.value = res.data.data
    }
    const setUset = (obj) => {
      user.value = obj
    }
    return {
      token,
      setToken,
      removeToken,
      user,
      getUser,
      setUset,
    }
  },
  {
    persist: true,
  },
)
