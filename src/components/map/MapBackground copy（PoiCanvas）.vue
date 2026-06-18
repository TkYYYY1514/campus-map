<template>
  <div 
    class="map-background"
    ref="mapContainer"
    @mousedown.prevent="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @wheel="handleWheel"
    @click="handleMapClick"
    @contextmenu.prevent="handleRightClick" 
  >
    <div class="map-wrapper" :style="wrapperStyle">
      <img 
        src="@/assets/img/map_bg.png"
        alt="校园地图"
        class="map-image"
        draggable="false"
        @contextmenu.prevent
      />
      
      <!-- 路线渲染层 -->
      <RouteCanvas 
        :scale="scale"
        :offset-x="offsetX"
        :offset-y="offsetY"
      />
      
      <!-- POI Canvas 渲染层（替代 PoiMarker） -->
      <PoiCanvas
        :scale="scale"
        :offset-x="offsetX"
        :offset-y="offsetY"
        :selected-poi-id="poiStore.selectedPoi?.id"
        @click="handlePoiClick"
        @right-click="handlePoiRightClick"
        @hover="handlePoiHover"
        @leave="handlePoiLeave"
      />
    </div>

    <div 
      v-if="showTooltip" 
      class="coord-tooltip"
      :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
    >
      X: {{ Math.round(currentMapX) }}<br />
      Y: {{ Math.round(currentMapY) }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useMapTransform } from './composables/useMapTransform';
import { useMapTooltip } from './composables/useMapTooltip';
import { useMapEvents } from './composables/useMapEvents';
import { usePoiHandlers } from './composables/usePoiHandlers';
import { usePoiStore } from '@/stores/poiStore';
import { useRouteStore } from '@/stores/routeStore';
import { useRoadNetworkStore } from '@/stores/roadNetworkStore';
import { useMapStore } from '@/stores/mapStore';
import { useNavigationStore } from '@/stores/navigationStore';
import showDialog from '@/components/Dialog/Dialog.js';
import PoiCanvas from './PoiCanvas.vue';
import RouteCanvas from './RouteCanvas.vue';
import WaypointEditor from './dialogs/WaypointEditor.vue';

// 动态导入创建表单组件
let CreatePoiForm = null;

const IMAGE_WIDTH = 3000;
const IMAGE_HEIGHT = 1600;
const emit = defineEmits(['map-click', 'poi-click', 'poi-hover', 'poi-leave', 'scale-change']);
const mapContainer = ref(null);

// 获取当前路由
const route = useRoute();

const mapTransform = useMapTransform({
  IMAGE_WIDTH,
  IMAGE_HEIGHT,
  mapContainerRef: mapContainer
});

const mapTooltip = useMapTooltip({
  mapContainerRef: mapContainer,
  scale: mapTransform.scale,
  offsetX: mapTransform.offsetX,
  offsetY: mapTransform.offsetY
});

const poiStore = usePoiStore();
const routeStore = useRouteStore();
const roadNetworkStore = useRoadNetworkStore();
const mapStore = useMapStore();
const navStore = useNavigationStore();

const routeKey = ref(0);
const selectedWaypoint = ref(null);

const reloadNetwork = async () => {
  await roadNetworkStore.fetchNetwork();
  routeKey.value++;
};

const {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
  handleWheel,
  handleMapClick: originalMapClick,
} = useMapEvents({
  mapTransform,
  mapTooltip,
  mapContainerRef: mapContainer,
  emit
});

const {
  handlePoiClick: originalPoiClick,
  handlePoiHover,
  handlePoiLeave,
  centerOnPoi
} = usePoiHandlers({
  poiStore,
  emit,
  mapTransform
});

// 包装地图点击（清除选中）
const handleMapClick = (event) => {
  poiStore.clearSelection();
  originalMapClick(event);
};

// 包装 POI 点击
const handlePoiClick = async (poi) => {
  poiStore.selectPoi(poi);
  
  if (poi.type === 'waypoint' && isRouteManagementPage()) {
    const rect = mapContainer.value?.getBoundingClientRect();
    const screenX = rect.left + (poi.x * scale.value + offsetX.value);
    const screenY = rect.top + (poi.y * scale.value + offsetY.value);
    
    await showDialog(
      { 
        title: `管理连接 - ${poi.name}`,
        left: screenX - 160,
        top: screenY - 100,
        draggable: true,
        width: 'auto',
        padding: 0,
        cancel: () => {
          poiStore.clearSelection();
        }
      },
      WaypointEditor,
      {
        waypoint: poi,
        onUpdated: async () => {
          await roadNetworkStore.fetchNetwork();
          routeKey.value++;
        },
        onClose: (closeDialog) => {
          poiStore.clearSelection();
          closeDialog();
        }
      },
      'clearSameAndShow'
    );
    return;
  }
  
  originalPoiClick(poi);
};

// 包装 POI 右键
const handlePoiRightClick = (poi, event) => {
  // 模拟右键事件，传递给原有的 handleRightClick
  if (poi) {
    // 创建一个模拟的事件对象
    const fakeEvent = {
      ...event,
      clientX: event.clientX,
      clientY: event.clientY,
      ctrlKey: false,
      metaKey: false
    };
    handleRightClick(fakeEvent);
  }
};

// 注册到全局 store
mapStore.registerCenterOnPoi(centerOnPoi);

// 监听缩放变化
watch(
  () => mapTransform.scale.value,
  (newScale) => {
    emit('scale-change', newScale);
    mapStore.setScale(newScale);
  }
);

const { scale, offsetX, offsetY, wrapperStyle } = mapTransform;
const { showTooltip, tooltipX, tooltipY, currentMapX, currentMapY } = mapTooltip;

// 基础可见 POI
const baseVisiblePois = computed(() => {
  return poiStore.pois.filter(poi => poi.is_visible === 1);
});

// 查找鼠标位置附近的POI（用于右键）
const findPoiAtPosition = (mouseX, mouseY) => {
  const rect = mapContainer.value?.getBoundingClientRect();
  if (!rect) return null;
  
  const mapX = (mouseX - rect.left - offsetX.value) / scale.value;
  const mapY = (mouseY - rect.top - offsetY.value) / scale.value;
  
  const POI_HIT_RADIUS = 30;
  
  return baseVisiblePois.value.find(poi => {
    const dx = poi.x - mapX;
    const dy = poi.y - mapY;
    return Math.sqrt(dx * dx + dy * dy) <= POI_HIT_RADIUS;
  });
};

// 查找最近的路径点（用于自动连接）
const findNearestWaypoint = (x, y, excludeId = null, maxDistance = 150) => {
  const waypoints = poiStore.pois.filter(p => p.type === 'waypoint' && p.id !== excludeId);
  let nearest = null;
  let minDist = maxDistance;
  
  waypoints.forEach(wp => {
    const dist = Math.hypot(wp.x - x, wp.y - y);
    if (dist < minDist) {
      minDist = dist;
      nearest = wp;
    }
  });
  
  return nearest;
};

// 快速创建路径点
const handleQuickCreateWaypoint = async (event) => {
  const rect = mapContainer.value?.getBoundingClientRect();
  if (!rect) return;
  
  const mapX = (event.clientX - rect.left - offsetX.value) / scale.value;
  const mapY = (event.clientY - rect.top - offsetY.value) / scale.value;
  
  try {
    const result = await poiStore.createPoi({
      name: 'temp',
      type: 'waypoint',
      x: Math.round(mapX),
      y: Math.round(mapY),
      description: '',
      is_visible: 1
    });
    
    const newWaypointId = result.data?.id || result.id;
    await poiStore.updatePoi(newWaypointId, { name: `点${newWaypointId}` });
    
    const nearest = findNearestWaypoint(Math.round(mapX), Math.round(mapY), newWaypointId, 150);
    
    if (nearest) {
      await roadNetworkStore.addConnection(newWaypointId, nearest.id);
      await roadNetworkStore.addConnection(nearest.id, newWaypointId);
      ElMessage.success(`路径点 点${newWaypointId} 创建成功，已自动连接到 "${nearest.name}"`);
    } else {
      ElMessage.success(`路径点 点${newWaypointId} 创建成功`);
    }
    
    await poiStore.fetchAllPois();
    await roadNetworkStore.fetchNetwork();
    
  } catch (error) {
    console.error('创建失败:', error);
    ElMessage.error('创建失败');
  }
};

// 判断当前是否在路线管理页面
const isRouteManagementPage = () => {
  const path = route.path;
  return path.includes('/route') || path.includes('/route-management');
};

const isPoiManagementPage = () => {
  const path = route.path;
  return path.includes('/poi') || path.includes('/poi-management') || path.includes('/admin');
};

// 右键点击处理
const handleRightClick = async (event) => {
  // 导航板块处理
  if (navStore.pickMode) {
    const rect = mapContainer.value?.getBoundingClientRect();
    const mapX = (event.clientX - rect.left - offsetX.value) / scale.value;
    const mapY = (event.clientY - rect.top - offsetY.value) / scale.value;
    
    const pois = poiStore.pois.filter(p => p.type !== 'waypoint');
    let nearestPoi = null;
    let minDist = 100;
    
    for (const poi of pois) {
      const dist = Math.hypot(poi.x - mapX, poi.y - mapY);
      if (dist < minDist) {
        minDist = dist;
        nearestPoi = poi;
      }
    }
    
    navStore.setPointFromMap(navStore.pickMode, mapX, mapY, nearestPoi);
    return;
  }

  const isCtrlPressed = event.ctrlKey || event.metaKey;
  
  if (isCtrlPressed && isRouteManagementPage()) {
    await handleQuickCreateWaypoint(event);
    return;
  }
  
  const rect = mapContainer.value?.getBoundingClientRect();
  if (!rect) return;
  
  const mapX = (event.clientX - rect.left - offsetX.value) / scale.value;
  const mapY = (event.clientY - rect.top - offsetY.value) / scale.value;
  
  const position = {
    x: Math.round(mapX),
    y: Math.round(mapY),
    screenX: event.clientX,
    screenY: event.clientY
  };
  
  const isRoutePage = isRouteManagementPage();
  const isPoiPage = isPoiManagementPage();
  
  if (!isRoutePage && !isPoiPage) {
    return;
  }
  
  const clickedPoi = findPoiAtPosition(event.clientX, event.clientY);
  
  if (!CreatePoiForm) {
    const module = await import('./dialogs/CreatePoiForm.vue');
    CreatePoiForm = module.default;
  }
  
  const defaultType = isRoutePage ? 'waypoint' : 'classroom';
  const titlePrefix = isRoutePage ? '路径点' : '点位';
  
  if (clickedPoi) {
    await showDialog(
      { 
        title: `编辑${titlePrefix}`,
        left: position.screenX - 200,
        top: position.screenY - 100,
        draggable: true,
        cancel: () => {
          poiStore.clearSelection();
        }
      },
      CreatePoiForm,
      {
        initialX: clickedPoi.x,
        initialY: clickedPoi.y,
        initialData: clickedPoi,
        onSuccess: async (formData, closeDialog) => {
          try {
            await poiStore.updatePoi(clickedPoi.id, {
              name: formData.name,
              type: formData.type,
              x: formData.x,
              y: formData.y,
              description: formData.description,
              is_visible: clickedPoi.is_visible
            });
            ElMessage.success('更新成功');
            closeDialog();
            poiStore.clearSelection();
            await roadNetworkStore.fetchNetwork();
          } catch (error) {
            ElMessage.error('更新失败');
          }
        },
        onDelete: async (poiData, closeDialog) => {
          try {
            if (poiData.type === 'waypoint') {
              await roadNetworkStore.deleteAllConnectionsForPoint(poiData.id);
            }
            await poiStore.deletePoi(poiData.id);
            ElMessage.success('删除成功');
            closeDialog();
            poiStore.clearSelection();
            await poiStore.fetchAllPois();
            await roadNetworkStore.fetchNetwork();
            await routeStore.fetchAllRoutes();
            routeKey.value++;
          } catch (error) {
            console.error('删除失败:', error);
            ElMessage.error('删除失败');
          }
        }
      },
      'clearSameAndShow'
    );
  } else {
    await showDialog(
      { 
        title: `新增${titlePrefix}`,
        left: position.screenX + 50,
        top: position.screenY - 150,
        draggable: true,
        cancel: () => {
          poiStore.clearSelection();
        }
      },
      CreatePoiForm,
      {
        initialX: position.x,
        initialY: position.y,
        initialType: defaultType,
        onSuccess: async (formData, closeDialog) => {
          try {
            await poiStore.createPoi({
              name: formData.name,
              type: formData.type,
              x: formData.x,
              y: formData.y,
              description: formData.description,
              is_visible: 1
            });
            ElMessage.success('创建成功');
            closeDialog();
            poiStore.clearSelection();
            await routeStore.fetchAllRoutes();
            routeKey.value++;
          } catch (error) {
            ElMessage.error('创建失败');
          }
        }
      },
      'clearSameAndShow'
    );
  }
};

// 加载数据
onMounted(async () => {
  await Promise.all([
    poiStore.fetchAllPois(),
    routeStore.fetchAllRoutes(),
    roadNetworkStore.fetchNetwork()
  ]);
  console.log('加载的 POI 数据:', poiStore.pois);
  console.log('加载的路线数据:', routeStore.routes);
  console.log('加载的路网数据:', roadNetworkStore.connections);
  routeKey.value++;
});

defineExpose({ 
  scale, 
  offsetX, 
  offsetY, 
  poiStore,
  routeStore,
  roadNetworkStore,
  reloadPois: () => poiStore.fetchAllPois(),
  reloadRoutes: () => routeStore.fetchAllRoutes(),
  reloadNetwork,
  centerOnPoi
});
</script>

<style scoped>
.map-background {
  z-index: 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #1a1a2e;
}
.map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 3000px;
  height: 1600px;
  will-change: transform;
}
.map-image {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
}
.coord-tooltip {
  position: fixed;
  z-index: 9999;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 12px;
  line-height: 1.4;
  border-radius: 4px;
  pointer-events: none;
  white-space: nowrap;
}
</style>