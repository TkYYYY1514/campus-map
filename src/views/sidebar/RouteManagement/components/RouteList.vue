<template>
  <div class="route-list-container">
    <el-scrollbar height="100%">
      <div class="route-list">
        <!-- ========== 全图路网（置顶，可编辑样式，不可删除） ========== -->
        <div class="route-item network-item">
          <div class="route-info">
            <div class="route-header">
              <span class="route-name">🌐 全图路网</span>
              <span class="route-nodes">
                {{ networkConnectionsCount }} 条连接
              </span>
            </div>
            <div class="route-desc">
              所有路径点之间的连通关系，用于动态导航计算
            </div>
            <div class="route-color-preview">
              <span 
                class="color-dot" 
                :style="{ backgroundColor: networkStyle.color }"
              ></span>
              <span class="color-text">{{ networkStyle.color }}</span>
              <span class="style-text">{{ getStyleText(networkStyle.style) }}</span>
              <span class="width-text">线宽: {{ networkStyle.width }}px</span>
            </div>
          </div>
          
          <div class="route-actions">
            <div class="action-buttons">
              <el-button size="small" type="primary" plain @click="$emit('edit-network')">编辑</el-button>
              <el-button size="small" plain disabled class="delete-disabled">删除</el-button>
            </div>
            <div class="action-switch">
              <span class="switch-label">{{ networkVisible ? '显示' : '隐藏' }}</span>
              <el-switch
                :model-value="networkVisible"
                size="small"
                @update:model-value="$emit('toggle-network', $event)"
              />
            </div>
          </div>
        </div>

        <!-- ========== 用户路线 ========== -->
        <div 
          v-for="route in routes" 
          :key="route.id" 
          class="route-item"
          :class="{ 'route-selected': selectedRouteId === route.id }"
          @click="handleSelectRoute(route)"
        >
          <div class="route-info">
            <div class="route-header">
              <span class="route-name">{{ route.name }}</span>
              <span class="route-nodes">
                {{ route.nodes?.length || 0 }} 个节点
              </span>
            </div>
            
            <el-tooltip 
              :content="route.description || '无描述'" 
              placement="bottom-end"
              :disabled="!isDescOverflow(route.description)"
              popper-class="custom-tooltip"
            >
              <div class="route-desc">
                {{ route.description || '无描述' }}
              </div>
            </el-tooltip>
            
            <div class="route-color-preview">
              <span 
                class="color-dot" 
                :style="{ backgroundColor: route.color }"
              ></span>
              <span class="color-text">{{ route.color }}</span>
              <span class="style-text">{{ getStyleText(route.style) }}</span>
            </div>
          </div>
          
          <div class="route-actions">
            <div class="action-buttons">
              <el-button size="small" type="primary" plain @click.stop="$emit('edit', route)">编辑</el-button>
              <el-button size="small" type="danger" plain @click.stop="$emit('delete', route)">删除</el-button>
            </div>
            <div class="action-switch">
              <span class="switch-label">{{ route.is_active === 1 ? '显示' : '隐藏' }}</span>
              <el-switch
                v-model="route.is_active"
                :active-value="1"
                :inactive-value="0"
                size="small"
                @change.stop="() => $emit('toggle-visibility', route)"
              />
            </div>
          </div>
        </div>

        <el-empty 
          v-if="routes.length === 0" 
          description="暂无路线，点击上方新增"
          :image-size="80"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { useRouteStore } from '@/stores/routeStore';

const props = defineProps({
  routes: {
    type: Array,
    required: true,
    default: () => []
  },
  networkConnectionsCount: {
    type: Number,
    default: 0
  },
  networkVisible: {
    type: Boolean,
    default: false
  },
  networkStyle: {
    type: Object,
    default: () => ({
      color: '#ff0011',
      style: 'solid',
      width: 6
    })
  }
});

const emit = defineEmits(['edit', 'delete', 'toggle-visibility', 'toggle-network', 'edit-network', 'select-route']);

const routeStore = useRouteStore();

// 获取当前选中的路线ID
const selectedRouteId = routeStore.selectedRouteId;

// 选中路线
const handleSelectRoute = (route) => {
  routeStore.selectRoute(route);
  emit('select-route', route);
};

const isDescOverflow = (desc) => {
  return desc && desc.length > 30;
};

const getStyleText = (style) => {
  const styleMap = {
    solid: '实线',
    dashed: '虚线',
    dotted: '点线'
  };
  return styleMap[style] || '实线';
};
</script>

<style scoped>
.route-list-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.route-list {
  padding: 4px 0;
}

.route-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
  transition: background 0.2s;
  cursor: pointer;
}

.route-item:hover {
  background: #f5f7fa;
}

/* 选中样式 */
.route-item.route-selected {
  background: #ecf5ff;
  border-left: 3px solid #409eff;
}

.route-item.route-selected .route-name {
  font-weight: 700;
  color: #409eff;
}

.network-item {
  background: #fafbfc;
  border-bottom: 2px solid #e4e7ed;
  cursor: default;
}

.network-item .route-name {
  color: #409eff;
}

.route-info {
  flex: 1;
  min-width: 0;
}

.route-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.route-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.route-nodes {
  font-size: 11px;
  color: #909399;
}

.route-desc {
  font-size: 10px;
  color: #606266;
  line-height: 1.4;
  max-height: 2.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
  padding: 0px 8px;
  margin-top: 4px;
}

.route-color-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 0px 8px;
  flex-wrap: wrap;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #ddd;
  flex-shrink: 0;
}

.color-text {
  font-size: 11px;
  color: #909399;
  font-family: monospace;
}

.style-text {
  font-size: 11px;
  color: #c0c4cc;
}

.width-text {
  font-size: 11px;
  color: #c0c4cc;
}

.route-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 12px;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.delete-disabled {
  color: #c0c4cc !important;
  cursor: not-allowed !important;
  background-color: #fff !important;
  border-color: #ebeef5 !important;
}

.delete-disabled:hover {
  color: #c0c4cc !important;
  background-color: #fff !important;
  border-color: #ebeef5 !important;
}

.action-switch {
  display: flex;
  align-items: center;
  gap: 6px;
}

.switch-label {
  font-size: 11px;
  color: #909399;
}
</style>

<style>
.custom-tooltip {
  max-width: 250px !important;
  min-width: 100px !important;
  font-size: 12px !important;
  line-height: 1.5 !important;
  padding: 8px 12px !important;
  border-radius: 6px !important;
  background-color: #303133 !important;
  color: #ffffff !important;
  word-break: break-all !important;
  white-space: normal !important;
}
</style>