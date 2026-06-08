<template>
  <!-- 地图容器 -->
  <div 
    class="map-background"
    ref="mapContainer"
    @mousedown.prevent="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @wheel="handleWheel"
    @click="handleMapClick"
  >
    <!-- 地图包装器，用于应用 transform 变换 -->
    <div class="map-wrapper" :style="wrapperStyle">
      <img 
        src="@/assets/img/map_bg.png"
        alt="校园地图"
        class="map-image"
        draggable="false"
        @contextmenu.prevent
      />
      
      <!-- POI 标记点 -->
      <PoiMarker
        v-for="poi in poiStore.pois"
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

    <!-- 悬浮坐标显示卡片 -->
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
import { ref, onMounted } from 'vue'

// 引入 composables
import { useMapTransform } from './composables/useMapTransform'
import { useMapTooltip } from './composables/useMapTooltip'
import { useMapEvents } from './composables/useMapEvents'
import { usePoiHandlers } from './composables/usePoiHandlers'

// 引入 POI Store
import { usePoiStore } from '@/stores/poiStore'
// 引入 POI 数据配置
import { POI_DATA } from '@/data/poiData'
// 引入 POI 标记组件
import PoiMarker from './PoiMarker.vue'

// 地图原始尺寸
const IMAGE_WIDTH = 3000
const IMAGE_HEIGHT = 1600

// 定义组件会触发的事件
const emit = defineEmits(['map-click', 'poi-click', 'poi-hover', 'poi-leave']) 

// 地图容器 DOM 引用
const mapContainer = ref(null)

// 初始化地图变换功能
const mapTransform = useMapTransform({
  IMAGE_WIDTH,
  IMAGE_HEIGHT,
  mapContainerRef: mapContainer
})

// 初始化悬浮坐标卡片功能
const mapTooltip = useMapTooltip({
  mapContainerRef: mapContainer,
  scale: mapTransform.scale,
  offsetX: mapTransform.offsetX,
  offsetY: mapTransform.offsetY
})

// 初始化 POI Store
const poiStore = usePoiStore()

// 初始化地图事件处理
const {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
  handleWheel,
  handleMapClick
} = useMapEvents({
  mapTransform,
  mapTooltip,
  mapContainerRef: mapContainer,
  emit
})

// 初始化 POI 事件处理
const {
  handlePoiClick,
  handlePoiHover,
  handlePoiLeave
} = usePoiHandlers({
  poiStore,
  emit,
  mapTransform
})

// 从解构中获取响应式数据
const { scale, offsetX, offsetY, wrapperStyle } = mapTransform
const { showTooltip, tooltipX, tooltipY, currentMapX, currentMapY } = mapTooltip

// 组件挂载时初始化 POI 数据
onMounted(() => {
  poiStore.addPois(POI_DATA)
})

// 暴露给父组件的接口
defineExpose({ 
  scale, 
  offsetX, 
  offsetY, 
  poiStore 
})
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
