# API 接口文档

## 基础配置
- **Base URL**: `/api`
- **认证**: Bearer Token（自动携带）

---

## 一、认证接口 (`src/api/user.js`)

| 方法 | 接口 | 请求参数 | 返回数据 | 说明 |
|------|------|----------|----------|------|
| `login(u, p)` | POST `/auth/login` | `{username, password}` | `{token, user{id,username,role}}` | 登录 |
| `register(u, p)` | POST `/auth/register` | `{username, password}` | - | 注册 |
| `getCurrentUser()` | GET `/auth/me` | - | `{id, username, role}` | 获取当前用户 |
| `getUsers()` | GET `/auth/users` | - | `[{id, username, role}]` | 获取所有用户（管理员） |
| `changePassword(o, n)` | POST `/auth/change-password` | `{oldPassword, newPassword}` | - | 修改密码 |
| `deleteUser(id)` | DELETE `/auth/users/{id}` | - | - | 删除用户（管理员） |
| `updateUserRole(id, r)` | PUT `/auth/users/{id}/role` | `{role}` | - | 更新角色（管理员） |

---

## 二、POI 接口 (`src/api/poiService.js`)

| 方法 | 接口 | 请求参数 | 返回数据 | 说明 |
|------|------|----------|----------|------|
| `getList()` | GET `/pois` | - | `[{id, name, type, x, y, desc, is_visible}]` | 获取所有点位 |
| `search(name)` | GET `/pois/search?name=` | query: `name` | `[{id, name, type, x, y}]` | 模糊搜索 |
| `getById(id)` | GET `/pois/{id}` | - | `{id, name, type, x, y, desc, is_visible}` | 获取单个 |
| `create(data)` | POST `/pois` | `{name, type, x, y, desc, is_visible}` | `{data{id,...}}` | 新增 |
| `update(id, data)` | PUT `/pois/{id}` | `{name, type, x, y, desc, is_visible}` | `{data{id,...}}` | 更新 |
| `delete(id)` | DELETE `/pois/{id}` | - | - | 删除 |

---

## 三、路线接口 (`src/api/routeService.js`)

| 方法 | 接口 | 请求参数 | 返回数据 | 说明 |
|------|------|----------|----------|------|
| `getList()` | GET `/routes` | - | `[{id, name, points, is_active}]` | 获取所有路线 |
| `getById(id)` | GET `/routes/{id}` | - | `{id, name, points, is_active}` | 获取单个 |
| `create(data)` | POST `/routes` | `{name, points[], is_active}` | `{data{id,...}}` | 新增 |
| `update(id, data)` | PUT `/routes/{id}` | `{name, points[], is_active}` | `{data{id,...}}` | 更新 |
| `delete(id)` | DELETE `/routes/{id}` | - | - | 删除 |

---

## 四、路网接口 (`src/api/roadNetworkService.js`)

| 方法 | 接口 | 请求参数 | 返回数据 | 说明 |
|------|------|----------|----------|------|
| `getAll()` | GET `/road-network` | - | `[{id, from_poi_id, to_poi_id, distance}]` | 获取所有连接 |
| `getFrom(id)` | GET `/road-network/from/{id}` | - | `[{id, from, to, distance}]` | 某点出边 |
| `getTo(id)` | GET `/road-network/to/{id}` | - | `[{id, from, to, distance}]` | 某点入边 |
| `getWaypointsData()` | GET `/road-network/waypoints` | - | `{waypoints[], adjacency{}}` | 路径点数据 |
| `create(data)` | POST `/road-network` | `{from_poi_id, to_poi_id, distance}` | - | 添加连接 |
| `delete(id)` | DELETE `/road-network/{id}` | - | - | 删除连接 |
| `deleteByEndpoints(f, t)` | DELETE `/road-network/from/{f}/to/{t}` | - | - | 按端点删除 |
| `getShortestPath(...)` | POST `/road-network/shortest-path` | `{startPoiId, endPoiId, startX/Y, endX/Y}` | `{path[], distance}` | 最短路径计算 |

---

## 五、评论接口 (`src/api/comment.js`)

| 方法 | 接口 | 请求参数 | 返回数据 | 说明 |
|------|------|----------|----------|------|
| `getBuildingComments(id)` | GET `/comments/poi/{id}` | - | `[{id, poi_id, content, created_at, likes, is_pinned}]` | 获取建筑评论 |
| `addBuildingComment(id, c)` | POST `/comments` | `{poi_id, content}` | - | 添加评论 |
| `deleteBuildingComment(id)` | DELETE `/comments/{id}` | - | - | 删除评论 |
| `likeComment(id)` | POST `/comments/{id}/like` | - | - | 点赞 |
| `pinComment(id)` | POST `/comments/{id}/pin` | - | - | 置顶（管理员） |

---

## 请求工具 (`src/utils/request.js`)

- **自动携带** `Authorization: Bearer token`
- **响应自动解包** `response.data`
- **统一错误处理** 401/403/404/500