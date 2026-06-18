<template>
  <div class="toolbar">
    <div class="stats">
      共 {{ total }} 条路线
    </div>
    <div class="filter-group">
      <el-input
        v-model="searchValue"
        placeholder="搜索路线..."
        clearable
        prefix-icon="Search"
        size="small"
        class="search-input"
        @input="handleSearch"
      />
      
      <!-- 状态筛选 -->
      <el-dropdown trigger="click" @command="handleStatusFilter">
        <el-button size="small" class="filter-btn">
          状态筛选
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="all">
              <el-checkbox :model-value="statusFilter === 'all'" >
                全部
              </el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item command="active">
              <el-checkbox :model-value="statusFilter === 'active'" >
                显示中
              </el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item command="inactive">
              <el-checkbox :model-value="statusFilter === 'inactive'" >
                已隐藏
              </el-checkbox>
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

const props = defineProps({
  total: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['search', 'filter-change']);

const searchValue = ref('');
const statusFilter = ref('all'); // all, active, inactive

const handleSearch = () => {
  emit('search', searchValue.value);
};

const handleStatusFilter = (command) => {
  statusFilter.value = command;
  emit('filter-change', command);
};

const resetFilter = () => {
  searchValue.value = '';
  statusFilter.value = 'all';
  emit('search', '');
  emit('filter-change', 'all');
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
