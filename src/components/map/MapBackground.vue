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
      
      <PoiMarker
        v-for="poi in visiblePois"
        :key="poi.id"
        :poi="poi"
        :scale="scale"
        :isActive="poiStore.selectedPoi?.id === poi.id"
        :showLabel="true"
        @click="handlePoiClick"
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
import { ref, onMounted, computed ,provide } from 'vue';
import { useMapTransform } from './composables/useMapTransform';
import { useMapTooltip } from './composables/useMapTooltip';
import { useMapEvents } from './composables/useMapEvents';
import { usePoiHandlers } from './composables/usePoiHandlers';
import { usePoiStore } from '@/stores/poiStore';
import { ElMessage } from 'element-plus';
import showDialog from '@/components/Dialog/Dialog.js';
import PoiMarker from './PoiMarker.vue';

// 动态导入创建表单组件
let CreatePoiForm = null;

const IMAGE_WIDTH = 3000;
const IMAGE_HEIGHT = 1600;
const emit = defineEmits(['map-click', 'poi-click', 'poi-hover', 'poi-leave']);
const mapContainer = ref(null);

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

const {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
  handleWheel,
  handleMapClick,
     
} = useMapEvents({
  mapTransform,
  mapTooltip,
  mapContainerRef: mapContainer,
  emit
});



const {
  handlePoiClick,
  handlePoiHover,
  handlePoiLeave,
  centerOnPoi
} = usePoiHandlers({
  poiStore,
  emit,
  mapTransform
});

provide('centerOnPoi', centerOnPoi);

const { scale, offsetX, offsetY, wrapperStyle } = mapTransform;
const { showTooltip, tooltipX, tooltipY, currentMapX, currentMapY } = mapTooltip;

// 只显示可见的点位（is_visible === 1）
const visiblePois = computed(() => {
  return poiStore.pois.filter(poi => poi.is_visible === 1);
});

// 右键点击处理 - 打开创建点位弹窗
const handleRightClick = async (event) => {
  const rect = mapContainer.value?.getBoundingClientRect();
  if (!rect) return;
  
  // 计算地图坐标
  const mapX = (event.clientX - rect.left - offsetX.value) / scale.value;
  const mapY = (event.clientY - rect.top - offsetY.value) / scale.value;
  
  const position = {
    x: Math.round(mapX),
    y: Math.round(mapY),
    screenX: event.clientX,
    screenY: event.clientY
  };
  
  // 动态导入表单组件
  if (!CreatePoiForm) {
    const module = await import('./CreatePoiForm.vue');
    CreatePoiForm = module.default;
  }
  
  // 打开弹窗
  await showDialog(
    { 
      title: '新增点位',
      left: position.screenX - 200,
      top: position.screenY - 100,
      draggable: true
    },
    CreatePoiForm,
    {
      initialX: position.x,
      initialY: position.y,
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
          closeDialog();  // 关闭弹窗
        } catch (error) {
          ElMessage.error('创建失败');
        }
      }
    },
    'clearSameAndShow'
  );
};

// 加载数据
onMounted(async () => {
  await poiStore.fetchAllPois();
  console.log('加载的 POI 数据:', JSON.parse(JSON.stringify(poiStore.pois)));
});


defineExpose({ 
  scale, 
  offsetX, 
  offsetY, 
  poiStore,
  reloadPois: () => poiStore.fetchAllPois(),
  centerOnPoi   // ⭐ 关键：暴露这个方法
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