<template>
  <div class="nh-content">
    <div class="poi-info">
      <!-- <div class="poi-name">{{ poi?.name }}</div> -->
      <!-- <div class="poi-type">{{ typeLabel }}</div> -->
      <div class="poi-description">{{ poi?.description }}</div>
      <div class="poi-coord">
        <span>坐标: </span>
        <span>X: {{ poi?.x }}, Y: {{ poi?.y }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { POI_TYPE_LABELS } from '@/data/poiData'

const props = defineProps({
  poi: {
    type: Object,
    default: null
  }
})

const typeLabel = computed(() => {
  if (!props.poi?.type) return ''
  return POI_TYPE_LABELS[props.poi.type] || props.poi.type
})
</script>

<style scoped lang="scss">
.nh-content {
  padding: 15px;
  min-width: 200px;
  max-width: 500px;
}

.poi-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.poi-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.poi-type {
  font-size: 12px;
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
}

.poi-description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.poi-coord {
  font-size: 12px;
  color: #999;
  font-family: monospace;
}
</style>
