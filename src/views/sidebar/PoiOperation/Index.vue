<template>
  <div class="poi-manager">
    <div class="header">
      <h2>POI 点位管理</h2>
      <el-button class="btn-primary" @click="openCreateDialog">+ 新增点位</el-button>
    </div>

    <!-- 使用工具栏组件 -->
    <PoiToolbar 
      :total="filteredByType.length"
      @search="handleSearch"
      @filter-change="handleTypeFilterChange"
    />

    <PoiList 
      :pois="finalFilteredPois"
      @edit="openEditDialog"
      @delete="confirmDelete"
       @locate="handleLocatePoi"
    />

    <!-- 弹窗组件保持不变 -->
    <PoiFormDialog
      v-model:visible="showDialog"
      :is-edit="isEdit"
      :form-data="form"
      @submit="submitForm"
      @close="closeDialog"
    />

    <PoiDeleteConfirm
      v-model:visible="showDeleteConfirm"
      :poi-name="deleteTarget?.name"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { usePoiStore } from '@/stores/poiStore';
import { useMapStore } from '@/stores/mapStore';
import { POI_TYPE_LABELS } from '@/data/poiData';
import { ElMessage } from 'element-plus';
import PoiList from './components/PoiList.vue';
import PoiFormDialog from './components/PoiFormDialog.vue';
import PoiDeleteConfirm from './components/PoiDeleteConfirm.vue';
import PoiToolbar from './components/PoiToolbar.vue';

const poiStore = usePoiStore();
const mapStore = useMapStore();

// 处理定位（直接从全局 store 获取 centerOnPoi）
const handleLocatePoi = (poi) => {
  if (mapStore.centerOnPoi) {
    mapStore.centerOnPoi(poi);
  } else {
    console.error('地图组件未加载或 centerOnPoi 方法不存在');
  }
};
// 搜索关键词
const searchKeyword = ref('');

// 选中的类型
const selectedTypes = ref([]);

// 按类型过滤
const filteredByType = computed(() => {
  if (selectedTypes.value.length === 0) {
    return poiStore.pois;
  }
  return poiStore.pois.filter(poi => selectedTypes.value.includes(poi.type));
});

// 按关键词过滤
const finalFilteredPois = computed(() => {
  if (!searchKeyword.value.trim()) {
    return filteredByType.value;
  }
  const keyword = searchKeyword.value.toLowerCase().trim();
  return filteredByType.value.filter(poi => {
    return (
      poi.name.toLowerCase().includes(keyword) ||
      (POI_TYPE_LABELS[poi.type] && POI_TYPE_LABELS[poi.type].toLowerCase().includes(keyword)) ||
      `${poi.x},${poi.y}`.includes(keyword) ||
      (poi.description && poi.description.toLowerCase().includes(keyword))
    );
  });
});

// 处理搜索
const handleSearch = (keyword) => {
  searchKeyword.value = keyword;
};

// 处理类型筛选
const handleTypeFilterChange = (types) => {
  selectedTypes.value = types;
};

// 其他代码保持不变...
const showDialog = ref(false);
const isEdit = ref(false);
const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);

const form = reactive({
  id: null,
  name: '',
  type: 'classroom',
  x: 0,
  y: 0,
  description: '',
  is_visible: 1
});

const openCreateDialog = () => {
  isEdit.value = false;
  Object.assign(form, {
    id: null,
    name: '',
    type: 'classroom',
    x: 0,
    y: 0,
    description: '',
    is_visible: 1
  });
  showDialog.value = true;
};

const openEditDialog = (poi) => {
  isEdit.value = true;
  Object.assign(form, {
    id: poi.id,
    name: poi.name,
    type: poi.type,
    x: poi.x,
    y: poi.y,
    description: poi.description || '',
    is_visible: poi.is_visible
  });
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const submitForm = async (formData) => {
  if (!formData.name || !formData.type || formData.x === undefined || formData.y === undefined) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  const data = {
    name: formData.name,
    type: formData.type,
    x: formData.x,
    y: formData.y,
    description: formData.description,
    is_visible: formData.is_visible ? 1 : 0
  };

  try {
    if (isEdit.value) {
      await poiStore.updatePoi(formData.id, data);
      ElMessage.success('更新成功');
    } else {
      await poiStore.createPoi(data);
      ElMessage.success('添加成功');
    }
    closeDialog();
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败');
  }
};

const confirmDelete = (poi) => {
  deleteTarget.value = poi;
  showDeleteConfirm.value = true;
};

const handleDelete = async () => {
  if (deleteTarget.value) {
    try {
      await poiStore.deletePoi(deleteTarget.value.id);
      ElMessage.success('删除成功');
    } catch (error) {
      ElMessage.error('删除失败');
    }
  }
};

// 初始化加载数据
poiStore.fetchAllPois();
</script>

<style scoped>
.poi-manager {
  border: 1px solid #ddd;
 background-color: rgba(254, 254, 254, 0.862);
  width: 360px;
  display: flex;
  flex-direction: column;
  height: 600px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.header h2 {
  margin: 0;
  font-size: 16px;
}

.btn-primary {
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
}
</style>