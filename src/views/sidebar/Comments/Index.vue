<template>
  <div class="poi-manager">
    <!-- 建筑列表视图 -->
    <div v-if="!showDetail" class="list-view">
      <div class="header">
        <h5>建筑搜索</h5>
      </div>

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
        @detail="handleDetail"
      />
    </div>

    <!-- 建筑评价详情视图 -->
    <BuildingDetail 
      v-else
      :building="selectedBuilding"
      @back="showDetail = false"
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
import BuildingDetail from './components/BuildingDetail.vue';
import showDialog from '@/components/Dialog/Dialog.js';
import Nh from '@/components/Nh.vue';

const poiStore = usePoiStore();
const mapStore = useMapStore();

// 视图切换
const showDetail = ref(false);
const selectedBuilding = ref(null);

// 搜索关键词
const searchKeyword = ref('');

// 选中的类型
const selectedTypes = ref([]);

// 获取非路径点的 POI
const normalPois = computed(() => {
  return poiStore.pois.filter(poi => poi.type !== 'waypoint');
});

// 按类型过滤
const filteredByType = computed(() => {
  if (selectedTypes.value.length === 0) {
    return normalPois.value;
  }
  return normalPois.value.filter(poi => selectedTypes.value.includes(poi.type));
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

// 处理定位：居中 + 弹出 Nh 信息窗
const handleLocatePoi = (poi) => {
  if (mapStore.centerOnPoi) {
    mapStore.centerOnPoi(poi);
    setTimeout(() => {
      showDialog(
        { 
          right: 250,
          title: poi.name,
          draggable: true 
        }, 
        Nh, 
        { poi }, 
        'clearAllAndShow'
      );
    }, 300);
  } else {
    console.error('地图组件未加载或 centerOnPoi 方法不存在');
  }
};

// 🆕 打开建筑评价详情
const handleDetail = (poi) => {
  selectedBuilding.value = poi;
  showDetail.value = true;
};

// 表单弹窗相关
const dialogVisible = ref(false);
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
  dialogVisible.value = true;
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
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
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

.list-view,
.detail-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 10px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.header h5 {
  margin: 0;
  font-size: 16px;
}

.btn-primary {
  font-size: 12px;
  padding: 0px 5px;
  cursor: pointer;
}
</style>