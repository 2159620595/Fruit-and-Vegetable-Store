import request from '@/utils/request'

// 获取地址列表
export const getAddressList = () => {
  return request.get('/addresses')
}

// 添加地址
export const createAddress = data => {
  return request.post('/addresses', data)
}

// 更新地址
export const updateAddress = (id, data) => {
  return request.put(`/addresses/${id}`, data)
}

// 删除地址
export const deleteAddress = id => {
  return request.delete(`/addresses/${id}`)
}

// ⚠️ 注意：后端暂未实现设置默认地址和省市区数据接口
// 可以通过更新地址的is_default字段来设置默认地址
export const setDefaultAddress = id => {
  return request.put(`/addresses/${id}`, { is_default: true })
}

// 省市区数据使用前端本地数据（src/data/regions.js）
export const getRegionData = () => {
  // 返回前端本地数据，不调用后端
  return Promise.resolve({
    data: {
      message: '请使用本地regions.js数据',
    },
  })
}
