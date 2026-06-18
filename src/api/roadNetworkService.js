import { db, euclideanDistance, findNearestWaypoint, getMultipleRoutes } from '@/utils/db';

const roadNetworkService = {
  async getAll() {
    const connections = await db.road_network.orderBy('id').toArray();
    
    const poiIds = new Set();
    connections.forEach(c => {
      poiIds.add(c.from_poi_id);
      poiIds.add(c.to_poi_id);
    });
    
    const pois = await db.poi_data
      .where('id')
      .anyOf([...poiIds])
      .toArray();
    
    const poiMap = new Map();
    pois.forEach(p => poiMap.set(p.id, p));
    
    return connections.map(c => ({
      id: c.id,
      from_poi_id: c.from_poi_id,
      to_poi_id: c.to_poi_id,
      distance: c.distance,
      from_name: poiMap.get(c.from_poi_id)?.name || '',
      from_x: poiMap.get(c.from_poi_id)?.x || 0,
      from_y: poiMap.get(c.from_poi_id)?.y || 0,
      to_name: poiMap.get(c.to_poi_id)?.name || '',
      to_x: poiMap.get(c.to_poi_id)?.x || 0,
      to_y: poiMap.get(c.to_poi_id)?.y || 0
    }));
  },

  async getFrom(poiId) {
    const connections = await db.road_network
      .where('from_poi_id')
      .equals(parseInt(poiId))
      .toArray();
    
    const toIds = connections.map(c => c.to_poi_id);
    const pois = await db.poi_data
      .where('id')
      .anyOf(toIds)
      .toArray();
    
    const poiMap = new Map();
    pois.forEach(p => poiMap.set(p.id, p));
    
    return connections.map(c => ({
      to_poi_id: c.to_poi_id,
      distance: c.distance,
      to_name: poiMap.get(c.to_poi_id)?.name || '',
      to_x: poiMap.get(c.to_poi_id)?.x || 0,
      to_y: poiMap.get(c.to_poi_id)?.y || 0
    }));
  },

  async getTo(poiId) {
    const connections = await db.road_network
      .where('to_poi_id')
      .equals(parseInt(poiId))
      .toArray();
    
    const fromIds = connections.map(c => c.from_poi_id);
    const pois = await db.poi_data
      .where('id')
      .anyOf(fromIds)
      .toArray();
    
    const poiMap = new Map();
    pois.forEach(p => poiMap.set(p.id, p));
    
    return connections.map(c => ({
      from_poi_id: c.from_poi_id,
      distance: c.distance,
      from_name: poiMap.get(c.from_poi_id)?.name || '',
      from_x: poiMap.get(c.from_poi_id)?.x || 0,
      from_y: poiMap.get(c.from_poi_id)?.y || 0
    }));
  },

  async create(data) {
    const { from_poi_id, to_poi_id, distance } = data;
    
    if (!from_poi_id || !to_poi_id) {
      throw new Error('缺少必填字段: from_poi_id, to_poi_id');
    }
    
    const fromCheck = await db.poi_data.get(parseInt(from_poi_id));
    const toCheck = await db.poi_data.get(parseInt(to_poi_id));
    
    if (!fromCheck || !toCheck) {
      throw new Error('路径点不存在');
    }
    
    const existing = await db.road_network
      .where('[from_poi_id+to_poi_id]')
      .equals([parseInt(from_poi_id), parseInt(to_poi_id)])
      .toArray();
    
    if (existing.length > 0) {
      throw new Error('连接已存在');
    }
    
    let finalDistance = distance;
    if (!finalDistance) {
      finalDistance = Math.round(
        Math.sqrt(Math.pow(toCheck.x - fromCheck.x, 2) + Math.pow(toCheck.y - fromCheck.y, 2))
      );
    }

    const now = new Date().toISOString();
    const maxId = await db.road_network.orderBy('id').reverse().first();
    const nextId = maxId ? maxId.id + 1 : 1;
    
    const newConnection = {
      id: nextId,
      from_poi_id: parseInt(from_poi_id),
      to_poi_id: parseInt(to_poi_id),
      distance: finalDistance,
      created_at: now,
      updated_at: now
    };

    await db.road_network.add(newConnection);

    return {
      message: '连接添加成功',
      data: { id: nextId, from_poi_id, to_poi_id, distance: finalDistance }
    };
  },

  async delete(id) {
    const existing = await db.road_network.get(parseInt(id));
    if (!existing) {
      throw new Error('连接不存在');
    }

    await db.road_network.delete(parseInt(id));

    return {
      message: '连接删除成功',
      deletedId: parseInt(id)
    };
  },

  async deleteByEndpoints(fromId, toId) {
    await db.road_network
      .where('[from_poi_id+to_poi_id]')
      .equals([parseInt(fromId), parseInt(toId)])
      .delete();

    return {
      message: '连接删除成功',
      from: parseInt(fromId),
      to: parseInt(toId)
    };
  },

  async getShortestPath(startPoiId = null, endPoiId = null, startX = null, startY = null, endX = null, endY = null) {
    let startXCoord, startYCoord, startName = null;
    if (startPoiId) {
      const startPoi = await db.poi_data.get(parseInt(startPoiId));
      if (!startPoi) {
        throw new Error('起点POI不存在');
      }
      startXCoord = startPoi.x;
      startYCoord = startPoi.y;
      startName = startPoi.name;
    } else if (startX !== null && startY !== null) {
      startXCoord = startX;
      startYCoord = startY;
      startName = `坐标(${Math.round(startX)}, ${Math.round(startY)})`;
    } else {
      throw new Error('缺少起点信息');
    }

    let endXCoord, endYCoord, endName = null;
    if (endPoiId) {
      const endPoi = await db.poi_data.get(parseInt(endPoiId));
      if (!endPoi) {
        throw new Error('终点POI不存在');
      }
      endXCoord = endPoi.x;
      endYCoord = endPoi.y;
      endName = endPoi.name;
    } else if (endX !== null && endY !== null) {
      endXCoord = endX;
      endYCoord = endY;
      endName = `坐标(${Math.round(endX)}, ${Math.round(endY)})`;
    } else {
      throw new Error('缺少终点信息');
    }

    const waypoints = await db.poi_data.where('type').equals('waypoint').toArray();
    
    if (waypoints.length === 0) {
      throw new Error('没有路径点');
    }

    const { nearest: nearestStart, distance: startDistance } = findNearestWaypoint(startXCoord, startYCoord, waypoints);
    const { nearest: nearestEnd, distance: endDistance } = findNearestWaypoint(endXCoord, endYCoord, waypoints);

    const connections = await db.road_network.toArray();
    
    if (connections.length === 0) {
      throw new Error('路网数据为空');
    }

    const graph = {};
    connections.forEach(conn => {
      if (!graph[conn.from_poi_id]) {
        graph[conn.from_poi_id] = [];
      }
      graph[conn.from_poi_id].push({
        to: conn.to_poi_id,
        distance: conn.distance
      });
    });

    const paths = getMultipleRoutes(nearestStart.id, nearestEnd.id, graph, 3);

    if (paths.length === 0) {
      throw new Error('无法找到路径');
    }

    const waypointMap = new Map();
    waypoints.forEach(wp => {
      waypointMap.set(wp.id, wp);
    });

    const routes = paths.map(path => {
      const pathWaypoints = path.nodes.map(id => waypointMap.get(id));
      let totalDistance = startDistance + endDistance;
      for (let i = 0; i < pathWaypoints.length - 1; i++) {
        if (pathWaypoints[i] && pathWaypoints[i + 1]) {
          totalDistance += euclideanDistance(pathWaypoints[i], pathWaypoints[i + 1]);
        }
      }
      return {
        pathIds: path.nodes,
        pathNames: pathWaypoints.filter(wp => wp).map(wp => wp.name),
        waypoints: pathWaypoints.filter(wp => wp),
        totalDistance: Math.round(totalDistance),
        steps: pathWaypoints.filter(wp => wp).length
      };
    });

    return {
      success: true,
      data: {
        start: {
          name: startName,
          x: startXCoord,
          y: startYCoord
        },
        end: {
          name: endName,
          x: endXCoord,
          y: endYCoord
        },
        nearestStartWaypoint: {
          id: nearestStart.id,
          name: nearestStart.name,
          distance: Math.round(startDistance)
        },
        nearestEndWaypoint: {
          id: nearestEnd.id,
          name: nearestEnd.name,
          distance: Math.round(endDistance)
        },
        routes: routes,
        routeCount: routes.length
      }
    };
  }
};

export default roadNetworkService;