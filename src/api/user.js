import axios from 'axios'

const request = axios.create({
  baseURL: 'https://xingyunfeicui.xyz/api',
})

// 注册请求
export const userRegisterService = ({ username, password, phone }) =>
  request.post('/auth/register', { username, password, phone })

// 登录请求
export const userLoginService = ({ username, password }) =>
  request.post('/auth/login', { username, password })
