import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * POI（兴趣点）管理 Store
 * 使用 Pinia 进行状态管理，便于后续对接后端 API
 */
export const usePoiStore = defineStore('poi', () => {
  // POI 列表
  const pois = ref([])
  // 当前选中的 POI
  const selectedPoi = ref(null)
  // 加载状态
  const isLoading = ref(false)
  // 错误信息
  const error = ref(null)

  /**
   * 添加 POI
   * @param {Object} poi - POI 对象，需包含 id、x、y、name、type 等属性
   */
  const addPoi = (poi) => {
    pois.value.push(poi)
  }

  /**
   * 批量添加 POI
   * @param {Array} poiList - POI 数组
   */
  const addPois = (poiList) => {
    pois.value = [...pois.value, ...poiList]
  }

  /**
   * 删除 POI
   * @param {string|number} poiId - POI 的唯一标识
   */
  const removePoi = (poiId) => {
    pois.value = pois.value.filter(p => p.id !== poiId)
    // 如果删除的是当前选中的 POI，清除选中状态
    if (selectedPoi.value?.id === poiId) {
      selectedPoi.value = null
    }
  }

  /**
   * 更新 POI
   * @param {string|number} poiId - POI 的唯一标识
   * @param {Object} updates - 需要更新的属性
   */
  const updatePoi = (poiId, updates) => {
    const index = pois.value.findIndex(p => p.id === poiId)
    if (index !== -1) {
      pois.value[index] = { ...pois.value[index], ...updates }
    }
  }

  /**
   * 选中 POI
   * @param {Object|null} poi - 要选中的 POI 对象，传 null 则取消选中
   */
  const selectPoi = (poi) => {
    selectedPoi.value = poi
  }

  /**
   * 清除选中状态
   */
  const clearSelection = () => {
    selectedPoi.value = null
  }

  /**
   * 清空所有 POI
   */
  const clearPois = () => {
    pois.value = []
    selectedPoi.value = null
  }

  /**
   * 从后端加载 POI 数据（预留接口）
   * @param {Function} apiFunc - API 获取函数
   * @returns {Promise} 加载结果
   */
  const fetchPois = async (apiFunc) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await apiFunc()
      pois.value = data
      return data
    } catch (err) {
      error.value = err.message || '加载 POI 数据失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 根据 ID 查找 POI
   * @param {string|number} poiId - POI 的唯一标识
   * @returns {Object|null} POI 对象
   */
  const getPoiById = (poiId) => {
    return pois.value.find(p => p.id === poiId) || null
  }

  /**
   * 根据类型筛选 POI
   * @param {string} type - POI 类型
   * @returns {Array} 筛选后的 POI 数组
   */
  const getPoisByType = (type) => {
    return pois.value.filter(p => p.type === type)
  }

  return {
    pois,
    selectedPoi,
    isLoading,
    error,
    addPoi,
    addPois,
    removePoi,
    updatePoi,
    selectPoi,
    clearSelection,
    clearPois,
    fetchPois,
    getPoiById,
    getPoisByType
  }
})