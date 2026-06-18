<template>
  <canvas
    ref="canvasRef"
    class="poi-canvas"
    :width="3000"
    :height="1600"
    @click="handleCanvasClick"
    @contextmenu.prevent="handleCanvasContextmenu"
    @mousemove="handleCanvasMousemove"
    @mouseleave="handleCanvasMouseleave"
  />
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { usePoiStore } from '@/stores/poiStore';
import { useMapStore } from '@/stores/mapStore';
import { POI_TYPE_COLORS } from '@/data/poiData';

const props = defineProps({
  scale: { type: Number, default: 1 },
  offsetX: { type: Number, default: 0 },
  offsetY: { type: Number, default: 0 },
  selectedPoiId: { type: Number, default: null }
});

const emit = defineEmits(['click', 'right-click', 'hover', 'leave']);

const canvasRef = ref(null);
const poiStore = usePoiStore();
const mapStore = useMapStore();
const hoveredPoiId = ref(null);

// 获取显示的 POI
const displayPois = computed(() => {
  return poiStore.pois.filter(poi => {
    if (!mapStore.showPois) return false;
    if (poi.is_visible !== 1) return false;
    if (poi.type === 'waypoint') {
      return mapStore.showWaypoints;
    }
    return mapStore.visiblePoiTypes[poi.type] !== false;
  });
});

// 获取类型颜色
const getPoiColor = (type, isSelected, isHovered) => {
  if (isSelected) return '#FFD700';
  if (isHovered) return '#FFAA00';
  if (type === 'waypoint') return '#000000';
  return POI_TYPE_COLORS[type] || '#909399';
};

// 绘制单个 POI
const drawPoi = (ctx, poi, isSelected = false, isHovered = false) => {
  const x = poi.x;
  const y = poi.y;
  const isWaypoint = poi.type === 'waypoint';
  
  if (isWaypoint) {
    const size = isHovered ? 14 : 12;
    ctx.fillStyle = getPoiColor(poi.type, isSelected, isHovered);
    ctx.fillRect(x - size/2, y - size/2, size, size);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - size/2, y - size/2, size, size);
    
    if (mapStore.showPoiLabels && (isSelected || isHovered || mapStore.showPoiLabels)) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px "Microsoft YaHei", sans-serif';
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      const textWidth = ctx.measureText(poi.name).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(x + 8, y - 18, textWidth + 8, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(poi.name, x + 12, y - 8);
    }
  } else {
    let radius = 8;
    if (isSelected) radius = 14;
    else if (isHovered) radius = 14;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = getPoiColor(poi.type, isSelected, isHovered);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    if (mapStore.showPoiLabels && (isSelected || isHovered || mapStore.showPoiLabels)) {
      ctx.font = '12px "Microsoft YaHei", sans-serif';
      const textWidth = ctx.measureText(poi.name).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(x + 8, y - 18, textWidth + 8, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(poi.name, x + 12, y - 8);
    }
  }
};

// 绘制所有 POI
const drawPois = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.shadowBlur = 2;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  
  const pois = displayPois.value;
  
  pois.forEach(poi => {
    const isSelected = poi.id === props.selectedPoiId;
    const isHovered = poi.id === hoveredPoiId.value;
    drawPoi(ctx, poi, isSelected, isHovered);
  });
  
  ctx.shadowBlur = 0;
};

// 转换屏幕坐标到 canvas 坐标
const screenToCanvasCoords = (clientX, clientY) => {
  const canvas = canvasRef.value;
  if (!canvas) return null;
  
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  const canvasX = (clientX - rect.left) * scaleX;
  const canvasY = (clientY - rect.top) * scaleY;
  
  return { x: canvasX, y: canvasY };
};

// 查找鼠标下的 POI
const findPoiAtPosition = (clientX, clientY) => {
  const canvas = canvasRef.value;
  if (!canvas) return null;
  
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  const canvasX = (clientX - rect.left) * scaleX;
  const canvasY = (clientY - rect.top) * scaleY;
  
  const pois = displayPois.value;
  let closest = null;
  let minDist = 25;
  
  for (const poi of pois) {
    const dx = poi.x - canvasX;
    const dy = poi.y - canvasY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const hitRadius = poi.type === 'waypoint' ? 12 : 14;
    
    if (dist < hitRadius && dist < minDist) {
      minDist = dist;
      closest = poi;
    }
  }
  
  return closest;
};

// 点击事件
const handleCanvasClick = (event) => {
  const poi = findPoiAtPosition(event.clientX, event.clientY);
  if (poi) {
    event.stopPropagation();
    emit('click', poi);
  }
};

// 右键事件
const handleCanvasContextmenu = (event) => {
  const poi = findPoiAtPosition(event.clientX, event.clientY);
  emit('right-click', poi, event);
};

// 鼠标移动事件（动态光标）
const handleCanvasMousemove = (event) => {
  const poi = findPoiAtPosition(event.clientX, event.clientY);
  const newHoverId = poi?.id || null;
  
  // 动态改变光标样式
  if (newHoverId) {
    canvasRef.value.style.cursor = 'pointer';
  } else {
    canvasRef.value.style.cursor = 'default';
  }
  
  if (newHoverId !== hoveredPoiId.value) {
    if (hoveredPoiId.value) {
      emit('leave', null);
    }
    hoveredPoiId.value = newHoverId;
    if (newHoverId) {
      emit('hover', poi);
    }
    drawPois();
  }
};

// 鼠标离开画布（重置光标）
const handleCanvasMouseleave = () => {
  canvasRef.value.style.cursor = 'default';
  
  if (hoveredPoiId.value) {
    emit('leave', null);
    hoveredPoiId.value = null;
    drawPois();
  }
};

// 监听变化重绘
watch(
  () => [
    displayPois.value,
    mapStore.showPoiLabels,
    props.selectedPoiId,
    props.scale,
    props.offsetX,
    props.offsetY
  ],
  () => {
    drawPois();
  },
  { deep: true }
);

onMounted(() => {
  drawPois();
});
</script>

<style scoped>
.poi-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 3000px;
  height: 1600px;
  pointer-events: auto;
  z-index: 4;
  /* cursor 由 JS 动态控制 */
}
</style>