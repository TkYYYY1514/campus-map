/**
 * POI（兴趣点）配置数据
 * 只保留类型定义和静态配置
 */

// POI 类型配置
export const POI_TYPES = {
  DORMITORY: 'dormitory',
  CLASSROOM: 'classroom',
  ENTRANCE: 'entrance',
  CANTEEN: 'canteen',
  STATUE: 'statue',
  CLINIC: 'clinic',
  SUPERMARKET: 'supermarket',
  PARKING: 'parking',
  TOILET: 'toilet',
  STADIUM: 'stadium',
  WAYPOINT: 'waypoint',     // 🆕 路径点
  OTHER: 'other'
}

// POI 类型标签配置
export const POI_TYPE_LABELS = {
  [POI_TYPES.DORMITORY]: '宿舍',
  [POI_TYPES.CLASSROOM]: '教学楼',
  [POI_TYPES.ENTRANCE]: '进出口',
  [POI_TYPES.CANTEEN]: '食堂',
  [POI_TYPES.STATUE]: '雕像',
  [POI_TYPES.CLINIC]: '医务室',
  [POI_TYPES.SUPERMARKET]: '超市',
  [POI_TYPES.PARKING]: '停车场',
  [POI_TYPES.TOILET]: '卫生间',
  [POI_TYPES.STADIUM]: '体育场',
  [POI_TYPES.WAYPOINT]: '路径点',  // 🆕
  [POI_TYPES.OTHER]: '其他'
}

// POI 类型颜色配置 - 重新分配，更鲜明的区分
export const POI_TYPE_COLORS = {
  [POI_TYPES.DORMITORY]: '#52c41a',      // 宿舍 - 鲜绿色
  [POI_TYPES.CLASSROOM]: '#1677ff',      // 教学楼 - 亮蓝色
  [POI_TYPES.ENTRANCE]: '#faad14',       // 进出口 - 金黄色
  [POI_TYPES.CANTEEN]: '#ff7c43',        // 食堂 - 橙红色
  [POI_TYPES.STATUE]: '#722ed1',         // 雕像 - 紫色
  [POI_TYPES.CLINIC]: '#ff4d4f',         // 医务室 - 红色
  [POI_TYPES.SUPERMARKET]: '#13c2c2',    // 超市 - 青色
  [POI_TYPES.PARKING]: '#fa8c16',        // 停车场 - 橙色
  [POI_TYPES.TOILET]: '#eb2f96',         // 卫生间 - 粉红色
  [POI_TYPES.STADIUM]: '#2f54eb',        // 体育场 - 深蓝色
  [POI_TYPES.WAYPOINT]: '#000000',       // 🆕 路径点 - 黑色
  [POI_TYPES.OTHER]: '#8c8c8c'           // 其他 - 灰色
}