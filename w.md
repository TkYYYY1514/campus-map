# API 接口文档

## 一、基础配置

### 1.1 请求配置
- **Base URL**: `/api`
- **超时时间**: 60000ms
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token（自动携带）

### 1.2 错误状态码
| 状态码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未认证（用户名或密码错误） |
| 403 | 拒绝访问（权限不足） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 二、认证接口

### 2.1 用户注册

**POST** `/auth/register`

请求体：
```json
{
  "username": "string",
  "password": "string"
}
```

### 2.2 用户登录

**POST** `/auth/login`

请求体：
```json
{
  "username": "string",
  "password": "string"
}
```

响应：
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "username": "string",
    "role": "string"
  }
}
```

### 2.3 获取当前用户

**GET** `/auth/me`

响应：
```json
{
  "id": "number",
  "username": "string",
  "role": "string"
}
```

### 2.4 获取所有用户（管理员）

**GET** `/auth/users`

响应：
```json
[
  {
    "id": "number",
    "username": "string",
    "role": "string"
  }
]
```

### 2.5 修改密码

**POST** `/auth/change-password`

请求体：
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

### 2.6 删除用户（管理员）

**DELETE** `/auth/users/{userId}`

### 2.7 更新用户角色（管理员）

**PUT** `/auth/users/{userId}/role`

请求体：
```json
{
  "role": "string"
}
```

---

## 三、POI 接口

### 3.1 获取所有 POI

**GET** `/pois`

响应：
```json
[
  {
    "id": "number",
    "name": "string",
    "type": "string",
    "x": "number",
    "y": "number",
    "description": "string",
    "is_visible": "number"
  }
]
```

### 3.2 模糊搜索 POI

**GET** `/pois/search?name=keyword`

### 3.3 获取单个 POI

**GET** `/pois/{id}`

### 3.4 新增 POI

**POST** `/pois`

请求体：
```json
{
  "name": "string",
  "type": "string",
  "x": "number",
  "y": "number",
  "description": "string",
  "is_visible": "number"
}
```

### 3.5 更新 POI

**PUT** `/pois/{id}`

请求体：同新增

### 3.6 删除 POI

**DELETE** `/pois/{id}`

---

## 四、路线接口

### 4.1 获取所有路线

**GET** `/routes`

响应：
```json
[
  {
    "id": "number",
    "name": "string",
    "points": "array",
    "is_active": "number"
  }
]
```

### 4.2 获取单个路线

**GET** `/routes/{id}`

### 4.3 新增路线

**POST** `/routes`

请求体：
```json
{
  "name": "string",
  "points": "array",
  "is_active": "number"
}
```

### 4.4 更新路线

**PUT** `/routes/{id}`

### 4.5 删除路线

**DELETE** `/routes/{id}`

---

## 五、路网接口

### 5.1 获取所有连接

**GET** `/road-network`

响应：
```json
[
  {
    "id": "number",
    "from_poi_id": "number",
    "to_poi_id": "number",
    "distance": "number"
  }
]
```

### 5.2 获取某点的出边

**GET** `/road-network/from/{poiId}`

### 5.3 获取某点的入边

**GET** `/road-network/to/{poiId}`

### 5.4 获取路径点数据

**GET** `/road-network/waypoints`

响应：
```json
{
  "waypoints": "array",
  "adjacency": "object"
}
```

### 5.5 添加连接

**POST** `/road-network`

请求体：
```json
{
  "from_poi_id": "number",
  "to_poi_id": "number",
  "distance": "number"
}
```

### 5.6 删除连接

**DELETE** `/road-network/{id}`

### 5.7 按端点删除连接

**DELETE** `/road-network/from/{fromId}/to/{toId}`

### 5.8 计算最短路径

**POST** `/road-network/shortest-path`

请求体：
```json
{
  "startPoiId": "number (可选)",
  "endPoiId": "number (可选)",
  "startX": "number (可选)",
  "startY": "number (可选)",
  "endX": "number (可选)",
  "endY": "number (可选)"
}
```

响应：
```json
{
  "path": "array",
  "distance": "number"
}
```

---

## 六、评论接口

### 6.1 获取建筑评论

**GET** `/comments/poi/{poiId}`

响应：
```json
[
  {
    "id": "number",
    "poi_id": "number",
    "content": "string",
    "created_at": "string",
    "likes": "number",
    "is_pinned": "boolean"
  }
]
```

### 6.2 添加评论

**POST** `/comments`

请求体：
```json
{
  "poi_id": "number",
  "content": "string"
}
```

### 6.3 删除评论

**DELETE** `/comments/{id}`

### 6.4 点赞/取消点赞

**POST** `/comments/{id}/like`

### 6.5 置顶/取消置顶（管理员）

**POST** `/comments/{id}/pin`

---

## 七、API 服务封装

### 7.1 poiService

| 方法 | 对应接口 |
|------|----------|
| `getList()` | GET `/pois` |
| `search(name)` | GET `/pois/search` |
| `getById(id)` | GET `/pois/{id}` |
| `create(data)` | POST `/pois` |
| `update(id, data)` | PUT `/pois/{id}` |
| `delete(id)` | DELETE `/pois/{id}` |
| `toggleVisibility(id, isVisible)` | PUT `/pois/{id}` |

### 7.2 routeService

| 方法 | 对应接口 |
|------|----------|
| `getList()` | GET `/routes` |
| `getById(id)` | GET `/routes/{id}` |
| `create(data)` | POST `/routes` |
| `update(id, data)` | PUT `/routes/{id}` |
| `delete(id)` | DELETE `/routes/{id}` |
| `toggleVisibility(id, isVisible)` | PUT `/routes/{id}` |

### 7.3 roadNetworkService

| 方法 | 对应接口 |
|------|----------|
| `getAll()` | GET `/road-network` |
| `getFrom(poiId)` | GET `/road-network/from/{poiId}` |
| `getTo(poiId)` | GET `/road-network/to/{poiId}` |
| `getWaypointsData()` | GET `/road-network/waypoints` |
| `create(data)` | POST `/road-network` |
| `delete(id)` | DELETE `/road-network/{id}` |
| `deleteByEndpoints(fromId, toId)` | DELETE `/road-network/from/{fromId}/to/{toId}` |
| `getShortestPath(...)` | POST `/road-network/shortest-path` |