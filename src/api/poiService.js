import { db } from '@/utils/db';

const poiService = {
  async getList() {
    const result = await db.poi_data.orderBy('id').toArray();
    return result;
  },

  async search(name) {
    if (!name || name.trim() === '') {
      return this.getList();
    }
    const searchPattern = name.trim().toLowerCase();
    const result = await db.poi_data
      .filter(poi => poi.name.toLowerCase().includes(searchPattern))
      .sortBy('name');
    return result;
  },

  async getById(id) {
    const result = await db.poi_data.get(parseInt(id));
    if (!result) {
      throw new Error('未找到该 POI');
    }
    return result;
  },

  async create(data) {
    const { name, type, description, x, y, icon, is_visible } = data;
    
    if (!name || !type || x === undefined || y === undefined) {
      throw new Error('缺少必填字段 (name, type, x, y)');
    }

    const now = new Date().toISOString();
    const maxId = await db.poi_data.orderBy('id').reverse().first();
    const nextId = maxId ? maxId.id + 1 : 1;
    
    const newPoi = {
      id: nextId,
      name,
      type,
      description: description || '',
      x,
      y,
      icon: icon || null,
      is_visible: is_visible !== undefined ? is_visible : 1,
      created_at: now,
      updated_at: now
    };

    await db.poi_data.add(newPoi);

    return {
      message: 'POI 创建成功',
      data: newPoi
    };
  },

  async update(id, data) {
    const existing = await db.poi_data.get(parseInt(id));
    if (!existing) {
      throw new Error('未找到该 POI');
    }

    const updateData = { ...existing };
    const allowedFields = ['name', 'type', 'description', 'x', 'y', 'icon', 'is_visible'];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }
    updateData.updated_at = new Date().toISOString();

    await db.poi_data.put(updateData);

    return {
      message: 'POI 更新成功',
      data: updateData
    };
  },

  async delete(id) {
    const existing = await db.poi_data.get(parseInt(id));
    if (!existing) {
      throw new Error('未找到该 POI');
    }

    await db.poi_data.delete(parseInt(id));

    return {
      message: 'POI 删除成功',
      deletedId: parseInt(id)
    };
  },

  toggleVisibility(id, isVisible) {
    return this.update(id, { is_visible: isVisible ? 1 : 0 });
  }
};

export default poiService;