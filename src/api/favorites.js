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

// 批量删除收藏
export const batchRemoveFavorites = productIds => {
  return request.delete('/favorites/batch', {
    data: {
      product_ids: productIds,
    },
  })
}

// 清空所有收藏
export const clearAllFavorites = () => {
  return request.delete('/favorites/clear')
}

// 检查商品是否已收藏
export const checkFavoriteStatus = productId => {
  return request.get(`/favorites/check/${productId}`)
}

// 获取收藏数量
export const getFavoritesCount = () => {
  return request.get('/favorites/count')
}
