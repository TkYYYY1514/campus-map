<template>
  <canvas
    ref="canvasRef"
    class="route-canvas"
    :width="3000"
    :height="1600"
  />
</template>

<script setup>
import { ref, watch, onMounted, computed, onUnmounted } from 'vue';
import { useRouteStore } from '@/stores/routeStore';
import { usePoiStore } from '@/stores/poiStore';
import { useRoadNetworkStore } from '@/stores/roadNetworkStore';
import { useMapStore } from '@/stores/mapStore';
import { useIconStore } from '@/stores/iconStore';
import { useNavigationStore } from '@/stores/navigationStore';

const props = defineProps({
  scale: { type: Number, default: 1 },
  offsetX: { type: Number, default: 0 },
  offsetY: { type: Number, default: 0 },
  showNodes: { type: Boolean, default: false }
});

const canvasRef = ref(null);
const routeStore = useRouteStore();
const poiStore = usePoiStore();
const roadNetworkStore = useRoadNetworkStore();
const mapStore = useMapStore();
const iconStore = useIconStore();
const navigationStore = useNavigationStore();

// 数据就绪标志
let isDataReady = false;

// 动画相关
let animationId = null;
let flowOffset = 0;
const FLOW_SPEED = 2;
const ELEMENT_SPACING = 50;

// 缓存 POI Map
let poiMap = new Map();

const updatePoiMap = () => {
  poiMap.clear();
  if (poiStore.pois && poiStore.pois.length > 0) {
    poiStore.pois.forEach(poi => {
      poiMap.set(poi.id, poi);
    });
    return true;
  }
  return false;
};

// 路线缓存
let routePointsCache = new Map();

const updateRoutePointsCache = () => {
  routePointsCache.clear();
  const activeRoutes = routeStore.routes?.filter(r => r.is_active === 1) || [];
  
  activeRoutes.forEach(route => {
    const points = [];
    if (route.nodes) {
      route.nodes.forEach(node => {
        const poi = poiMap.get(node.poi_id);
        if (poi) {
          points.push({ x: poi.x, y: poi.y });
        }
      });
    }
    routePointsCache.set(route.id, { points, route });
  });
};

const canvasStyle = computed(() => ({
  transform: `translate(${props.offsetX}px, ${props.offsetY}px) scale(${props.scale})`,
  transformOrigin: '0 0'
}));

// 绘制路网
const drawRoadNetwork = (ctx) => {
  if (!mapStore.showNetwork) return;
  
  const connections = roadNetworkStore.connections;
  if (!connections || connections.length === 0) return;
  
  const style = mapStore.networkStyle;
  
  ctx.beginPath();
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.width;
  
  if (style.style === 'dashed') {
    ctx.setLineDash([10, 5]);
  } else if (style.style === 'dotted') {
    ctx.setLineDash([2, 4]);
  } else {
    ctx.setLineDash([]);
  }
  
  let hasLine = false;
  for (const conn of connections) {
    const from = poiMap.get(conn.from_poi_id);
    const to = poiMap.get(conn.to_poi_id);
    if (from && to) {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      hasLine = true;
    }
  }
  
  if (hasLine) {
    ctx.stroke();
  }
};

// 绘制单条路线
const drawSingleRoute = (ctx, route, points, isSelected = false) => {
  if (!points || points.length < 2) return;
  
  ctx.beginPath();
  
  if (isSelected) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 8;
    ctx.setLineDash([]);
  } else {
    ctx.strokeStyle = route.color;
    ctx.lineWidth = route.width;
    
    if (route.style === 'dashed') {
      ctx.setLineDash([10, 5]);
    } else if (route.style === 'dotted') {
      ctx.setLineDash([2, 4]);
    } else {
      ctx.setLineDash([]);
    }
  }
  
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
};

// 绘制所有路线
const drawRoutes = (ctx) => {
  if (!mapStore.showRoutes) return;
  
  const selectedRouteId = routeStore.selectedRouteId;
  
  for (const [id, { points, route }] of routePointsCache) {
    if (id !== selectedRouteId) {
      drawSingleRoute(ctx, route, points, false);
    }
  }
  
  if (selectedRouteId && routePointsCache.has(selectedRouteId)) {
    const { points, route } = routePointsCache.get(selectedRouteId);
    drawSingleRoute(ctx, route, points, true);
  }
};

// ========== Canvas 绘制的导航图标 ==========

// 绘制箭头
const drawArrow = (ctx, x, y, angle) => {
  const size = 10;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size, -size / 1.5);
  ctx.lineTo(-size, size / 1.5);
  ctx.closePath();
  ctx.fillStyle = '#FF4444';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
};

// 绘制圆形
const drawCircle = (ctx, x, y) => {
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, 2 * Math.PI);
  ctx.fillStyle = '#FF4444';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();
};

// 绘制小车
const drawCar = (ctx, x, y, angle) => {
  const size = 10;
  ctx.save();
  ctx.translate(x, y);
  
  const shouldFlip = Math.abs(angle) > Math.PI / 2;
  if (shouldFlip) {
    ctx.scale(-1, 1);
  }

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(-size * 1.2, size * 0.5);
  ctx.lineTo(size * 1.2, size * 0.5);
  ctx.quadraticCurveTo(size * 1.6, size * 0.5, size * 1.4, -size * 0.1);
  ctx.lineTo(size * 0.8, -size * 0.3);
  ctx.lineTo(-size * 0.6, -size * 0.3);
  ctx.lineTo(-size * 1.2, size * 0.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-size * 0.4, -size * 0.3);
  ctx.lineTo(size * 0.6, -size * 0.3);
  ctx.lineTo(size * 0.9, size * 0.0);
  ctx.lineTo(-size * 0.4, size * 0.0);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(size * 0.7, size * 0.5, 2.5, 0, 2 * Math.PI);
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-size * 0.7, size * 0.5, 2.5, 0, 2 * Math.PI);
  ctx.fill();

  ctx.restore();
};

// 绘制单车
const drawBike = (ctx, x, y, angle) => {
  const size = 10;
  ctx.save();
  ctx.translate(x, y);
  
  const shouldFlip = Math.abs(angle) > Math.PI / 2;
  if (shouldFlip) {
    ctx.scale(-1, 1);
  }

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.arc(-size, 0, 5, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size, 0, 5, 0, 2 * Math.PI);
  ctx.stroke();

  const rearAxle = { x: -size, y: 0 };
  const frontAxle = { x: size, y: 0 };
  const bottomBracket = { x: -1, y: 0 };
  const seatPostTop = { x: -3, y: -9 };
  const headTubeTop = { x: 6, y: -9 };

  ctx.beginPath();
  ctx.moveTo(rearAxle.x, rearAxle.y);
  ctx.lineTo(bottomBracket.x, bottomBracket.y);
  ctx.lineTo(seatPostTop.x, seatPostTop.y);
  ctx.lineTo(rearAxle.x, rearAxle.y);
  ctx.moveTo(bottomBracket.x, bottomBracket.y);
  ctx.lineTo(headTubeTop.x, headTubeTop.y);
  ctx.lineTo(seatPostTop.x, seatPostTop.y);
  ctx.moveTo(headTubeTop.x, headTubeTop.y);
  ctx.quadraticCurveTo(7, -3, frontAxle.x, frontAxle.y);
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(seatPostTop.x - 1, seatPostTop.y, 4, 2, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(headTubeTop.x, headTubeTop.y);
  ctx.lineTo(headTubeTop.x + 1, headTubeTop.y - 3);
  ctx.lineTo(headTubeTop.x - 2, headTubeTop.y - 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(bottomBracket.x, bottomBracket.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = '#000000';
  ctx.fill();

  ctx.restore();
};

// 绘制小人
const drawPerson = (ctx, x, y, angle) => {
  const size = 10;
  ctx.save();
  ctx.translate(x, y);
  
  const shouldFlip = Math.abs(angle) > Math.PI / 2;
  if (shouldFlip) {
    ctx.scale(-1, 1);
  }

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 头部
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(0, -size * 1.5, 3, 0, 2 * Math.PI);
  ctx.fill();

  // 身体
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.2);
  ctx.lineTo(0, -size * 0.2);
  ctx.stroke();

  // 手臂
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.9);
  ctx.lineTo(-4, -size * 0.3);
  ctx.moveTo(0, -size * 0.9);
  ctx.lineTo(4, -size * 0.3);
  ctx.stroke();

  // 腿
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(-4, size * 0.6);
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(4, size * 0.6);
  ctx.stroke();

  ctx.restore();
};

// 根据类型绘制流动元素
const drawFlowElement = (ctx, x, y, angle) => {
  const type = iconStore.navIconType;
  
  switch (type) {
    case 'none':
      break;
    case 'arrow':
      drawArrow(ctx, x, y, angle);
      break;
    case 'circle':
      drawCircle(ctx, x, y);
      break;
    case 'car':
      drawCar(ctx, x, y, angle);
      break;
    case 'bike':
      drawBike(ctx, x, y, angle);
      break;
    case 'person':
      drawPerson(ctx, x, y, angle);
      break;
    default:
      drawArrow(ctx, x, y, angle);
  }
};

// ========== 导航路径绘制（修改版：导航模式下只显示一个小人） ==========
const drawNavigationPath = (ctx) => {
  const navigationPath = mapStore.navigationPath;
  if (!navigationPath || navigationPath.length < 2) return;
  
  // 1. 绘制导航线（虚线样式）
  ctx.beginPath();
  ctx.strokeStyle = '#FF4444';
  ctx.lineWidth = 6;
  ctx.setLineDash([8, 8]);
  
  ctx.moveTo(navigationPath[0].x, navigationPath[0].y);
  for (let i = 1; i < navigationPath.length; i++) {
    ctx.lineTo(navigationPath[i].x, navigationPath[i].y);
  }
  ctx.stroke();
  
  // 重置虚线
  ctx.setLineDash([]);
  
  // 2. 计算路径分段信息
  const segments = [];
  let totalLength = 0;
  
  for (let i = 0; i < navigationPath.length - 1; i++) {
    const from = navigationPath[i];
    const to = navigationPath[i + 1];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    segments.push({
      from, to, dx, dy, length, angle,
      startDist: totalLength,
      endDist: totalLength + length
    });
    totalLength += length;
  }
  
  if (totalLength === 0) return;
  
  // 3. 根据导航模式决定绘制方式
  const isNavigating = navigationStore.isNavigating;
  const navigationProgress = navigationStore.navigationProgress;
  
  if (isNavigating) {
    // 导航模式：只在进度位置绘制一个小人
    const targetDist = navigationProgress * totalLength;
    
    for (const seg of segments) {
      if (targetDist >= seg.startDist && targetDist <= seg.endDist) {
        const t = (targetDist - seg.startDist) / seg.length;
        const x = seg.from.x + seg.dx * t;
        const y = seg.from.y + seg.dy * t;
        
        // 绘制小人
        drawPerson(ctx, x, y, seg.angle);
        break;
      }
    }
  } else {
    // 非导航模式：绘制循环流动元素
    const currentOffset = flowOffset % totalLength;
    const elementCount = Math.ceil(totalLength / ELEMENT_SPACING);
    
    for (let i = 0; i < elementCount; i++) {
      let pos = (currentOffset + i * ELEMENT_SPACING) % totalLength;
      
      for (const seg of segments) {
        if (pos >= seg.startDist && pos <= seg.endDist) {
          const t = (pos - seg.startDist) / seg.length;
          const x = seg.from.x + seg.dx * t;
          const y = seg.from.y + seg.dy * t;
          
          drawFlowElement(ctx, x, y, seg.angle);
          break;
        }
      }
    }
  }
  
  // 4. 起点标记（绿色）
  const start = navigationPath[0];
  ctx.beginPath();
  ctx.arc(start.x, start.y, 12, 0, 2 * Math.PI);
  ctx.fillStyle = '#00AA00';
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('起', start.x, start.y);
  
  // 5. 终点标记（红色）
  const end = navigationPath[navigationPath.length - 1];
  ctx.beginPath();
  ctx.arc(end.x, end.y, 12, 0, 2 * Math.PI);
  ctx.fillStyle = '#FF0000';
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.fillText('终', end.x, end.y);
};

// 主绘制函数
const draw = () => {
  if (!isDataReady) return;
  
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  drawRoadNetwork(ctx);
  drawRoutes(ctx);
  drawNavigationPath(ctx);
};

// 动画循环
const animate = () => {
  flowOffset += FLOW_SPEED;
  draw();
  animationId = requestAnimationFrame(animate);
};

// 刷新所有数据
const refreshAll = () => {
  const hasPoi = updatePoiMap();
  if (hasPoi) {
    updateRoutePointsCache();
    isDataReady = true;
    draw();
  }
};

// 监听数据变化
watch(() => poiStore.pois, () => {
  refreshAll();
}, { deep: true, immediate: true });

watch(() => routeStore.routes, () => {
  if (isDataReady) {
    updateRoutePointsCache();
    draw();
  }
}, { deep: true });

watch(() => roadNetworkStore.connections, () => {
  if (isDataReady) draw();
}, { deep: true });

watch(() => mapStore.networkStyle, () => {
  if (isDataReady) draw();
}, { deep: true });

watch(() => mapStore.showNetwork, () => {
  if (isDataReady) draw();
});

watch(() => mapStore.showRoutes, () => {
  if (isDataReady) draw();
});

watch(() => routeStore.selectedRouteId, () => {
  if (isDataReady) draw();
});

watch(() => mapStore.navigationPath, () => {
  if (isDataReady) draw();
}, { deep: true });

watch(() => props.scale, () => {
  if (isDataReady) draw();
});

watch(() => props.offsetX, () => {
  if (isDataReady) draw();
});

watch(() => props.offsetY, () => {
  if (isDataReady) draw();
});

watch(() => iconStore.navIconType, () => {
  if (isDataReady) draw();
});

// 监听导航状态变化，重新绘制
watch(() => navigationStore.isNavigating, () => {
  if (isDataReady) draw();
});

watch(() => navigationStore.navigationProgress, () => {
  if (isDataReady) draw();
});

// 启动动画
onMounted(() => {
  setTimeout(() => {
    refreshAll();
    animate();
  }, 100);
});

// 清理动画
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
});
</script>

<style scoped>
.route-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 3000px;
  height: 1600px;
  pointer-events: none;
  z-index: 3;
}
</style>