import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import routeService from '@/api/routeService';

export const useRouteStore = defineStore('route', () => {
  // 路线列表
  const routes = ref([]);
  
  // 当前选中的路线（用于高亮）
  const selectedRoute = ref(null);
  
  // 加载状态
  const isLoading = ref(false);
  const error = ref(null);

  // 从后端加载所有路线
  const fetchAllRoutes = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await routeService.getList();
      routes.value = data;
      return data;
    } catch (err) {
      error.value = err.message || '加载路线失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 创建路线
  const createRoute = async (data) => {
    isLoading.value = true;
    error.value = null;
    try {
      const requestData = {
        name: data.name,
        description: data.description || '',
        color: data.color || '#1890ff',
        width: data.width || 3,
        style: data.style || 'solid',
        is_active: data.is_active !== undefined ? data.is_active : 1,
        nodes: data.nodes.map(node => ({
          poi_id: node.poi_id
        }))
      };
      
      const result = await routeService.create(requestData);
      await fetchAllRoutes();
      return result;
    } catch (err) {
      error.value = err.message || '创建路线失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新路线
  const updateRoute = async (id, updates) => {
    isLoading.value = true;
    error.value = null;
    try {
      const requestData = {};
      
      if (updates.name !== undefined) requestData.name = updates.name;
      if (updates.description !== undefined) requestData.description = updates.description;
      if (updates.color !== undefined) requestData.color = updates.color;
      if (updates.width !== undefined) requestData.width = updates.width;
      if (updates.style !== undefined) requestData.style = updates.style;
      if (updates.is_active !== undefined) requestData.is_active = updates.is_active;
      
      if (updates.nodes !== undefined) {
        requestData.nodes = updates.nodes.map(node => ({
          poi_id: node.waypoint_id || node.poi_id
        }));
      }
      
      const result = await routeService.update(id, requestData);
      await fetchAllRoutes();
      return result;
    } catch (err) {
      error.value = err.message || '更新路线失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 删除路线
  const deleteRoute = async (id) => {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await routeService.delete(id);
      await fetchAllRoutes();
      if (selectedRoute.value?.id === id) {
        selectedRoute.value = null;
      }
      return result;
    } catch (err) {
      error.value = err.message || '删除路线失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 🆕 选中路线（用于高亮）
  const selectRoute = (route) => {
    selectedRoute.value = route;
  };

  // 🆕 清除选中的路线
  const clearSelectedRoute = () => {
    selectedRoute.value = null;
  };

  // 添加节点到路线
  const addNodeToRoute = (routeId, waypointId) => {
    const route = routes.value.find(r => r.id === routeId);
    if (route) {
      const order = (route.nodes?.length || 0) + 1;
      const newNode = { 
        poi_id: waypointId, 
        waypoint_id: waypointId,
        order 
      };
      if (!route.nodes) route.nodes = [];
      route.nodes.push(newNode);
      return route;
    }
    return null;
  };

  // 从路线中移除节点
  const removeNodeFromRoute = (routeId, nodeIndex) => {
    const route = routes.value.find(r => r.id === routeId);
    if (route && route.nodes && nodeIndex >= 0 && nodeIndex < route.nodes.length) {
      route.nodes.splice(nodeIndex, 1);
      route.nodes.forEach((node, idx) => {
        node.order = idx + 1;
      });
      return route;
    }
    return null;
  };

  // 移动节点顺序
  const moveNodeOrder = (routeId, nodeIndex, direction) => {
    const route = routes.value.find(r => r.id === routeId);
    if (!route || !route.nodes) return null;
    
    const newIndex = direction === 'up' ? nodeIndex - 1 : nodeIndex + 1;
    if (newIndex < 0 || newIndex >= route.nodes.length) return null;
    
    [route.nodes[nodeIndex], route.nodes[newIndex]] = 
    [route.nodes[newIndex], route.nodes[nodeIndex]];
    
    route.nodes.forEach((node, idx) => {
      node.order = idx + 1;
    });
    
    return route;
  };

  // 切换路线显示/隐藏
  const toggleRouteVisibility = async (id, newStatus) => {
    try {
      const result = await routeService.update(id, { is_active: newStatus });
      
      if (result.data) {
        const index = routes.value.findIndex(r => r.id === id);
        if (index !== -1) {
          routes.value[index] = result.data;
        }
      }
      
      return result;
    } catch (err) {
      error.value = err.message || '切换显示状态失败';
      throw err;
    }
  };

  // 获取所有激活的路线
  const activeRoutes = computed(() => {
    return routes.value.filter(r => r.is_active === 1);
  });

  // 获取选中的路线ID（用于地图高亮）
  const selectedRouteId = computed(() => {
    return selectedRoute.value?.id || null;
  });

  return {
    routes,
    selectedRoute,
    selectedRouteId,  // 🆕 导出选中的路线ID
    activeRoutes,
    isLoading,
    error,
    fetchAllRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    addNodeToRoute,
    removeNodeFromRoute,
    moveNodeOrder,
    selectRoute,        // 🆕 导出
    clearSelectedRoute, // 🆕 导出
    toggleRouteVisibility
  };
});