# 校园导航系统 — 项目工作总结

## 一、项目简介

基于 **Vue 3 + Vite** 开发的校园导航单页应用（SPA），提供校园地图交互浏览、兴趣点（POI）管理、路线规划、设施查询等功能。

---

## 二、技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3（Composition API / `<script setup>`） |
| 构建工具 | Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router（懒加载） |
| UI 组件库 | Element Plus |
| 图表 | ECharts |
| HTTP 请求 | Axios |
| 样式预处理 | Sass |

---

## 三、核心功能模块

### 1. 校园地图（`MapBackground.vue`）
- 支持鼠标**拖拽平移**、**滚轮缩放**
- 地图坐标实时显示（悬浮 Tooltip）
- 通过 Composables 拆分逻辑，结构清晰：
  - `useMapTransform` — 缩放/平移变换
  - `useMapEvents` — 鼠标事件处理
  - `useMapTooltip` — 坐标提示
  - `usePoiHandlers` — POI 点击/悬停处理

### 2. POI 兴趣点系统
- **数据层**（`poiData.js`）：预置 21 个校园 POI，涵盖教学楼、宿舍、食堂、体育场、进出口等 10 种类型
- **状态管理**（`poiStore.js`）：Pinia Store 提供增删改查、按类型筛选、选中状态管理等完整接口
- **展示组件**（`PoiMarker.vue`）：根据类型渲染不同颜色标记点，支持点击激活与悬停提示

### 3. 功能页面（侧边栏路由视图）

| 路由 | 页面 | 功能 |
|------|------|------|
| `/map` | CampusMapInfo | 校园地图信息总览 |
| `/route` | RoutePlanPanel | 路线规划 |
| `/search` | SearchPage | 全局搜索 |
| `/canteen` | CanteenFilter | 食堂筛选 |
| `/dorm` | DormArea | 宿舍区域查询 |
| `/library` | LibraryGuide | 图书馆指南 |
| `/nav-sim` | NavSimulate | 导航模拟 |
| `/settings` | SystemSettings | 系统设置 |

### 4. 全局交互
- 顶部导航栏（`Head.vue`）+ 左侧功能面板，绝对定位叠加于地图之上
- 支持一键**隐藏/显示 UI**，沉浸式查看地图
- 导航栏与侧边栏均有平滑的**过渡动画**

---

## 四、项目结构概览

```
src/
├── components/
│   ├── map/          # 地图核心（背景、标记点、Composables）
│   ├── layout/       # 布局组件（Head）
│   └── Dialog/       # 自定义弹窗
├── data/             # 静态数据（POI 配置）
├── stores/           # Pinia 状态管理
├── router/           # 路由配置（8 个功能路由）
├── views/sidebar/    # 功能页面
├── App.vue           # 根组件（地图 + UI 布局）
└── main.js           # 入口（注册 Router / Pinia / ElementPlus）
```

---

## 五、当前进度

- ✅ 项目脚手架搭建完成（Vite + Vue 3）
- ✅ 依赖集成（Element Plus、Pinia、Vue Router、ECharts、Axios、Sass）
- ✅ 校园地图底图渲染，支持拖拽与缩放
- ✅ POI 数据定义与 Pinia Store 封装
- ✅ POI 标记点渲染与交互（点击、悬停）
- ✅ 8 个功能路由页面已创建
- ✅ 全局 UI 布局（顶栏 + 侧边栏 + 显隐切换 + 过渡动画）
