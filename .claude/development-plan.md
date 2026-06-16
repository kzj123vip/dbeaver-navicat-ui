# DBeaver Navicat UI - 后续开发规划

生成时间：2026-06-16

## 一、战略优先级推荐

**推荐路径：B → D → C**

### 理由
1. **B（后端集成）是核心价值**：前端再美观，不能操作真实数据库就没有实用价值
2. **D（优化现有功能）是用户体验基础**：在扩展新功能前，先让现有功能更完善
3. **C（高级功能）是差异化竞争力**：但需要在前两者稳定后再投入

---

## 二、选项 B：后端集成（Phase 1）

### 目标
将前端连接到真实数据库操作，替换 Mock 数据

### 技术选型决策

#### 决策点 1：通信架构
**方案对比：**
- **方案 A：Electron IPC + DBeaver Java JAR**
  - 优势：本地运行，无需网络，性能好
  - 劣势：需要打包 DBeaver JAR，Java 进程管理复杂
  
- **方案 B：HTTP REST API + 独立 DBeaver Server**
  - 优势：前后端完全解耦，易于测试和调试
  - 劣势：需要额外端口，跨进程通信开销

**推荐：方案 B（HTTP REST API）**
- 更简单、更容易调试
- DBeaver 本身已有 Web Server 模块可复用
- 前端可独立开发和测试

#### 决策点 2：后端技术栈
**选择：复用 DBeaver 现有 REST API**
- DBeaver 已有 `org.jkiss.dbeaver.model.rest` 模块
- 包含连接管理、SQL 执行、元数据查询等接口
- 只需启动 DBeaver Server 进程

### 实施步骤

#### 步骤 1：启动 DBeaver REST Server（1 天）
```bash
# 找到 DBeaver Server 启动脚本
cd /path/to/dbeaver
./dbeaver-server --port 8978
```

**任务清单：**
- [ ] 研究 DBeaver Server 启动方式
- [ ] 配置服务器端口和认证
- [ ] 验证 REST API 可访问（curl 测试）

**验收标准：**
```bash
curl http://localhost:8978/api/connections
# 返回空数组或连接列表
```

#### 步骤 2：前端 HTTP 客户端封装（2 天）
创建 `src/renderer/services/api.ts`：
```typescript
// API 客户端封装
class DBeaverAPI {
  baseURL = 'http://localhost:8978/api';
  
  async getConnections() { /* ... */ }
  async createConnection(config) { /* ... */ }
  async executeSQL(connectionId, sql) { /* ... */ }
  async getTableData(connectionId, schema, table) { /* ... */ }
}
```

**任务清单：**
- [ ] 创建 API 客户端类（连接、SQL、元数据）
- [ ] 实现错误处理和重试逻辑
- [ ] 添加请求/响应类型定义（TypeScript）
- [ ] 编写单元测试

**验收标准：**
- 所有 API 方法有完整类型定义
- 错误处理覆盖网络失败、超时、服务端错误
- 单元测试覆盖率 ≥ 80%

#### 步骤 3：替换组件中的 Mock 数据（3 天）

**优先级顺序：**
1. **ConnectionDialog** → 真实连接创建和测试
2. **NavigatorTree** → 从 API 加载连接和数据库列表
3. **DataGrid** → 真实表数据查询和分页
4. **SQLEditor** → 真实 SQL 执行和结果集
5. **TableProperties** → 真实表元数据（列、索引、外键、DDL）
6. **QueryHistoryPanel** → 持久化查询历史到本地存储
7. **DatabaseInfoPanel** → 真实数据库统计信息

**任务清单：**
- [ ] 重构 App.tsx 状态管理（连接列表、当前连接）
- [ ] 为每个组件添加 loading 状态
- [ ] 实现错误边界（Error Boundary）
- [ ] 添加空状态提示（无连接、无数据）

**验收标准：**
- 能创建真实数据库连接（MySQL/PostgreSQL）
- 能浏览真实数据库和表结构
- 能执行 SQL 并显示真实结果集
- 所有错误情况有友好提示

#### 步骤 4：状态管理优化（1 天）

**技术选型：**
- **方案 A：React Context + useReducer**（轻量）
- **方案 B：Zustand**（推荐，简单且性能好）
- **方案 C：Redux Toolkit**（重量级，适合复杂场景）

**推荐：Zustand**
```typescript
// src/renderer/store/useConnectionStore.ts
import { create } from 'zustand';

interface ConnectionStore {
  connections: Connection[];
  currentConnection: Connection | null;
  addConnection: (conn: Connection) => void;
  selectConnection: (id: string) => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  connections: [],
  currentConnection: null,
  addConnection: (conn) => set((state) => ({ 
    connections: [...state.connections, conn] 
  })),
  selectConnection: (id) => set((state) => ({
    currentConnection: state.connections.find(c => c.id === id)
  })),
}));
```

**验收标准：**
- 全局状态管理连接列表和当前连接
- 组件间数据共享无需 prop drilling
- 状态变化自动触发组件更新

### 时间估算
**总计：7 个工作日**
- 步骤 1：1 天
- 步骤 2：2 天
- 步骤 3：3 天
- 步骤 4：1 天

---

## 三、选项 D：优化现有功能

### 目标
提升用户体验，让现有功能更完善和流畅

### D1：动画和过渡效果（2 天）

**实施内容：**
1. Tab 切换动画
2. 对话框打开/关闭动画
3. 树节点展开/收起动画
4. 数据加载骨架屏

**技术方案：**
- 使用 Ant Design 内置动画
- 添加 CSS 过渡效果
- Framer Motion（可选，用于复杂动画）

**验收标准：**
- 所有交互有流畅过渡
- 加载状态有明确视觉反馈
- 动画时长符合 Material Design 规范（100-300ms）

### D2：响应式布局（1 天）

**实施内容：**
1. 支持窗口缩放（最小宽度 1024px）
2. 左/右侧边栏可折叠
3. 工具栏图标在小屏幕时隐藏文字

**验收标准：**
- 在 1024x768 分辨率下可正常使用
- 侧边栏折叠后工具栏图标仍可见

### D3：主题切换（2 天）

**实施内容：**
1. 深色主题配色方案
2. 主题切换按钮（顶部工具栏）
3. 持久化主题选择（localStorage）

**技术方案：**
```typescript
// src/renderer/theme/themes.ts
export const lightTheme = {
  colors: {
    background: '#FFFFFF',
    headerBg: '#F5F7FA',
    // ...
  }
};

export const darkTheme = {
  colors: {
    background: '#1E1E1E',
    headerBg: '#2D2D2D',
    // ...
  }
};
```

**验收标准：**
- 深色主题所有组件配色正确
- Monaco Editor 切换到深色主题
- AG Grid 切换到深色主题
- 主题选择在重启后保持

### D4：性能优化（1 天）

**实施内容：**
1. DataGrid 虚拟滚动优化（10 万行以上）
2. NavigatorTree 懒加载（大型数据库）
3. SQL 结果集分页加载
4. 图片/图标懒加载

**验收标准：**
- 10 万行数据表滚动流畅（60 FPS）
- 1000+ 表的数据库树加载不卡顿
- 内存占用稳定（无内存泄漏）

### D5：国际化（1 天）

**实施内容：**
1. 使用 react-i18next
2. 支持中文和英文
3. 语言切换按钮

**技术方案：**
```typescript
// src/renderer/i18n/zh-CN.json
{
  "toolbar.connection": "连接",
  "toolbar.newQuery": "新建查询",
  // ...
}

// src/renderer/i18n/en-US.json
{
  "toolbar.connection": "Connection",
  "toolbar.newQuery": "New Query",
  // ...
}
```

**验收标准：**
- 所有界面文字支持中英文切换
- 语言选择持久化
- 日期/时间格式本地化

### 时间估算
**总计：7 个工作日**
- D1：2 天
- D2：1 天
- D3：2 天
- D4：1 天
- D5：1 天

---

## 四、选项 C：高级功能扩展

### 目标
实现差异化竞争力的高级功能

### C1：ER 图编辑器（5 天）

**技术选型：**
- **React Flow**（推荐）：轻量、性能好、社区活跃
- **X6**：阿里出品、功能强大、文档丰富

**推荐：React Flow**

**实施内容：**
1. 从数据库元数据生成 ER 图
2. 拖拽节点和连线
3. 自动布局（dagre）
4. 导出为图片（PNG/SVG）

**验收标准：**
- 能自动生成数据库 ER 图
- 表节点显示列信息和主键
- 外键关系显示为连线
- 支持缩放和平移
- 可导出高清图片

### C2：数据传输工具（3 天）

**实施内容：**
1. 向导式界面（4 步）
   - 步骤 1：选择源数据库和表
   - 步骤 2：选择目标数据库
   - 步骤 3：配置映射规则
   - 步骤 4：执行并显示进度
2. 支持跨数据库类型传输
3. 数据类型自动转换

**验收标准：**
- 能从 MySQL 传输到 PostgreSQL
- 传输进度实时显示
- 错误记录可导出

### C3：BI 仪表板（4 天）

**技术选型：**
- **ECharts**（推荐）：功能强大、图表类型丰富
- **Recharts**：React 原生、简单易用

**推荐：ECharts**

**实施内容：**
1. 可视化查询构建器
2. 图表类型：柱状图、折线图、饼图、散点图
3. 仪表板布局拖拽（react-grid-layout）
4. 保存和分享仪表板

**验收标准：**
- 能从 SQL 查询生成图表
- 支持 5 种以上图表类型
- 仪表板布局可自定义
- 可导出为图片或 PDF

### 时间估算
**总计：12 个工作日**
- C1：5 天
- C2：3 天
- C3：4 天

---

## 五、综合实施路线图

### 阶段 1：后端集成（第 1-7 天）
**交付物：**
- ✅ 前端连接真实数据库
- ✅ 所有核心功能使用真实数据
- ✅ 完整的错误处理和状态管理

**里程碑验证：**
```bash
# 启动 DBeaver Server
./dbeaver-server --port 8978

# 启动前端
npm run dev

# 验证功能
1. 创建 MySQL 连接
2. 浏览数据库和表
3. 执行 SQL 查询
4. 查看表属性
```

### 阶段 2：用户体验优化（第 8-14 天）
**交付物：**
- ✅ 流畅的动画效果
- ✅ 响应式布局
- ✅ 深色主题
- ✅ 性能优化
- ✅ 国际化支持

**里程碑验证：**
- 主题切换无闪烁
- 10 万行数据滚动流畅
- 支持中英文切换

### 阶段 3：高级功能（第 15-26 天）
**交付物：**
- ✅ ER 图编辑器
- ✅ 数据传输工具
- ✅ BI 仪表板

**里程碑验证：**
- 生成数据库 ER 图
- 跨数据库传输数据
- 创建数据可视化仪表板

---

## 六、关键风险和应对

### 风险 1：DBeaver REST API 文档不足
**影响：**可能需要花费额外时间研究 API

**应对：**
1. 阅读 DBeaver 源码 `org.jkiss.dbeaver.model.rest`
2. 使用 Postman 测试 API 端点
3. 参考 DBeaver Web 版本的实现

### 风险 2：性能问题（大数据集）
**影响：**大型数据库或表可能卡顿

**应对：**
1. 使用虚拟滚动（AG Grid 已支持）
2. 分页加载（后端分页）
3. 索引优化查询

### 风险 3：跨平台兼容性
**影响：**某些功能在不同操作系统表现不一致

**应对：**
1. 优先支持 Windows 和 macOS
2. 使用跨平台库（Electron、React）
3. 充分测试

---

## 七、依赖项和准备工作

### 新增依赖（按阶段）

**阶段 1（后端集成）：**
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "zustand": "^4.5.0"
  }
}
```

**阶段 2（优化）：**
```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "react-i18next": "^14.0.0",
    "i18next": "^23.0.0"
  }
}
```

**阶段 3（高级功能）：**
```json
{
  "dependencies": {
    "reactflow": "^11.10.0",
    "dagre": "^0.8.5",
    "echarts": "^5.5.0",
    "echarts-for-react": "^3.0.2",
    "react-grid-layout": "^1.4.0"
  }
}
```

### 环境准备
1. 确保 DBeaver 已安装并可启动 Server 模式
2. 准备测试数据库（MySQL 和 PostgreSQL）
3. 配置 CORS（如果前后端不同源）

---

## 八、总结

### 推荐实施顺序
1. **第一优先级：B（后端集成）** - 7 天
   - 这是核心价值，必须最先完成
   
2. **第二优先级：D（优化现有功能）** - 7 天
   - 提升用户体验，为后续扩展打好基础
   
3. **第三优先级：C（高级功能）** - 12 天
   - 差异化竞争力，但需要在前两者稳定后再投入

### 总工期估算
**26 个工作日（约 5-6 周）**

### 验收检查清单
- [ ] 所有组件使用真实数据（无 Mock）
- [ ] 错误处理完善，无未捕获异常
- [ ] 支持深色和浅色主题
- [ ] 支持中英文切换
- [ ] 性能指标达标（10 万行数据流畅）
- [ ] ER 图生成正确
- [ ] 数据传输功能可用
- [ ] BI 仪表板可创建和保存

---

**计划制定完成！** 🎉

下一步操作：
1. 用户确认规划方案
2. 开始执行阶段 1（后端集成）

