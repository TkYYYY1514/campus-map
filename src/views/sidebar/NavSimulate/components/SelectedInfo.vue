<template>
    <div v-if="startName || endName" class="selected-info">
      <div v-if="startName" class="selected-row">
        <span class="tag">起点</span>
        <span class="name">{{ startName }}</span>
        <el-button size="small" text @click="$emit('clear-start')">清除</el-button>
      </div>
      <div v-if="endName" class="selected-row">
        <span class="tag">终点</span>
        <span class="name">{{ endName }}</span>
        <el-button size="small" text @click="$emit('clear-end')">清除</el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    startName: {
      type: String,
      default: null
    },
    endName: {
      type: String,
      default: null
    }
  });
  
  defineEmits(['clear-start', 'clear-end']);
  </script>
  
  <style scoped>
  .selected-info {
    padding: 10px 12px;
    background: #f5f7fa;
    margin: 12px;
    border-radius: 4px;
  }
  
  .selected-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    margin-bottom: 4px;
  }
  
  .selected-row:last-child {
    margin-bottom: 0;
  }
  
  .selected-row .tag {
    background: #409eff;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
  }
  
  .selected-row .name {
    flex: 1;
    color: #303133;
  }
  </style>