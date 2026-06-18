import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMapStore = defineStore('map', () => {
  const centerOnPoi = ref(null);
  const currentScale = ref(1);
  
  // ========== 路网样式 ==========
  const networkStyle = ref({
    color: '#ff0011',
    width: 6,
    style: 'solid'
  });
  
  // ========== 显隐控制 ==========
  const showPois = ref(true);
  const showPoiLabels = ref(true);
  const showRoutes = ref(false);
  const showNetwork = ref(false);
  const showWaypoints = ref(false);
  
  // ========== POI 类型显隐控制 ==========
  const visiblePoiTypes = ref({
    dormitory: true,
    classroom: true,
    entrance: true,
    canteen: true,
    statue: true,
    clinic: true,
    supermarket: true,
    parking: true,
    toilet: true,
    stadium: true,
    waypoint: false,
    other: true
  });
  
  // ========== 🆕 导航路径 ==========
  const navigationPath = ref([]);      // 导航路径点数组
  const navigationInfo = ref(null);    // 导航信息（距离、起点终点等）
  
  // ========== 方法 ==========
  const setScale = (scale) => {
    currentScale.value = scale;
  };

  const registerCenterOnPoi = (fn) => {
    centerOnPoi.value = fn;
  };
  
  const setNetworkStyle = (style) => {
    networkStyle.value = style;
  };
  
  // POI 控制
  const setShowPois = (visible) => {
    showPois.value = visible;
  };
  
  const toggleShowPois = () => {
    showPois.value = !showPois.value;
  };
  
  const setShowPoiLabels = (visible) => {
    showPoiLabels.value = visible;
  };
  
  const toggleShowPoiLabels = () => {
    showPoiLabels.value = !showPoiLabels.value;
  };
  
  const setShowRoutes = (visible) => {
    showRoutes.value = visible;
  };
  
  const toggleShowRoutes = () => {
    showRoutes.value = !showRoutes.value;
  };
  
  const setShowNetwork = (visible) => {
    showNetwork.value = visible;
  };
  
  const toggleShowNetwork = () => {
    showNetwork.value = !showNetwork.value;
  };
  
  const setShowWaypoints = (visible) => {
    showWaypoints.value = visible;
    visiblePoiTypes.value.waypoint = visible;
  };
  
  const toggleShowWaypoints = () => {
    showWaypoints.value = !showWaypoints.value;
    visiblePoiTypes.value.waypoint = showWaypoints.value;
  };
  
  const setPoiTypeVisible = (type, visible) => {
    if (visiblePoiTypes.value.hasOwnProperty(type)) {
      visiblePoiTypes.value[type] = visible;
      if (type === 'waypoint') {
        showWaypoints.value = visible;
      }
    }
  };
  
  const togglePoiType = (type) => {
    if (visiblePoiTypes.value.hasOwnProperty(type)) {
      visiblePoiTypes.value[type] = !visiblePoiTypes.value[type];
      if (type === 'waypoint') {
        showWaypoints.value = visiblePoiTypes.value[type];
      }
    }
  };
  
  const isPoiTypeVisible = (type) => {
    if (type === 'waypoint') {
      return showWaypoints.value && visiblePoiTypes.value.waypoint;
    }
    return visiblePoiTypes.value[type] !== false;
  };
  
  // 🆕 设置导航路径
  const setNavigationPath = (path) => {
    navigationPath.value = path || [];
  };
  
  // 🆕 设置导航信息
  const setNavigationInfo = (info) => {
    navigationInfo.value = info;
  };
  
  // 🆕 清除导航
  const clearNavigation = () => {
    navigationPath.value = [];
    navigationInfo.value = null;
  };
  
  // 重置所有
  const resetAll = () => {
    showPois.value = true;
    showPoiLabels.value = true;
    showRoutes.value = false;
    showNetwork.value = false;
    showWaypoints.value = false;
    navigationPath.value = [];
    navigationInfo.value = null;
    Object.keys(visiblePoiTypes.value).forEach(key => {
      visiblePoiTypes.value[key] = true;
    });
    visiblePoiTypes.value.waypoint = false;
    networkStyle.value = {
      color: '#ff0011',
      width: 6,
      style: 'solid'
    };
  };

  return {
    // 状态
    centerOnPoi,
    currentScale,
    networkStyle,
    showPois,
    showPoiLabels,
    showRoutes,
    showNetwork,
    showWaypoints,
    visiblePoiTypes,
    navigationPath,      // 🆕 导出
    navigationInfo,      // 🆕 导出
    
    // 方法
    setScale,
    registerCenterOnPoi,
    setNetworkStyle,
    setShowPois,
    toggleShowPois,
    setShowPoiLabels,
    toggleShowPoiLabels,
    setShowRoutes,
    toggleShowRoutes,
    setShowNetwork,
    toggleShowNetwork,
    setShowWaypoints,
    toggleShowWaypoints,
    setPoiTypeVisible,
    togglePoiType,
    isPoiTypeVisible,
    setNavigationPath,   // 🆕 导出
    setNavigationInfo,   // 🆕 导出
    clearNavigation,     // 🆕 导出
    resetAll
  };
});