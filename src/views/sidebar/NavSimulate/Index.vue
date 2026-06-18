<template>
  <div class="nav-simulate">
    <div class="header">
      <h5>路线规划</h5>
      <div class="header-tip">
        <el-tooltip content="右键地图可快速设置起点/终点" placement="left">
          <el-button size="small" text class="tip-btn">?</el-button>
        </el-tooltip>
      </div>
    </div>

    <PointSelector
      ref="pointSelectorRef"
      :pick-mode="navStore.pickMode"
      @update:start="handleStartUpdate"
      @update:end="handleEndUpdate"
      @pick-mode="handlePickMode"
    />

    <SelectedInfo
      :start-name="navStore.startPoint.name"
      :end-name="navStore.endPoint.name"
      @clear-start="clearStart"
      @clear-end="clearEnd"
    />

    <div class="nav-actions">
      <el-button
        type="primary"
        size="default"
        :disabled="!navStore.canNavigate"
        :loading="loading"
        class="nav-btn"
        @click="calculateRoute"
      >
        规划路线
      </el-button>
      
      <el-button
        size="default"
        :disabled="!hasRoute"
        class="clear-btn"
        @click="clearRoute"
      >
        关闭路线
      </el-button>
    </div>

    <el-button
      v-if="hasRoute && !navStore.isNavigating"
      type="success"
      size="default"
      class="simulate-btn"
      :loading="navLoading"
      @click="startNavigationSimulation"
    >
      一键导航
    </el-button>

    <div v-if="navStore.isNavigating" class="navigation-status">
      <div class="status-content">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>{{ navStore.isPaused ? '已暂停' : '导航模拟中...' }}</span>
        <div class="nav-buttons">
          <el-button 
            v-if="!navStore.isPaused" 
            size="small" 
            type="warning" 
            plain 
            @click="pauseNavigation"
          >
            暂停
          </el-button>
          <el-button 
            v-if="navStore.isPaused" 
            size="small" 
            type="success" 
            plain 
            @click="resumeNavigation"
          >
            继续
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            plain 
            @click="stopNavigation"
          >
            结束
          </el-button>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (navStore.navigationProgress * 100) + '%' }"></div>
      </div>
    </div>

    <RouteList
      :routes="routesList"
      :selected-index="selectedRouteIndex"
      @select="selectRoute"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { usePoiStore } from '@/stores/poiStore';
import { useMapStore } from '@/stores/mapStore';
import { useNavigationStore } from '@/stores/navigationStore';
import roadNetworkService from '@/api/roadNetworkService';
import PointSelector from './components/PointSelector.vue';
import SelectedInfo from './components/SelectedInfo.vue';
import RouteList from './components/RouteList.vue';

const poiStore = usePoiStore();
const mapStore = useMapStore();
const navStore = useNavigationStore();

const loading = ref(false);
const navLoading = ref(false);
const routesList = ref([]);
const selectedRouteIndex = ref(0);
const pointSelectorRef = ref(null);

const hasRoute = computed(() => routesList.value.length > 0);
const currentRoute = computed(() => routesList.value[selectedRouteIndex.value]);

const handleStartUpdate = (poi) => {
  navStore.setStartByPoi(poi);
  clearRoute();
};

const handleEndUpdate = (poi) => {
  navStore.setEndByPoi(poi);
  clearRoute();
};

const handlePickMode = (mode) => {
  if (navStore.pickMode === mode) {
    navStore.clearPickMode();
  } else {
    navStore.setPickMode(mode);
    ElMessage.info(`请在地图上右键选择${mode === 'start' ? '起点' : '终点'}`);
  }
};

const clearStart = () => {
  navStore.clearStart();
  pointSelectorRef.value?.clear();
  clearRoute();
};

const clearEnd = () => {
  navStore.clearEnd();
  pointSelectorRef.value?.clear();
  clearRoute();
};

const selectRoute = (idx) => {
  selectedRouteIndex.value = idx;
  const route = routesList.value[idx];
  if (route) {
    mapStore.setNavigationPath(route.waypoints);
    mapStore.setNavigationInfo({
      pathNames: route.pathNames,
      totalDistance: route.totalDistance,
      steps: route.steps
    });
    ElMessage.success(`已切换到路线${idx + 1}`);
    
    if (navStore.isNavigating) {
      navStore.stopNavigation();
    }
  }
};

const calculateRoute = async () => {
  const start = navStore.startPoint;
  const end = navStore.endPoint;
  
  if (!start.x || !end.x) {
    ElMessage.warning('请选择起点和终点');
    return;
  }
  
  loading.value = true;
  routesList.value = [];
  
  try {
    const result = await roadNetworkService.getShortestPath(
      null, null, start.x, start.y, end.x, end.y, 3
    );
    
    if (result.success) {
      routesList.value = result.data.routes;
      selectedRouteIndex.value = 0;
      
      mapStore.setNavigationPath(result.data.routes[0].waypoints);
      mapStore.setNavigationInfo({
        pathNames: result.data.routes[0].pathNames,
        totalDistance: result.data.routes[0].totalDistance,
        steps: result.data.routes[0].steps
      });
      
      ElMessage.success(`找到 ${result.data.routeCount} 条路线`);
    } else {
      ElMessage.error(result.error || '无法找到路径');
    }
  } catch (error) {
    console.error('导航失败:', error);
    ElMessage.error('导航失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const clearRoute = () => {
  routesList.value = [];
  selectedRouteIndex.value = 0;
  mapStore.clearNavigation();
  if (navStore.isNavigating) {
    navStore.stopNavigation();
  }
};

// ========== 一键导航模拟 ==========

const centerViewToPoint = () => {
  if (navStore.startPoint.x && navStore.startPoint.y) {
    window.dispatchEvent(new CustomEvent('center-map', { 
      detail: { x: navStore.startPoint.x, y: navStore.startPoint.y } 
    }));
    return true;
  }
  return false;
};

const startNavigationSimulation = async () => {
  const route = currentRoute.value;
  if (!route?.waypoints || route.waypoints.length < 2) {
    ElMessage.warning('当前路线无可导航的路径点');
    return;
  }
  
  navLoading.value = true;
  
  try {
    if (mapStore.navigationPath !== route.waypoints) {
      mapStore.setNavigationPath(route.waypoints);
    }
    
    centerViewToPoint();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 传入路径点（duration 参数会被内部固定速度逻辑覆盖）
    navStore.startNavigation(5000, route.waypoints);
    
    ElMessage.success(' 开始导航模拟，地图将沿路线移动');
    
  } catch (error) {
    console.error('导航启动失败:', error);
    ElMessage.error('导航启动失败');
  } finally {
    navLoading.value = false;
  }
};

// 🆕 暂停导航
const pauseNavigation = () => {
  navStore.pauseNavigation();
  ElMessage.info('导航已暂停');
};

// 🆕 继续导航
const resumeNavigation = () => {
  navStore.resumeNavigation();
  ElMessage.info('继续导航');
};

// 停止导航
const stopNavigation = () => {
  navStore.stopNavigation();
  ElMessage.info('导航已结束');
};

// 🆕 导航完成处理
const handleNavigationComplete = () => {
  ElMessage.success(' 已到达目的地！导航结束');
};

// 🆕 监听导航完成事件
onMounted(() => {
  window.addEventListener('navigation-complete', handleNavigationComplete);
});

onUnmounted(() => {
  window.removeEventListener('navigation-complete', handleNavigationComplete);
  if (navStore.isNavigating) {
    navStore.stopNavigation();
  }
});
</script>

<style scoped>
.nav-simulate {
  border: 1px solid #ddd;
  background-color: rgba(254, 254, 254, 0.862);
  width: 360px;
  display: flex;
  flex-direction: column;
  height: 600px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 10px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.header h5 {
  margin: 0;
  font-size: 16px;
}

.tip-btn {
  color: #909399;
  font-size: 14px;
  padding: 0 4px;
}

.nav-actions {
  display: flex;
  gap: 8px;
  padding: 12px 12px 0 12px;
}

.nav-btn {
  flex: 2;
}

.clear-btn {
  flex: 1;
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}

.clear-btn:hover {
  background-color: #f78989;
  border-color: #f78989;
}

.clear-btn:disabled {
  background-color: #c0c4cc;
  border-color: #c0c4cc;
  color: white;
}

.simulate-btn {
  margin: 12px;
  width: calc(100% - 24px);
  background-color: #67c23a;
  border-color: #67c23a;
  color: white;
}

.simulate-btn:hover {
  background-color: #85ce61;
  border-color: #85ce61;
}

.navigation-status {
  margin: 8px 12px;
  padding: 8px 12px;
  background-color: #ecf5ff;
  border-radius: 8px;
  border: 1px solid #b3d8ff;
}

.status-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  color: #409eff;
}

.nav-buttons {
  display: flex;
  gap: 8px;
}

.progress-bar {
  margin-top: 8px;
  height: 4px;
  background-color: #d9ecff;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #409eff;
  border-radius: 2px;
  transition: width 0.1s linear;
}
</style>