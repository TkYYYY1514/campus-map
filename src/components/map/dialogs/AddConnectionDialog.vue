<template>
    <div class="add-connection-content">
      <!-- 搜索框 - 使用原生 input -->
      <div class="search-item">
        <div class="search-label">搜索</div>
        <input 
          type="text"
          v-model="searchKeyword"
          placeholder="名称搜索"
          class="search-input"
          @input="handleSearch"
        />
      </div>
      
      <!-- 目标路径点列表 -->
      <div class="list-item">
        <div class="list-label">目标路径点</div>
        <div class="waypoint-list">
          <div
            v-for="wp in filteredWaypoints"
            :key="wp.id"
            class="waypoint-option"
            :class="{ selected: selectedTargetId === wp.id }"
            @click="selectedTargetId = wp.id"
          >
            <span class="wp-name">{{ wp.name }}</span>
            <span v-if="selectedTargetId === wp.id" class="check-mark">✓</span>
          </div>
          <div v-if="filteredWaypoints.length === 0" class="empty-tip">
            {{ searchKeyword ? '无匹配' : '暂无路径点' }}
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn-cancel" @click="cancel">取消</button>
        <button class="btn-confirm" @click="confirm">确定</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, inject } from 'vue';
  import { ElMessage } from 'element-plus';
  import { usePoiStore } from '@/stores/poiStore';
  
  const props = defineProps({
    currentWaypointId: {
      type: Number,
      required: true
    },
    excludeIds: {
      type: Array,
      default: () => []
    },
    onSuccess: {
      type: Function,
      default: null
    }
  });
  
  const closeDialog = inject('close');
  
  const poiStore = usePoiStore();
  const selectedTargetId = ref(null);
  const searchKeyword = ref('');
  
  const availableWaypoints = computed(() => {
    return poiStore.pois.filter(p => 
      p.type === 'waypoint' && 
      p.id !== props.currentWaypointId &&
      !props.excludeIds.includes(p.id)
    );
  });
  
  const filteredWaypoints = computed(() => {
    if (!searchKeyword.value.trim()) {
      return availableWaypoints.value;
    }
    const keyword = searchKeyword.value.toLowerCase().trim();
    return availableWaypoints.value.filter(wp => 
      wp.name.toLowerCase().includes(keyword)
    );
  });
  
  const handleSearch = (value) => {
    searchKeyword.value = value;
  };
  
  const cancel = () => {
    if (closeDialog) closeDialog();
  };
  
  const confirm = () => {
    if (!selectedTargetId.value) {
      ElMessage.warning('请选择目标路径点');
      return;
    }
    
    if (props.onSuccess) {
      props.onSuccess(selectedTargetId.value, closeDialog);
    }
  };
  </script>
  
  <style scoped>
  :deep(.dialog) {
    max-width: none !important;
    width: auto !important;
  }
  
  .add-connection-content {
    width: 260px;
    padding: 10px;
    background: #fff;
  }
  
  .search-item {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
  }
  
  .search-label {
    width: 40px;
    font-size: 12px;
    color: #606266;
    flex-shrink: 0;
  }
  
  .search-input {
    flex: 1;
    height: 24px;
    padding: 0 6px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 12px;
    outline: none;
  }
  
  .search-input:focus {
    border-color: #409eff;
  }
  
  .list-item {
    margin-bottom: 12px;
  }
  
  .list-label {
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 500;
    color: #303133;
  }
  
  .waypoint-list {
    max-height: 220px;
    overflow-y: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
  }
  
  .waypoint-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .waypoint-option:last-child {
    border-bottom: none;
  }
  
  .waypoint-option:hover {
    background: #f5f7fa;
  }
  
  .waypoint-option.selected {
    background: #ecf5ff;
  }
  
  .wp-name {
    font-size: 12px;
    font-weight: 500;
    color: #303133;
  }
  
  .check-mark {
    color: #409eff;
    font-weight: bold;
    font-size: 12px;
  }
  
  .empty-tip {
    text-align: center;
    color: #909399;
    font-size: 11px;
    padding: 16px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
  }
  
  .btn-cancel {
    padding: 4px 10px;
    border: 1px solid #dcdfe6;
    /* background: #fff; */
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }
  
  .btn-cancel:hover {
    background: #f5f7fa;
  }
  
  .btn-confirm {
    padding: 4px 10px;
    border: none;
    background: #409eff;
    color: #fff;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }
  
  .btn-confirm:hover {
    background: #66b1ff;
  }
  </style>