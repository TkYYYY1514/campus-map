<template>
  <div class="control-group">
    <!-- 隐藏UI按钮 -->
    <div class="toggle-btn" @click="$emit('toggle-ui')">
      {{ isUIHidden ? '显示UI' : '隐藏UI' }}
    </div>
    
    <!-- 视图控制弹窗 -->
    <el-popover
      placement="bottom-end"
      trigger="click"
      :hide-after="0"
      popper-class="view-control-popover"
    >
      <template #reference>
        <div class="view-control-btn">
          <span>视图控制</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
      </template>
      
      <div class="popover-content">
        <div class="popover-item" @click="mapStore.setShowPois(!mapStore.showPois)">
          <span>POI点</span>
          <el-switch :model-value="mapStore.showPois" size="small" />
        </div>
        
        <div class="popover-item" @click="mapStore.setShowPoiLabels(!mapStore.showPoiLabels)">
          <span>POI标签</span>
          <el-switch :model-value="mapStore.showPoiLabels" size="small" />
        </div>
        
        <!-- 管理员专属区域：横杠 + 路网 + 路径点 + 重置 -->
        <template v-if="userStore.isAdmin">
          <div class="popover-divider"></div>
          
          <div class="popover-item" @click="mapStore.setShowRoutes(!mapStore.showRoutes)">
            <span>用户路线</span>
            <el-switch :model-value="mapStore.showRoutes" size="small" />
          </div>
          
          <div class="popover-item" @click="mapStore.setShowNetwork(!mapStore.showNetwork)">
            <span>路网</span>
            <el-switch :model-value="mapStore.showNetwork" size="small" />
          </div>
          
          <div class="popover-item" @click="mapStore.setShowWaypoints(!mapStore.showWaypoints)">
            <span>路径点</span>
            <el-switch :model-value="mapStore.showWaypoints" size="small" />
          </div>
          
          <div class="popover-divider"></div>
          
          <div class="popover-reset" @click="mapStore.resetAll">
            重置
          </div>
        </template>
      </div>
    </el-popover>

    <!-- 建筑类型筛选弹窗 -->
    <el-popover
      placement="bottom-end"
      trigger="click"
      :hide-after="0"
      popper-class="building-type-popover"
    >
      <template #reference>
        <div class="view-control-btn">
          <span>建筑筛选</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
      </template>
      
      <div class="popover-content">
        <div
          v-for="item in buildingTypes"
          :key="item.type"
          class="popover-item"
          :class="{ 'item-selected': !mapStore.visiblePoiTypes[item.type] }"
          @click="mapStore.setPoiTypeVisible(item.type, !mapStore.visiblePoiTypes[item.type])"
        >
          <span :style="{ color: typeColors[item.type] }">{{ item.label }}</span>
          <el-switch :model-value="mapStore.visiblePoiTypes[item.type]" size="small" />
        </div>
        
        <div class="popover-divider"></div>
        
        <div class="popover-reset" @click="resetBuildingTypes">
          重置建筑显示
        </div>
      </div>
    </el-popover>

    <!-- 导航图标选择弹窗 -->
    <el-popover
      placement="bottom-end"
      trigger="click"
      :hide-after="0"
      popper-class="nav-icon-popover"
    >
      <template #reference>
        <div class="view-control-btn">
          <span>路线图标</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
      </template>
      
      <div class="popover-content">
        <div
          v-for="item in iconStore.iconTypes"
          :key="item.value"
          class="popover-item"
          :class="{ 'item-selected': iconStore.navIconType === item.value }"
          @click="iconStore.setNavIconType(item.value)"
        >
          <span>{{ item.label }}</span>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue';
import { useMapStore } from '@/stores/mapStore';
import { useIconStore } from '@/stores/iconStore';
import { useUserStore } from '@/stores/userStore';
import { POI_TYPE_COLORS } from '@/data/poiData';

defineProps({
  isUIHidden: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle-ui']);

const mapStore = useMapStore();
const iconStore = useIconStore();
const userStore = useUserStore();

// 建筑类型列表
const buildingTypes = [
  { type: 'classroom', label: '教学楼' },
  { type: 'dormitory', label: '宿舍' },
  { type: 'canteen', label: '食堂' },
  { type: 'entrance', label: '进出口' },
  { type: 'stadium', label: '体育场' },
  { type: 'clinic', label: '医务室' },
  { type: 'supermarket', label: '超市' },
  { type: 'parking', label: '停车场' },
  { type: 'toilet', label: '卫生间' },
  { type: 'statue', label: '雕像' },
  { type: 'other', label: '其他' }
];

const typeColors = POI_TYPE_COLORS;

const resetBuildingTypes = () => {
  buildingTypes.forEach(item => {
    mapStore.setPoiTypeVisible(item.type, true);
  });
};
</script>

<style scoped>
.control-group {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.toggle-btn {
  padding: 6px 22px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  user-select: none;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.view-control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 80px;
  padding: 6px 6px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  user-select: none;
  transition: all 0.2s;
}

.view-control-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>

<style>
/* 全局样式 - 视图控制 */
.view-control-popover,
.building-type-popover,
.nav-icon-popover {
  padding: 4px 0 !important;
  min-width: 120px !important;
  width: auto !important;
}

.popover-content {
  display: flex;
  flex-direction: column;
}

.popover-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
  gap: 12px;
}

.popover-item:hover {
  background-color: #f5f7fa;
}

.popover-item.item-selected {
  background-color: #e6f7ff;
}

.popover-divider {
  height: 1px;
  background-color: #e4e7ed;
  margin: 4px 0;
}

.popover-reset {
  padding: 6px 10px;
  text-align: center;
  cursor: pointer;
  font-size: 12px;
  color: #409eff;
  transition: background 0.2s;
}

.popover-reset:hover {
  background-color: #f5f7fa;
}
</style>