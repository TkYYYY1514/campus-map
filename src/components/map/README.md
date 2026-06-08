# 地图组件操作手册

## 概述

本目录包含校园地图相关的组件和工具，采用 Vue 3 Composition API + Pinia 状态管理实现。

## 文件结构

```
map/
├── README.md                    # 本操作手册
├── MapBackground.vue            # 地图背景组件（主组件）
├── PoiMarker.vue               # POI标记点组件
└── composables/                 # 组合式函数
    ├── useMapTransform.js       # 地图变换逻辑（拖拽、缩放）
    ├── useMapTooltip.js         # 悬浮坐标卡片
    ├── useMapEvents.js          # 地图事件处理（鼠标/滚轮）
    └── usePoiHandlers.js        # POI事件处理（点击/悬停）
```

## 核心组件

### 1. MapBackground.vue

地图背景主组件，提供地图显示、交互和POI管理功能。

#### 基本用法

```vue
<template>
  <MapBackground
    @map-click="handleMapClick"
    @poi-click="handlePoiClick"
    @poi-hover="handlePoiHover"
    ref="mapRef"
  />
</template>

<script setup>
import MapBackground from '@/components/map/MapBackground.vue'

const mapRef = ref(null)

const handleMapClick = ({ x, y }) => {
  console.log('地图点击位置:', x, y)
}

const handlePoiClick = (poi) => {
  console.log('POI点击:', poi)
}

const handlePoiHover = (poi) => {
  console.log('POI悬停:', poi)
}
</script>
```

#### 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| `map-click` | 点击地图空白区域 | `{ x, y }` - 原图坐标 |
| `poi-click` | 点击POI标记点 | `poi` - POI对象 |
| `poi-hover` | 鼠标悬停在POI上 | `poi` - POI对象 |
| `poi-leave` | 鼠标离开POI | `poi` - POI对象 |

#### 暴露的接口

```javascript
const mapRef = ref(null)

// 获取地图缩放比例
mapRef.value.scale

// 获取地图偏移量
mapRef.value.offsetX
mapRef.value.offsetY

// POI Store
mapRef.value.poiStore
```

### 2. PoiMarker.vue

POI标记点组件，用于在地图上显示兴趣点标记。

#### 基本用法

```vue
<PoiMarker
  :poi="poi"
  :scale="scale"
  :isActive="false"
  :showLabel="true"
  @click="handleClick"
  @hover="handleHover"
  @leave="handleLeave"
/>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `poi` | Object | required | POI数据对象 |
| `scale` | Number | 1 | 当前地图缩放比例 |
| `isActive` | Boolean | false | 是否处于选中状态 |
| `showLabel` | Boolean | false | 是否显示名称标签 |

#### POI对象结构

```javascript
{
  id: 1,                    // 唯一标识
  x: 500,                   // 原图X坐标
  y: 400,                   // 原图Y坐标
  name: '图书馆',           // 名称
  type: 'building',         // 类型
  description: '描述信息'   // 可选描述
}
```

#### 类型说明

| 类型 | 值 | 颜色 | 说明 |
|------|-----|------|------|
| 建筑 | `building` | 绿色 | 教学楼、图书馆、食堂等 |
| 人物 | `npc` | 橙色 | NPC角色 |
| 传送点 | `teleport` | 灰色 | 校门、出入口 |
| 地标 | `landmark` | 红色 | 广场、湖泊等 |

## Composables 说明

### useMapTransform

地图变换逻辑，处理拖拽、缩放和边界限制。

```javascript
const {
  scale,           // 缩放比例
  offsetX,         // X偏移
  offsetY,         // Y偏移
  isDragging,      // 是否拖拽中
  wrapperStyle,    // 地图容器样式
  startDrag,       // 开始拖拽
  continueDrag,    // 继续拖拽
  endDrag,         // 结束拖拽
  onWheel          // 滚轮缩放
} = useMapTransform({
  IMAGE_WIDTH: 3000,
  IMAGE_HEIGHT: 1600,
  mapContainerRef: mapContainer
})
```

### useMapTooltip

悬浮坐标卡片，显示鼠标在原图上的坐标。

```javascript
const {
  showTooltip,     // 是否显示
  tooltipX,        // 卡片X位置
  tooltipY,        // 卡片Y位置
  currentMapX,     // 当前原图X坐标
  currentMapY,     // 当前原图Y坐标
  updateTooltip,   // 更新位置
  hideTooltip      // 隐藏卡片
} = useMapTooltip({
  mapContainerRef: mapContainer,
  scale,
  offsetX,
  offsetY
})
```

## Pinia Store

### poiStore

POI状态管理Store，用于全局管理POI数据。

#### 状态

```javascript
import { usePoiStore } from '@/stores/poiStore'

const poiStore = usePoiStore()

// POI列表
poiStore.pois

// 当前选中的POI
poiStore.selectedPoi

// 加载状态
poiStore.isLoading

// 错误信息
poiStore.error
```

#### 方法

| 方法 | 说明 | 参数 |
|------|------|------|
| `addPoi(poi)` | 添加单个POI | POI对象 |
| `addPois(list)` | 批量添加POI | POI数组 |
| `removePoi(id)` | 删除POI | POI ID |
| `updatePoi(id, updates)` | 更新POI | ID和更新对象 |
| `selectPoi(poi)` | 选中POI | POI对象或null |
| `clearSelection()` | 清除选中 | 无 |
| `clearPois()` | 清空所有POI | 无 |
| `fetchPois(apiFunc)` | 从后端加载 | API函数 |
| `getPoiById(id)` | 按ID查询 | POI ID |
| `getPoisByType(type)` | 按类型筛选 | 类型字符串 |

## POI数据配置

### poiData.js

POI点位数据配置文件，位于 `src/data/poiData.js`。

#### 配置结构

```javascript
export const POI_DATA = [
  { 
    id: 1, 
    x: 500, 
    y: 400, 
    name: '图书馆', 
    type: 'building', 
    description: '描述' 
  }
]

export const POI_TYPES = {
  BUILDING: 'building',
  NPC: 'npc',
  TELEPORT: 'teleport',
  LANDMARK: 'landmark'
}
```

## 交互说明

### 鼠标操作

| 操作 | 效果 |
|------|------|
| 左键拖拽 | 平移地图 |
| 滚轮 | 缩放地图（以鼠标位置为中心） |
| 点击POI | 选中/取消选中标记点 |
| 悬停POI | 显示名称标签 |

### 坐标系统

- **原图尺寸**: 3000 × 1600
- **显示坐标**: 基于原图的绝对坐标
- **缩放行为**: 鼠标滚轮以当前位置为中心缩放

## 后端对接

### 加载流程

```javascript
import { usePoiStore } from '@/stores/poiStore'
import axios from 'axios'

const poiStore = usePoiStore()

// 定义API函数
const fetchPoisFromApi = async () => {
  const response = await axios.get('/api/pois')
  return response.data
}

// 加载数据
await poiStore.fetchPois(fetchPoisFromApi)
```

### API响应格式

```json
[
  {
    "id": 1,
    "x": 500,
    "y": 400,
    "name": "图书馆",
    "type": "building",
    "description": "校园主图书馆"
  }
]
```

## 性能优化

1. **transform 定位**: 使用 `transform: translate()` 替代 `top/left`，避免触发重排
2. **will-change**: 地图容器设置 `will-change: transform` 提示浏览器优化
3. **事件委托**: 使用事件委托减少事件监听器数量
4. **节流处理**: 鼠标移动事件已内置节流逻辑

## 浏览器兼容性

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 更新日志

### v1.1.0
- 新增 useMapEvents composable - 整合地图事件处理
- 新增 usePoiHandlers composable - POI事件处理
- 优化 MapBackground.vue 代码结构，逻辑拆分更清晰

### v1.0.0
- 初始版本
- 实现地图拖拽和缩放
- 实现POI标记点显示
- 集成Pinia状态管理
- 添加POI数据配置文件
