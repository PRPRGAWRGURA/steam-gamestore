// 缓存工具函数

/**
 * 设置缓存
 * @param {string} key - 缓存键
 * @param {any} data - 缓存数据
 * @param {number} expireTime - 过期时间（毫秒）
 */
export const setCache = (key, data, expireTime) => {
  const cacheData = {
    data,
    expire: Date.now() + expireTime
  }
  localStorage.setItem(key, JSON.stringify(cacheData))
}

/**
 * 获取缓存
 * @param {string} key - 缓存键
 * @returns {any|null} 缓存数据，如果过期或不存在则返回null
 */
export const getCache = (key) => {
  const cacheStr = localStorage.getItem(key)
  if (!cacheStr) return null
  
  try {
    const cacheData = JSON.parse(cacheStr)
    if (Date.now() > cacheData.expire) {
      // 缓存过期，删除它
      localStorage.removeItem(key)
      return null
    }
    return cacheData.data
  } catch (error) {
    console.error('解析缓存数据失败:', error)
    localStorage.removeItem(key)
    return null
  }
}

/**
 * 删除缓存
 * @param {string} key - 缓存键
 */
export const removeCache = (key) => {
  localStorage.removeItem(key)
}

/**
 * 清空所有缓存
 */
export const clearAllCache = () => {
  localStorage.clear()
}

/**
 * 从缓存列表中移除指定ID的项
 * @param {string} listKey - 列表缓存键
 * @param {string} itemId - 要移除的项ID
 * @param {number} expireTime - 过期时间（毫秒）
 */
export const removeItemFromListCache = (listKey, itemId, expireTime) => {
  const listData = getCache(listKey)
  if (listData && Array.isArray(listData)) {
    const updatedList = listData.filter(item => item.id !== itemId)
    setCache(listKey, updatedList, expireTime)
  }
}
