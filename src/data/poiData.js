/**
 * POI（兴趣点）配置数据
 * 用于存储地图上的点位信息，后续可改为从后端 API 获取
 */

/**
 * POI 类型定义
 * @typedef {Object} PoiItem
 * @property {number|string} id - POI 唯一标识
 * @property {number} x - 在原图上的 X 坐标
 * @property {number} y - 在原图上的 Y 坐标
 * @property {string} name - 名称
 * @property {string} type - 类型
 * @property {string} [description] - 描述信息
 * @property {string} [icon] - 自定义图标路径
 * @property {boolean} [isVisible] - 是否可见
 */

/**
 * POI 类型配置
 */
export const POI_TYPES = {
  DORMITORY: 'dormitory',    // 宿舍
  CLASSROOM: 'classroom',    // 教学楼
  ENTRANCE: 'entrance',      // 进出口
  CANTEEN: 'canteen',        // 食堂
  STATUE: 'statue',          // 雕像
  CLINIC: 'clinic',          // 医务室
  SUPERMARKET: 'supermarket',// 超市
  PARKING: 'parking',        // 停车场
  TOILET: 'toilet',          // 卫生间
  STADIUM: 'stadium'         // 体育场
}

/**
 * POI 类型标签配置
 */
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
  [POI_TYPES.STADIUM]: '体育场'
}

/**
 * POI 类型颜色配置（用于标记点颜色）
 */
export const POI_TYPE_COLORS = {
  [POI_TYPES.DORMITORY]: '#67c23a',    // 绿色
  [POI_TYPES.CLASSROOM]: '#409eff',    // 蓝色
  [POI_TYPES.ENTRANCE]: '#909399',     // 灰色
  [POI_TYPES.CANTEEN]: '#e6a23c',      // 橙色
  [POI_TYPES.STATUE]: '#b37feb',       // 紫色
  [POI_TYPES.CLINIC]: '#f56c6c',       // 红色
  [POI_TYPES.SUPERMARKET]: '#54a0ff',  // 天蓝
  [POI_TYPES.PARKING]: '#ff9f43',      // 深橙
  [POI_TYPES.TOILET]: '#5f27cd',       // 深紫
  [POI_TYPES.STADIUM]: '#00d2d3'       // 青蓝
}

/**
 * POI 点位数据
 * 坐标基于原图尺寸 (3000 x 1600)
 */
export const POI_DATA = [
  // === 教学楼 ===
  { id: 1, x: 1200, y: 800, name: '第一教学楼', type: POI_TYPES.CLASSROOM, description: '主要教学建筑' },
  { id: 2, x: 2000, y: 600, name: '第二教学楼', type: POI_TYPES.CLASSROOM, description: '理工科教学楼' },
  { id: 3, x: 2500, y: 700, name: '实验楼', type: POI_TYPES.CLASSROOM, description: '科学实验中心' },
  { id: 4, x: 500, y: 400, name: '图书馆', type: POI_TYPES.CLASSROOM, description: '校园主图书馆，藏书丰富' },
  
  // === 宿舍 ===
  { id: 5, x: 600, y: 1400, name: '一号宿舍楼', type: POI_TYPES.DORMITORY, description: '男生宿舍区' },
  { id: 6, x: 900, y: 1400, name: '二号宿舍楼', type: POI_TYPES.DORMITORY, description: '女生宿舍区' },
  
  // === 食堂 ===
  { id: 7, x: 800, y: 1200, name: '学生食堂', type: POI_TYPES.CANTEEN, description: '提供各类美食' },
  
  // === 超市 ===
  { id: 8, x: 1100, y: 1300, name: '校园超市', type: POI_TYPES.SUPERMARKET, description: '校园便利店' },
  
  // === 体育场 ===
  { id: 9, x: 1800, y: 1300, name: '体育馆', type: POI_TYPES.STADIUM, description: '室内运动场馆' },
  { id: 10, x: 2100, y: 1400, name: '足球场', type: POI_TYPES.STADIUM, description: '标准足球场' },
  { id: 11, x: 2300, y: 1300, name: '篮球场', type: POI_TYPES.STADIUM, description: '室外篮球场' },
  
  // === 进出口 ===
  { id: 12, x: 1500, y: 300, name: '主校门', type: POI_TYPES.ENTRANCE, description: '学校主要出入口' },
  { id: 13, x: 300, y: 800, name: '西门', type: POI_TYPES.ENTRANCE, description: '西侧出入口' },
  { id: 14, x: 2700, y: 800, name: '东门', type: POI_TYPES.ENTRANCE, description: '东侧出入口' },
  
  // === 雕像 ===
  { id: 15, x: 1500, y: 800, name: '校徽雕像', type: POI_TYPES.STATUE, description: '校园标志性雕塑' },
  { id: 16, x: 1300, y: 500, name: '名人雕像', type: POI_TYPES.STATUE, description: '校园景观雕像' },
  
  // === 医务室 ===
  { id: 17, x: 700, y: 1000, name: '校医务室', type: POI_TYPES.CLINIC, description: '校园医疗服务中心' },
  
  // === 停车场 ===
  { id: 18, x: 2600, y: 1500, name: '地下停车场', type: POI_TYPES.PARKING, description: '校园停车场' },
  { id: 19, x: 400, y: 1500, name: '地面停车场', type: POI_TYPES.PARKING, description: '地面停车场' },
  
  // === 卫生间 ===
  { id: 20, x: 1400, y: 700, name: '教学楼卫生间', type: POI_TYPES.TOILET, description: '教学楼公共卫生间' },
  { id: 21, x: 1600, y: 1200, name: '操场卫生间', type: POI_TYPES.TOILET, description: '操场附近卫生间' }
]

/**
 * 根据类型获取 POI 列表
 * @param {string} type - POI 类型
 * @returns {PoiItem[]} 匹配的 POI 列表
 */
export function getPoisByType(type) {
  return POI_DATA.filter(poi => poi.type === type)
}

/**
 * 根据 ID 获取 POI
 * @param {number|string} id - POI 唯一标识
 * @returns {PoiItem|undefined} 匹配的 POI
 */
export function getPoiById(id) {
  return POI_DATA.find(poi => poi.id === id)
}

/**
 * 获取所有 POI 类型统计
 * @returns {Object} 各类型数量统计
 */
export function getPoiTypeStats() {
  const stats = {}
  Object.values(POI_TYPES).forEach(type => {
    stats[type] = POI_DATA.filter(poi => poi.type === type).length
  })
  return stats
}
