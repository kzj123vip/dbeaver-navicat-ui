# DBeaver 后端集成调研报告

生成时间：2026-06-16

## 关键发现

### 1. CloudBeaver：DBeaver 的 Web 版本
- **项目地址**：https://github.com/dbeaver/cloudbeaver
- **API 类型**：GraphQL（非传统 REST）
- **部署方式**：Docker Compose
- **默认路径**：`/opt/cloudbeaver/`
- **文档**：
  - GraphQL API Overview: https://dbeaver.com/docs/cloudbeaver/GraphQL-API-overview/
  - Server API Explorer: https://dbeaver.com/docs/cloudbeaver/Server-API-explorer/

### 2. 技术特点
- **GraphQL API**：所有操作通过 GraphQL 查询和变更
- **内置控制台**：浏览器中可直接测试 GraphQL 查询
- **API Token 认证**：可在管理设置中启用
- **Team Edition**：包含 Model Context Protocol (MCP) Server

### 3. 快速启动方式（推荐）
```bash
# 使用 Docker 启动 CloudBeaver
docker run -d --name cloudbeaver \
  -p 8978:8978 \
  dbeaver/cloudbeaver:latest
```

访问：http://localhost:8978

## 实施决策

### 方案调整：使用 CloudBeaver GraphQL API

**原计划**：使用 DBeaver Java 后端 + REST API
**新方案**：使用 CloudBeaver + GraphQL API

**调整理由：**
1. CloudBeaver 是官方 Web 解决方案，维护活跃
2. GraphQL API 更灵活，一次请求获取多层数据
3. Docker 部署简单，无需复杂的 Java 环境配置
4. 内置认证和会话管理

### 前端技术栈调整

**新增依赖：**
```json
{
  "dependencies": {
    "graphql": "^16.8.0",
    "graphql-request": "^6.1.0",
    "zustand": "^4.5.0"
  }
}
```

**graphql-request**：轻量级 GraphQL 客户端，比 Apollo Client 简单

## 核心 GraphQL 操作（基于文档推断）

### 认证
```graphql
mutation authLogin($credentials: Object!) {
  authLogin(credentials: $credentials) {
    authId
    authToken
  }
}
```

### 连接管理
```graphql
# 获取连接列表
query getConnections {
  connections {
    id
    name
    driverName
    connected
  }
}

# 创建连接
mutation createConnection($config: ConnectionConfig!) {
  createConnection(config: $config) {
    id
    name
  }
}

# 测试连接
mutation testConnection($config: ConnectionConfig!) {
  testConnection(config: $config) {
    connected
    message
  }
}
```

### 元数据查询
```graphql
# 获取数据库列表
query getDatabases($connectionId: ID!) {
  connection(id: $connectionId) {
    databases {
      name
    }
  }
}

# 获取表列表
query getTables($connectionId: ID!, $catalogName: String, $schemaName: String!) {
  navGetStructContainers(
    connectionId: $connectionId
    catalog: $catalogName
    schema: $schemaName
  ) {
    name
    type
  }
}
```

### SQL 执行
```graphql
mutation executeSQLQuery($connectionId: ID!, $contextId: ID!, $sql: String!) {
  sqlExecuteQuery(
    connectionId: $connectionId
    contextId: $contextId
    sql: $sql
  ) {
    duration
    rows
    columns {
      name
      dataType
    }
  }
}
```

## 实施步骤修订

### 步骤 1：启动 CloudBeaver（1 小时）
```bash
# 1. 拉取镜像
docker pull dbeaver/cloudbeaver:latest

# 2. 启动容器
docker run -d --name cloudbeaver \
  -p 8978:8978 \
  -v $(pwd)/cloudbeaver-data:/opt/cloudbeaver/workspace \
  dbeaver/cloudbeaver:latest

# 3. 访问初始化页面
open http://localhost:8978

# 4. 测试 GraphQL API
curl -X POST http://localhost:8978/api/gql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ sessionState { user { userId } } }"}'
```

### 步骤 2：创建 GraphQL 客户端（2 天）
**文件：** `src/renderer/services/graphql-client.ts`

**功能：**
- GraphQL 请求封装
- 错误处理和重试
- TypeScript 类型生成（基于 schema）

### 步骤 3：实现 API 服务层（2 天）
**文件：** `src/renderer/services/api.ts`

**封装 GraphQL 操作为友好的 API：**
- ConnectionService：连接 CRUD
- SQLService：SQL 执行
- MetadataService：元数据查询

### 步骤 4：替换组件 Mock 数据（3 天）
保持原计划不变

### 步骤 5：状态管理优化（1 天）
保持原计划不变

## 验证计划

### 环境准备
```bash
cd /Users/kzj/Downloads/Items/dbeaver-navicat-ui

# 1. 启动 CloudBeaver
docker run -d --name cloudbeaver -p 8978:8978 dbeaver/cloudbeaver:latest

# 2. 安装新依赖
npm install graphql graphql-request zustand

# 3. 启动前端
npm run dev
```

### 测试流程
1. 访问 http://localhost:8978 完成 CloudBeaver 初始化
2. 在 GraphQL 控制台测试 API
3. 前端创建 MySQL 连接
4. 浏览数据库和表
5. 执行 SQL 查询
6. 查看表属性

## 风险评估

### 风险 1：GraphQL Schema 未知
**影响**：可能需要花时间探索 API 结构

**应对**：
1. 使用 CloudBeaver 内置 GraphQL 控制台探索
2. 使用 GraphQL Introspection 查询 schema
3. 参考 CloudBeaver 前端源码

### 风险 2：认证复杂度
**影响**：可能需要额外处理 token 和会话

**应对**：
1. 初期可使用匿名模式（如果支持）
2. 实现简单的 token 存储（localStorage）
3. 添加自动刷新机制

### 风险 3：跨域问题（CORS）
**影响**：前端可能无法访问 CloudBeaver API

**应对**：
1. CloudBeaver 默认应该允许跨域
2. 如不行，配置 CloudBeaver CORS 设置
3. 或使用 Electron 的 main 进程代理请求

## 时间估算修订

| 步骤 | 原估算 | 新估算 | 说明 |
|-----|-------|--------|------|
| 步骤 1：启动后端 | 1 天 | 1 小时 | Docker 部署更简单 |
| 步骤 2：GraphQL 客户端 | - | 2 天 | 新增步骤 |
| 步骤 3：API 服务层 | 2 天 | 2 天 | GraphQL 封装 |
| 步骤 4：替换 Mock 数据 | 3 天 | 3 天 | 不变 |
| 步骤 5：状态管理 | 1 天 | 1 天 | 不变 |
| **总计** | **7 天** | **8 天** | 增加 GraphQL 层 |

## 下一步行动

1. ✅ 启动 CloudBeaver Docker 容器
2. ⏳ 探索 GraphQL API（使用内置控制台）
3. ⏳ 创建 GraphQL 客户端
4. ⏳ 实现 API 服务层
5. ⏳ 替换组件 Mock 数据

---

**调研完成！准备开始实施。**
