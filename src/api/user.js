import request from '@/utils/request'

// 注册请求
export const userRegisterService = ({
  username,
  password,
  confirm_password,
  phone,
  verification_code,
}) =>
  request.post('/auth/register', { username, password, confirm_password, phone, verification_code })

// 登录请求
export const userLoginService = ({ username, password }) =>
  request.post('/auth/login', { username, password })

// 获取用户信息
export const getUserProfileService = () => request.get('/user/profile')
