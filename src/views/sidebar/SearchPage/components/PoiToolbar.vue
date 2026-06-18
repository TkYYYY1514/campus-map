<template>
  <div class="toolbar">
    <div class="stats">
      共 {{ total }} 个建筑
    </div>
    <div class="filter-group">
      <el-input
        v-model="searchValue"
        placeholder="搜索..."
        clearable
        prefix-icon="Search"
        size="small"
        class="search-input"
        @input="handleSearch"
      />
      
      <!-- 类型筛选下拉 - 添加 popper-class -->
      <el-dropdown 
        trigger="click" 
        @command="handleTypeFilter"
        popper-class="type-filter-popper"
      >
        <el-button size="small" class="filter-btn">
          类型筛选
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item 
              v-for="(label, key) in POI_TYPE_LABELS" 
              :key="key"
            >
              <el-checkbox 
                :model-value="selectedTypes.includes(key)"
                @change="toggleType(key)"
                @click.stop
              >
                <span :style="{ color: getTypeColor(key) }">
                  {{ label }}
                </span>
              </el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item divided>
              <el-button link size="small" @click="clearFilter">清空筛选</el-button>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { POI_TYPE_LABELS, POI_TYPE_COLORS } from '@/data/poiData';

const props = defineProps({
  total: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['search', 'filter-change']);

const searchValue = ref('');
const selectedTypes = ref([]);

const getTypeColor = (type) => {
  return POI_TYPE_COLORS[type] || '#909399';
};

const handleSearch = () => {
  emit('search', searchValue.value);
};

const toggleType = (type) => {
  const index = selectedTypes.value.indexOf(type);
  if (index > -1) {
    selectedTypes.value.splice(index, 1);
  } else {
    selectedTypes.value.push(type);
  }
  emit('filter-change', selectedTypes.value);
};

const handleTypeFilter = () => {};

const clearFilter = () => {
  searchValue.value = '';
  selectedTypes.value = [];
  emit('search', '');
  emit('filter-change', []);
};

const resetFilter = () => {
  searchValue.value = '';
  selectedTypes.value = [];
};

defineExpose({ resetFilter });
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
  gap: 12px;
}

.stats {
  font-size: 13px;
  color: #606266;
  flex-shrink: 0;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
}

.search-input {
  width: 140px;
}

.filter-btn {
  font-size: 12px;
  padding: 5px 10px;
}

:deep(.el-checkbox__label) {
  font-size: 13px;
}
</style>

<style>
/* 非 scoped - 限制下拉菜单高度 */
.type-filter-popper .el-dropdown-menu {
  max-height: 280px;
  overflow-y: auto;
}

/* 美化滚动条（可选） */
.type-filter-popper .el-dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.type-filter-popper .el-dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.type-filter-popper .el-dropdown-menu::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.type-filter-popper .el-dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>