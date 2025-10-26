import request from '@/utils/request'

// 获取收藏列表
export const getFavoritesList = (params = {}) => {
  return request.get('/favorites', {
    params: {
      page: params.page || 1,
      limit: params.limit || 20,
      ...params,
    },
  })
}

// 切换收藏状态（添加或取消）
export const toggleFavorite = productId => {
  return request.post('/favorites', {
    product_id: productId,
  })
}

// 添加收藏（兼容性保留）
export const addToFavorites = productId => {
  return request.post('/favorites', {
    product_id: productId,
  })
}

// 取消收藏（兼容性保留）
export const removeFromFavorites = productId => {
  return request.post('/favorites', {
    product_id: productId,
  })
}

// ⚠️ 注意：以下接口后端暂未实现，使用前端逻辑处理

// 批量删除收藏（通过多次调用toggleFavorite实现）
export const batchRemoveFavorites = async productIds => {
  try {
    const promises = productIds.map(id => toggleFavorite(id))
    await Promise.all(promises)
    return { data: { message: '批量删除成功', success: true } }
  } catch (error) {
    console.error('批量删除失败:', error)
    throw error
  }
}

// 清空所有收藏（通过获取列表后批量删除实现）
export const clearAllFavorites = async () => {
  try {
    const response = await getFavoritesList()
    // 后端返回的数据结构是 {data: {products: [...], total: ...}}
    const products = response.data.data?.products || []
    const productIds = products.map(item => item.id)
    
    if (productIds.length > 0) {
      await batchRemoveFavorites(productIds)
    }
    
    return { data: { message: '已清空所有收藏', success: true } }
  } catch (error) {
    console.error('清空收藏失败:', error)
    throw error
  }
}

// 检查商品是否已收藏（通过获取列表判断）
export const checkFavoriteStatus = async productId => {
  try {
    const response = await getFavoritesList()
    const products = response.data.data?.products || []
    const isFavorited = products.some(item => item.id === productId)
    return { data: { is_favorited: isFavorited } }
  } catch {
    return { data: { is_favorited: false } }
  }
}

// 获取收藏数量（通过获取列表计算）
export const getFavoritesCount = async () => {
  try {
    const response = await getFavoritesList()
    const count = response.data.data?.total || 0
    return { data: { count } }
  } catch {
    return { data: { count: 0 } }
  }
}
