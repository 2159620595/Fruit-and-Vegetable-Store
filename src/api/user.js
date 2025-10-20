import request from '@/utils/request'

// 注册请求
export const userRegisterService = ({
  username,
  password,
  confirm_password,
  phone,
  verification_code,
}) =>
  request.post('/auth/register', {
    username,
    password,
    confirm_password,
    phone,
    verification_code,
  })

// 登录请求
export const userLoginService = ({ username, password }) =>
  request.post('/auth/login', { username, password })

// 获取用户信息
export const getUserProfileService = () => request.get('/user/profile')

// 更新用户头像（使用base64）
export const updateAvatarService = async formData => {
  // 将文件转换为base64
  const file = formData.get('avatar')

  // 检查文件大小（压缩后应该很小）
  const fileSizeKB = file.size / 1024
  console.log(`上传文件大小: ${fileSizeKB.toFixed(2)}KB`)

  if (fileSizeKB > 500) {
    console.warn('文件可能仍然较大，建议进一步压缩')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async e => {
      try {
        const base64Data = e.target.result
        console.log(
          `Base64 数据大小: ${(base64Data.length / 1024).toFixed(2)}KB`
        )

        const response = await request.put('/user/profile', {
          avatar: base64Data,
        })
        resolve(response)
      } catch (error) {
        console.error('头像上传API错误:', error)
        reject(error)
      }
    }
    reader.onerror = error => {
      console.error('文件读取错误:', error)
      reject(error)
    }
    reader.readAsDataURL(file)
  })
}

// 更新用户信息
export const updateUserProfileService = data =>
  request.put('/user/profile', data)

// 修改密码
export const changePasswordService = ({ currentPassword, newPassword }) =>
  request.put('/user/change-password', {
    old_password: currentPassword,
    new_password: newPassword,
    confirm_password: newPassword,
  })
