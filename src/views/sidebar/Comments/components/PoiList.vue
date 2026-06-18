<template>
  <div class="poi-list-container">
    <DynamicScroller
      v-if="pois.length > 0"
      :items="pois"
      :min-item-size="70"
      class="scroller"
      key-field="id"
    >
      <template #default="{ item: poi, active }">
        <DynamicScrollerItem :item="poi" :active="active" :size-dependencies="[poi.name, poi.description]">
          <div class="poi-item">
            <div class="poi-info" @click="$emit('locate', poi)">
              <div class="poi-header">
                <span class="poi-name">{{ poi.name }}</span>
                <span class="poi-type" :style="{ color: getTypeColor(poi.type) }">
                  {{ POI_TYPE_LABELS[poi.type] || poi.type }}
                </span>
                <span class="poi-coord">
                  坐标: {{ poi.x }}, {{ poi.y }}
                </span>
              </div>
              
              <el-tooltip 
                :content="poi.description || '无描述'" 
                placement="bottom-end"
                :disabled="!isDescOverflow(poi.description)"
                popper-class="custom-tooltip"
              >
                <div class="poi-desc">
                  {{ poi.description || '无描述' }}
                </div>
              </el-tooltip>
            </div>
            
            <!-- 🆕 评价按钮 -->
            <div class="poi-action-btn" @click.stop="$emit('detail', poi)">
              <el-button size="small" type="primary" plain>评价</el-button>
            </div>
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
    
    <el-empty 
      v-else
      description="暂无建筑"
      :image-size="80"
    />
  </div>
</template>

<script setup>
import { POI_TYPE_LABELS, POI_TYPE_COLORS } from '@/data/poiData';

defineProps({
  pois: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['edit', 'delete', 'toggle-visibility', 'locate', 'detail']);

const getTypeColor = (type) => {
  return POI_TYPE_COLORS[type] || '#909399';
};

const isDescOverflow = (desc) => {
  return desc && desc.length > 30;
};
</script>

<style scoped>
.poi-list-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.scroller {
  height: 100%;
}

.poi-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
  transition: background 0.2s;
}

.poi-item:hover {
  background: #f5f7fa;
}

.poi-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.poi-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.poi-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.poi-type {
  font-size: 12px;
  font-weight: 500;
}

.poi-coord {
  font-size: 11px;
  color: #909399;
}

.poi-desc {
  font-size: 12px;
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

.poi-action-btn {
  flex-shrink: 0;
  margin-left: 12px;
}

.poi-action-btn .el-button {
  padding: 4px 10px;
  font-size: 12px;
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