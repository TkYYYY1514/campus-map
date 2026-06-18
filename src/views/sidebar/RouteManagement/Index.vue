<template>
  <div class="route-manager">
    <div class="header">
      <h5>道路管理</h5>
      <el-button class="btn-primary" @click="openCreateDialog">+ 新增路线</el-button>
    </div>

    <!-- 工具栏 -->
    <RouteToolbar 
      :total="filteredRoutes.length"
      @search="handleSearch"
      @filter-change="handleStatusFilterChange"
    />

    <!-- 路线列表 -->
    <RouteList 
      :routes="filteredRoutes"
      :network-connections-count="networkConnectionsCount"
      :network-visible="mapStore.showNetwork"
      :network-style="mapStore.networkStyle"
      @edit="openEditDialog"
      @delete="confirmDelete"
      @toggle-visibility="handleToggleVisibility"
      @toggle-network="handleToggleNetwork"
      @edit-network="handleEditNetworkStyle"
    />

    <!-- 路线表单弹窗 -->
    <RouteFormDialog
      v-model:visible="showDialog"
      :is-edit="isEdit"
      :form-data="form"
      @submit="submitForm"
      @close="closeDialog"
    />

    <!-- 路网样式编辑弹窗 -->
    <NetworkStyleDialog
      v-model:visible="showNetworkDialog"
      :current-style="mapStore.networkStyle"
      @success="handleNetworkStyleSuccess"
    />

    <!-- 删除确认 -->
    <RouteDeleteConfirm
      v-model:visible="showDeleteConfirm"
      :route-name="deleteTarget?.name"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouteStore } from '@/stores/routeStore';
import { useRoadNetworkStore } from '@/stores/roadNetworkStore';
import { useMapStore } from '@/stores/mapStore';
import { ElMessage } from 'element-plus';
import RouteList from './components/RouteList.vue';
import RouteFormDialog from './components/RouteFormDialog.vue';
import RouteDeleteConfirm from './components/RouteDeleteConfirm.vue';
import RouteToolbar from './components/RouteToolbar.vue';
import NetworkStyleDialog from './components/NetworkStyleDialog.vue';

const routeStore = useRouteStore();
const roadNetworkStore = useRoadNetworkStore();
const mapStore = useMapStore();

// 搜索关键词
const searchKeyword = ref('');

// 状态筛选
const statusFilter = ref('all');

const showNetworkDialog = ref(false);

// 路网连接数量
const networkConnectionsCount = computed(() => roadNetworkStore.connections.length);

// 根据状态筛选
const filteredByStatus = computed(() => {
  if (statusFilter.value === 'all') {
    return routeStore.routes;
  }
  return routeStore.routes.filter(route => {
    if (statusFilter.value === 'active') {
      return route.is_active === 1;
    }
    return route.is_active === 0;
  });
});

// 根据关键词筛选
const filteredRoutes = computed(() => {
  if (!searchKeyword.value.trim()) {
    return filteredByStatus.value;
  }
  const keyword = searchKeyword.value.toLowerCase().trim();
  return filteredByStatus.value.filter(route => {
    return (
      route.name.toLowerCase().includes(keyword) ||
      (route.description && route.description.toLowerCase().includes(keyword))
    );
  });
});

// 处理搜索
const handleSearch = (keyword) => {
  searchKeyword.value = keyword;
};

// 处理状态筛选
const handleStatusFilterChange = (filter) => {
  statusFilter.value = filter;
};

// 弹窗状态
const showDialog = ref(false);
const isEdit = ref(false);
const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);

const form = reactive({
  id: null,
  name: '',
  description: '',
  color: '#1890ff',
  width: 3,
  style: 'solid',
  nodes: [],
  is_active: 1
});

// 编辑路网样式
const handleEditNetworkStyle = () => {
  showNetworkDialog.value = true;
};

// 路网样式保存成功
const handleNetworkStyleSuccess = (newStyle) => {
  mapStore.setNetworkStyle(newStyle);
  ElMessage.success('路网样式已更新');
};

// 切换路网显隐
const handleToggleNetwork = (visible) => {
  mapStore.setShowNetwork(visible);
};

const openCreateDialog = () => {
  isEdit.value = false;
  Object.assign(form, {
    id: null,
    name: '',
    description: '',
    color: '#1890ff',
    width: 3,
    style: 'solid',
    nodes: [],
    is_active: 1
  });
  showDialog.value = true;
};

const openEditDialog = (route) => {
  isEdit.value = true;
  Object.assign(form, {
    id: route.id,
    name: route.name,
    description: route.description || '',
    color: route.color,
    width: route.width,
    style: route.style,
    nodes: [...(route.nodes || [])],
    is_active: route.is_active
  });
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const submitForm = async (formData) => {
  if (!formData.name) {
    ElMessage.warning('请填写路线名称');
    return;
  }

  const data = {
    name: formData.name,
    description: formData.description,
    color: formData.color,
    width: formData.width,
    style: formData.style,
    nodes: formData.nodes,
    is_active: formData.is_active
  };

  try {
    if (isEdit.value) {
      await routeStore.updateRoute(formData.id, data);
      ElMessage.success('更新成功');
    } else {
      await routeStore.createRoute(data);
      ElMessage.success('添加成功');
    }
    closeDialog();
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败');
  }
};

const confirmDelete = (route) => {
  deleteTarget.value = route;
  showDeleteConfirm.value = true;
};

const handleDelete = async () => {
  if (deleteTarget.value) {
    try {
      await routeStore.deleteRoute(deleteTarget.value.id);
      ElMessage.success('删除成功');
    } catch (error) {
      ElMessage.error('删除失败');
    }
  }
};

const handleToggleVisibility = async (route) => {
  console.log('切换路线:', route.name, '当前状态:', route.is_active);
  try {
    const newStatus = route.is_active === 1 ? 1 : 0;
    await routeStore.toggleRouteVisibility(route.id, newStatus);
    ElMessage.success(route.is_active === 1 ? '已显示' : '已隐藏');
  } catch (error) {
    console.error('切换失败:', error);
    ElMessage.error('操作失败');
  }
};

// 加载数据
onMounted(async () => {
  await routeStore.fetchAllRoutes();
  await roadNetworkStore.fetchNetwork();
});
</script>

<style scoped>
.route-manager {
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