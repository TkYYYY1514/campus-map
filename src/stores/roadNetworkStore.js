// src/stores/roadNetworkStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import roadNetworkService from '@/api/roadNetworkService';
import { ElMessage } from 'element-plus';

export const useRoadNetworkStore = defineStore('roadNetwork', () => {
  // 所有连接
  const connections = ref([]);
  
  // 加载状态
  const isLoading = ref(false);
  const error = ref(null);
  
  // 构建邻接表（用于快速寻路）
  const adjacencyList = computed(() => {
    const list = {};
    connections.value.forEach(conn => {
      if (!list[conn.from_poi_id]) {
        list[conn.from_poi_id] = [];
      }
      list[conn.from_poi_id].push({
        to: conn.to_poi_id,
        distance: conn.distance,
        id: conn.id
      });
    });
    return list;
  });
  
  // 获取某点的所有邻居
  const getNeighbors = (poiId) => {
    return adjacencyList.value[poiId] || [];
  };
  
  // 加载所有路网数据
  const fetchNetwork = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await roadNetworkService.getAll();
      connections.value = data;
      return data;
    } catch (err) {
      error.value = err.message || '加载路网失败';
      console.error('加载路网失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  // 获取某点的所有连接
  const getConnectionsForPoint = async (poiId) => {
    try {
      const data = await roadNetworkService.getFrom(poiId);
      return data;
    } catch (err) {
      console.error('获取连接失败:', err);
      return [];
    }
  };
  
  // 添加连接（双向）
  const addBidirectionalConnection = async (fromId, toId, distance = null) => {
    try {
      // 计算距离（如果没有提供）
      let finalDistance = distance;
      if (!finalDistance) {
        // 需要从 poiStore 获取坐标
        const { usePoiStore } = await import('@/stores/poiStore');
        const poiStore = usePoiStore();
        const from = poiStore.pois.find(p => p.id === fromId);
        const to = poiStore.pois.find(p => p.id === toId);
        if (from && to) {
          finalDistance = Math.round(Math.hypot(to.x - from.x, to.y - from.y));
        } else {
          finalDistance = 100;
        }
      }
      
      // 添加双向连接
      await Promise.all([
        roadNetworkService.create({ from_poi_id: fromId, to_poi_id: toId, distance: finalDistance }),
        roadNetworkService.create({ from_poi_id: toId, to_poi_id: fromId, distance: finalDistance })
      ]);
      
      await fetchNetwork();
      ElMessage.success('连接添加成功');
    } catch (err) {
      console.error('添加连接失败:', err);
      ElMessage.error('添加连接失败');
      throw err;
    }
  };
  
  // 添加单向连接
  const addConnection = async (fromId, toId, distance = null) => {
    try {
      let finalDistance = distance;
      if (!finalDistance) {
        const { usePoiStore } = await import('@/stores/poiStore');
        const poiStore = usePoiStore();
        const from = poiStore.pois.find(p => p.id === fromId);
        const to = poiStore.pois.find(p => p.id === toId);
        if (from && to) {
          finalDistance = Math.round(Math.hypot(to.x - from.x, to.y - from.y));
        } else {
          finalDistance = 100;
        }
      }
      
      const result = await roadNetworkService.create({ 
        from_poi_id: fromId, 
        to_poi_id: toId, 
        distance: finalDistance 
      });
      
      await fetchNetwork();
      return result;
    } catch (err) {
      console.error('添加连接失败:', err);
      throw err;
    }
  };
  
  // 删除连接（双向）
  const deleteBidirectionalConnection = async (fromId, toId) => {
    try {
      await Promise.all([
        roadNetworkService.deleteByEndpoints(fromId, toId),
        roadNetworkService.deleteByEndpoints(toId, fromId)
      ]);
      await fetchNetwork();
      ElMessage.success('连接删除成功');
    } catch (err) {
      console.error('删除连接失败:', err);
      ElMessage.error('删除连接失败');
      throw err;
    }
  };
  
  // 删除单向连接
  const deleteConnection = async (fromId, toId) => {
    try {
      await roadNetworkService.deleteByEndpoints(fromId, toId);
      await fetchNetwork();
    } catch (err) {
      console.error('删除连接失败:', err);
      throw err;
    }
  };
  
  // 删除某点的所有连接
  const deleteAllConnectionsForPoint = async (poiId) => {
    try {
      const conns = connections.value.filter(c => c.from_poi_id === poiId || c.to_poi_id === poiId);
      for (const conn of conns) {
        await roadNetworkService.deleteByEndpoints(conn.from_poi_id, conn.to_poi_id);
      }
      await fetchNetwork();
      ElMessage.success(`已删除 ${conns.length} 条连接`);
    } catch (err) {
      console.error('删除连接失败:', err);
      ElMessage.error('删除连接失败');
      throw err;
    }
  };
  
  // 检查两点是否已连接
  const isConnected = (fromId, toId) => {
    return connections.value.some(c => c.from_poi_id === fromId && c.to_poi_id === toId);
  };
  
  // 获取两点之间的距离
  const getDistance = (fromId, toId) => {
    const conn = connections.value.find(c => c.from_poi_id === fromId && c.to_poi_id === toId);
    return conn ? conn.distance : null;
  };
  
  return {
    connections,
    adjacencyList,
    isLoading,
    error,
    fetchNetwork,
    getConnectionsForPoint,
    getNeighbors,
    addBidirectionalConnection,
    addConnection,
    deleteBidirectionalConnection,
    deleteConnection,
    deleteAllConnectionsForPoint,
    isConnected,
    getDistance
  };
});