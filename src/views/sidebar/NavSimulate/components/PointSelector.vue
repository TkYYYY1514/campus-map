<template>
  <div class="point-selector">
    <!-- 起点选择 -->
    <div class="select-item">
      <div class="select-label">起点</div>
      <div class="select-wrapper">
        <el-select
          v-model="startValue"
          placeholder="请选择起点或右键设置"
          filterable
          clearable
          :filter-method="filterStartPois"
          size="default"
          class="select-input"
          @change="onStartChange"
        >
          <el-option
            v-for="poi in filteredStartPois"
            :key="poi.id"
            :label="`${poi.name} (${poi.x}, ${poi.y})`"
            :value="poi.id"
          />
        </el-select>
        <el-button 
          size="small" 
          class="pick-btn"
          :type="pickMode === 'start' ? 'primary' : 'default'"
          @click="$emit('pick-mode', 'start')"
        >
          {{ pickMode === 'start' ? '点击中...' : '右键' }}
        </el-button>
      </div>
    </div>

    <!-- 终点选择 -->
    <div class="select-item">
      <div class="select-label">终点</div>
      <div class="select-wrapper">
        <el-select
          v-model="endValue"
          placeholder="请选择终点或右键设置"
          filterable
          clearable
          :filter-method="filterEndPois"
          size="default"
          class="select-input"
          @change="onEndChange"
        >
          <el-option
            v-for="poi in filteredEndPois"
            :key="poi.id"
            :label="`${poi.name} (${poi.x}, ${poi.y})`"
            :value="poi.id"
          />
        </el-select>
        <el-button 
          size="small" 
          class="pick-btn"
          :type="pickMode === 'end' ? 'primary' : 'default'"
          @click="$emit('pick-mode', 'end')"
        >
          {{ pickMode === 'end' ? '点击中...' : '右键' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePoiStore } from '@/stores/poiStore';
import { POI_TYPE_LABELS } from '@/data/poiData';

const props = defineProps({
  pickMode: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:start', 'update:end', 'pick-mode']);

const poiStore = usePoiStore();

const startValue = ref(null);
const endValue = ref(null);
const startSearchKeyword = ref('');
const endSearchKeyword = ref('');

const poiOptions = computed(() => {
  return poiStore.pois.filter(p => p.type !== 'waypoint' && p.is_visible === 1);
});

// 🆕 模糊搜索函数（支持名称、类型标签、坐标、描述）
const filterPois = (pois, keyword) => {
  if (!keyword) return pois;
  const kw = keyword.toLowerCase().trim();
  return pois.filter(poi => {
    return (
      poi.name.toLowerCase().includes(kw) ||
      (POI_TYPE_LABELS[poi.type] && POI_TYPE_LABELS[poi.type].toLowerCase().includes(kw)) ||
      `${poi.x},${poi.y}`.includes(kw) ||
      (poi.description && poi.description.toLowerCase().includes(kw))
    );
  });
};

const filteredStartPois = computed(() => {
  return filterPois(poiOptions.value, startSearchKeyword.value);
});

const filteredEndPois = computed(() => {
  return filterPois(poiOptions.value, endSearchKeyword.value);
});

const filterStartPois = (query) => {
  startSearchKeyword.value = query;
};

const filterEndPois = (query) => {
  endSearchKeyword.value = query;
};

const onStartChange = () => {
  const poi = poiOptions.value.find(p => p.id === startValue.value);
  if (poi) {
    emit('update:start', { id: poi.id, name: poi.name, x: poi.x, y: poi.y });
  }
  startSearchKeyword.value = '';
};

const onEndChange = () => {
  const poi = poiOptions.value.find(p => p.id === endValue.value);
  if (poi) {
    emit('update:end', { id: poi.id, name: poi.name, x: poi.x, y: poi.y });
  }
  endSearchKeyword.value = '';
};

const clear = () => {
  startValue.value = null;
  endValue.value = null;
};

defineExpose({ clear });
</script>

<style scoped>
.select-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 12px 0 12px;
}

.select-label {
  width: 40px;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  flex-shrink: 0;
}

.select-wrapper {
  flex: 1;
  display: flex;
  gap: 6px;
}

.select-input {
  flex: 1;
}

.pick-btn {
  width: 50px;
  font-size: 12px;
  padding: 5px 0;
}
</style>