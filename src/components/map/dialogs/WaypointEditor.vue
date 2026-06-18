<!-- components/map/WaypointManageContent.vue -->
<template>
    <div class="waypoint-manage-content">
      <div class="info-section">
        <div class="info-item">
          <span class="label">名称:</span>
          <span class="value">{{ waypoint.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">坐标:</span>
          <span class="value">({{ waypoint.x }}, {{ waypoint.y }})</span>
        </div>
      </div>
      
      <div class="connections-section">
        <div class="section-header">
          <span>连接点 ({{ connections.length }})</span>
          <button class="add-btn" @click="openAddDialog">+ 添加</button>
        </div>
        
        <div class="connections-list">
          <div v-if="connections.length === 0" class="empty-tip">
            暂无连接点
          </div>
          <div v-for="conn in connections" :key="conn.to_poi_id" class="connection-item">
            <span class="conn-name">{{ conn.to_name }}</span>
            <span class="conn-distance">{{ conn.distance }}px</span>
            <button class="remove-btn" @click="removeConnection(conn.to_poi_id)">×</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onBeforeUnmount } from 'vue';
  import { ElMessage } from 'element-plus';
  import { usePoiStore } from '@/stores/poiStore';
  import { useRoadNetworkStore } from '@/stores/roadNetworkStore';
  import showDialog from '@/components/Dialog/Dialog.js';
  import AddConnectionDialog from './AddConnectionDialog.vue';
  
  const props = defineProps({
    waypoint: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['updated', 'close']);
  
  const poiStore = usePoiStore();
  const roadNetworkStore = useRoadNetworkStore();
  
  const connections = ref([]);
  
  // 加载连接
  const loadConnections = async () => {
    const data = await roadNetworkStore.getConnectionsForPoint(props.waypoint.id);
    connections.value = data;
  };
  
  // 打开添加连接弹窗
  const openAddDialog = async () => {
    const excludeIds = connections.value.map(c => c.to_poi_id);
    
    await showDialog(
      { 
        title: '添加连接',
        left: window.innerWidth / 2 + 250,
        bottom: window.innerHeight  - 400,
        draggable: true,
        width: 'auto',
        padding: 0
      },
      AddConnectionDialog,
      {
        currentWaypointId: props.waypoint.id,
        excludeIds: excludeIds,
        onSuccess: async (targetId, closeDialog) => {
          await roadNetworkStore.addBidirectionalConnection(props.waypoint.id, targetId);
          await loadConnections();
          emit('updated');
          if (closeDialog) closeDialog();
          // ElMessage.success('连接添加成功');
        }
      },
      'clearSameAndShow'
    );
  };
  
  // 删除连接
  const removeConnection = async (targetId) => {
    try {
      await roadNetworkStore.deleteBidirectionalConnection(props.waypoint.id, targetId);
      await loadConnections();
      emit('updated');
      // ElMessage.success('连接删除成功');
    } catch (error) {
      // ElMessage.error('删除失败');
    }
  };
  
  
  
  // 监听组件销毁
  onBeforeUnmount(() => {
    showDialog({}, AddConnectionDialog, {}, 'closeIfExist');
  });
  
  watch(() => props.waypoint, () => {
    if (props.waypoint) {
      loadConnections();
    }
  }, { immediate: true });
  </script>
  <style scoped>
  .waypoint-manage-content {
    min-width: 260px;
    padding: 12px;
  }
  
  .info-section {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
  }
  
  .info-item {
    display: flex;
    margin-bottom: 6px;
    font-size: 13px;
  }
  
  .info-item .label {
    width: 45px;
    color: #909399;
  }
  
  .info-item .value {
    color: #303133;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 500;
  }
  
  .add-btn {
    background: #409eff;
    color: white;
    border: none;
    padding: 2px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
  }
  
  .add-btn:hover {
    background: #66b1ff;
  }
  
  .connections-list {
    max-height: 200px;
    overflow-y: auto;
  }
  
  .connection-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    margin-bottom: 5px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 12px;
  }
  
  .conn-name {
    font-weight: 500;
  }
  
  .conn-distance {
    color: #909399;
    font-size: 11px;
  }
  
  .remove-btn {
    background: #f56c6c;
    color: white;
    border: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
  }
  
  .remove-btn:hover {
    background: #f78989;
  }
  
  .empty-tip {
    text-align: center;
    color: #909399;
    font-size: 12px;
    padding: 16px;
  }
  </style>