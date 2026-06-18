<template>
    <div v-if="routes.length > 0" class="route-list">
      <div class="route-title">可选路线</div>
      <div class="route-items">
        <div
          v-for="(route, idx) in routes"
          :key="idx"
          class="route-item"
          :class="{ active: selectedIndex === idx }"
          @click="$emit('select', idx)"
        >
          <div class="route-info">
            <span class="route-name">路线{{ idx + 1 }}</span>
            <span class="route-distance">{{ route.totalDistance }}px</span>
          </div>
          <div v-if="selectedIndex === idx" class="route-badge">当前</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    routes: {
      type: Array,
      default: () => []
    },
    selectedIndex: {
      type: Number,
      default: 0
    }
  });
  
  defineEmits(['select']);
  </script>
  
  <style scoped>
  .route-list {
    padding: 12px;
    border-top: 1px solid #eee;
    background: #fafbfc;
    margin-top: 12px;
  }
  
  .route-title {
    font-size: 12px;
    color: #606266;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .route-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .route-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: white;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .route-item:hover {
    border-color: #409eff;
    background: #ecf5ff;
  }
  
  .route-item.active {
    border-color: #409eff;
    background: #ecf5ff;
  }
  
  .route-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .route-name {
    font-size: 13px;
    font-weight: 500;
    color: #303133;
  }
  
  .route-distance {
    font-size: 11px;
    color: #909399;
  }
  
  .route-badge {
    font-size: 11px;
    color: #409eff;
    background: rgba(64, 158, 255, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
  }
  </style>