import { db } from '@/utils/db';

const routeService = {
  async getList() {
    const routes = await db.routes.orderBy('id').toArray();
    
    for (const route of routes) {
      const nodes = await db.route_nodes
        .where('route_id')
        .equals(route.id)
        .sortBy('node_order');
      
      const poiIds = nodes.map(n => n.poi_id);
      const pois = await db.poi_data
        .where('id')
        .anyOf(poiIds)
        .toArray();
      
      const poiMap = new Map();
      pois.forEach(p => poiMap.set(p.id, p));
      
      route.nodes = nodes.map(n => ({
        order: n.node_order,
        poi_id: n.poi_id,
        name: poiMap.get(n.poi_id)?.name || '',
        x: poiMap.get(n.poi_id)?.x || 0,
        y: poiMap.get(n.poi_id)?.y || 0
      }));
    }
    
    return routes;
  },

  async getById(id) {
    const route = await db.routes.get(parseInt(id));
    if (!route) {
      throw new Error('未找到该路线');
    }
    
    const nodes = await db.route_nodes
      .where('route_id')
      .equals(route.id)
      .sortBy('node_order');
    
    const poiIds = nodes.map(n => n.poi_id);
    const pois = await db.poi_data
      .where('id')
      .anyOf(poiIds)
      .toArray();
    
    const poiMap = new Map();
    pois.forEach(p => poiMap.set(p.id, p));
    
    route.nodes = nodes.map(n => ({
      order: n.node_order,
      poi_id: n.poi_id,
      name: poiMap.get(n.poi_id)?.name || '',
      x: poiMap.get(n.poi_id)?.x || 0,
      y: poiMap.get(n.poi_id)?.y || 0
    }));
    
    return route;
  },

  async create(data) {
    const { name, description, color, width, style, is_active, nodes } = data;
    
    if (!name) {
      throw new Error('缺少必填字段: name');
    }
    
    if (!nodes || !Array.isArray(nodes) || nodes.length < 2) {
      throw new Error('路线至少需要2个节点');
    }

    const now = new Date().toISOString();
    const maxId = await db.routes.orderBy('id').reverse().first();
    const nextId = maxId ? maxId.id + 1 : 1;
    
    const newRoute = {
      id: nextId,
      name,
      description: description || '',
      color: color || '#1890ff',
      width: width || 3,
      style: style || 'solid',
      is_active: is_active !== undefined ? is_active : 1,
      created_at: now,
      updated_at: now
    };

    await db.routes.add(newRoute);
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const maxNodeId = await db.route_nodes.orderBy('id').reverse().first();
      const nextNodeId = maxNodeId ? maxNodeId.id + 1 : 1;
      await db.route_nodes.add({
        id: nextNodeId,
        route_id: nextId,
        poi_id: node.poi_id,
        node_order: i + 1,
        created_at: now
      });
    }

    return this.getById(nextId);
  },

  async update(id, data) {
    const existing = await db.routes.get(parseInt(id));
    if (!existing) {
      throw new Error('未找到该路线');
    }

    const { name, description, color, width, style, is_active, nodes } = data;
    
    const updateData = { ...existing };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (width !== undefined) updateData.width = width;
    if (style !== undefined) updateData.style = style;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date().toISOString();

    await db.routes.put(updateData);

    if (nodes && Array.isArray(nodes)) {
      if (nodes.length < 2) {
        throw new Error('路线至少需要2个节点');
      }
      
      await db.route_nodes.where('route_id').equals(parseInt(id)).delete();
      
      let maxNodeId = await db.route_nodes.orderBy('id').reverse().first();
      let nextNodeId = maxNodeId ? maxNodeId.id + 1 : 1;
      
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        await db.route_nodes.add({
          id: nextNodeId++,
          route_id: parseInt(id),
          poi_id: node.poi_id,
          node_order: i + 1,
          created_at: new Date().toISOString()
        });
      }
    }

    return this.getById(id);
  },

  async delete(id) {
    const existing = await db.routes.get(parseInt(id));
    if (!existing) {
      throw new Error('未找到该路线');
    }

    await db.route_nodes.where('route_id').equals(parseInt(id)).delete();
    await db.routes.delete(parseInt(id));

    return {
      message: '路线删除成功',
      deletedId: parseInt(id)
    };
  },

  toggleVisibility(id, isVisible) {
    return this.update(id, { is_active: isVisible ? 1 : 0 });
  }
};

export default routeService;