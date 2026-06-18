import { defineStore } from 'pinia';
import { ref } from 'vue';
import poiService from '@/api/poiService';

export const usePoiStore = defineStore('poi', () => {
  const pois = ref([]);
  const selectedPoi = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // 获取所有 POI
  const fetchAllPois = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await poiService.getList();
      pois.value = data;
      return data;
    } catch (err) {
      error.value = err.message || '加载失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 搜索 POI
  const searchPois = async (keyword) => {
    isLoading.value = true;
    try {
      const data = await poiService.search(keyword);
      pois.value = data;
      return data;
    } catch (err) {
      error.value = err.message || '搜索失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 创建 POI
  const createPoi = async (poiData) => {
    const result = await poiService.create(poiData);
    if (result.data) {
      pois.value.push(result.data);
    }
    return result;
  };

  // 更新 POI
  const updatePoi = async (id, updates) => {
    const result = await poiService.update(id, updates);
    if (result.data) {
      const index = pois.value.findIndex(p => p.id === id);
      if (index !== -1) pois.value[index] = result.data;
      if (selectedPoi.value?.id === id) selectedPoi.value = result.data;
    }
    return result;
  };

  // 删除 POI
  const deletePoi = async (id) => {
    const result = await poiService.delete(id);
    pois.value = pois.value.filter(p => p.id !== id);
    if (selectedPoi.value?.id === id) selectedPoi.value = null;
    return result;
  };

  // 切换可见性
  const toggleVisibility = (id, isVisible) => {
    return updatePoi(id, { is_visible: isVisible ? 1 : 0 });
  };

  // 选中 POI
  const selectPoi = (poi) => {
    selectedPoi.value = poi;
  };

  // 清除选中
  const clearSelection = () => {
    selectedPoi.value = null;
  };

  return {
    pois,
    selectedPoi,
    isLoading,
    error,
    fetchAllPois,
    searchPois,
    createPoi,
    updatePoi,
    deletePoi,
    toggleVisibility,
    selectPoi,
    clearSelection
  };
});