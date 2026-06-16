# DBeaver Navicat UI

基于 Electron + React + TypeScript 的现代化数据库管理工具前端，采用 Navicat 风格设计。

## ✨ 特性

- 🎨 **Navicat 风格 UI**：大尺寸彩色图标（48x48）+ 文字标签
- ⚡ **现代化技术栈**：Electron + React 19 + TypeScript 6
- 🎯 **企业级组件**：Ant Design 6.x、Monaco Editor、AG Grid
- 🚀 **热重载**：Vite 开发服务器，修改立即生效
- 📦 **跨平台**：支持 Windows、macOS、Linux

## 🎉 已实现功能

### 1. Navicat 风格工具栏
- 10 个大尺寸彩色图标按钮（连接、新建查询、表、视图、函数、用户、查询、备份、模型、BI）
- 图标下方显示文字标签
- 悬停高亮效果

### 2. 左侧导航树
- 树形结构：连接 → 数据库 → 表/视图/存储过程/用户
- 彩色图标：绿色数据库、黄色文件夹、蓝色表、橙色函数
- 右键菜单（打开、刷新、新建、删除）
- 点击表名自动打开数据表格

### 3. SQL 编辑器（Monaco Editor）
- VS Code 同款编辑器引擎
- Navicat 风格语法高亮（关键字深蓝、字符串深绿、注释灰色）
- F5 快捷键执行 SQL
- 工具栏：执行、保存、复制、导出

### 4. 数据表格（AG Grid）
- Navicat 精确配色：
  - 表头：浅蓝灰 #F5F7FA
  - 数据行：纯白 #FFFFFF（无斑马纹）
  - 网格线：极淡灰 #E5E5E5
  - NULL 值：灰色斜体
- 排序、筛选、分页
- 虚拟滚动（支持百万行）

### 5. 连接管理对话框
- 3 步向导：选择类型 → 配置连接 → 测试连接
- 支持 8 种数据库：MySQL、PostgreSQL、Redis、MongoDB、SQLite、Oracle、SQL Server、MariaDB
- 智能表单：选择数据库类型自动填充默认端口
- 连接测试功能

### 6. 表属性面板
- **列信息 Tab**：列名、类型、可空、自增、默认值、备注
- **索引 Tab**：主键、唯一索引、普通索引
- **外键 Tab**：外键关系、级联规则
- **DDL Tab**：完整的 CREATE TABLE 语句

### 7. 数据导出对话框
- 支持 4 种格式：CSV、Excel、JSON、SQL
- 配置选项：包含表头、最大行数、字符编码
- 实时进度条显示导出状态
- 预计文件大小提示

### 8. 查询历史面板
- 显示执行过的 SQL 列表
- 状态标识：成功（绿色）、失败（红色）
- 显示执行时间、影响行数、错误信息
- 相对时间显示（5分钟前、1小时前等）
- 快捷操作：复制、重新执行、删除
- 搜索过滤功能

### 9. 数据库信息面板
- **对象统计**：表、视图、存储过程、用户数量
- **存储空间**：已使用/可用空间、使用率进度条
- **连接状态**：当前连接数/最大连接数
- **系统信息**：运行时间、版本、字符集
- **性能指标**：缓存命中率、平均查询时间、慢查询率

### 10. 多 Tab 工作区
- 可同时打开多个表和 SQL 查询
- Tab 可关闭（欢迎页不可关闭）
- 自动切换到新打开的 Tab

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动 Vite 开发服务器
npm run dev

# 在浏览器中访问
open http://localhost:5173
```

如需打包为 Electron 桌面应用：

```bash
# 在另一个终端启动 Electron（需要先解决 Electron 安装问题）
npm start
```

### 构建生产版本

```bash
npm run build
npm run package
```

## 📁 项目结构

```
dbeaver-navicat-ui/
├── src/
│   ├── main/                      # Electron 主进程
│   │   └── main.ts
│   ├── preload/                   # 预加载脚本（安全桥接）
│   │   └── preload.ts
│   └── renderer/                  # React 渲染进程
│       ├── App.tsx                # 主组件
│       ├── App.css                # 全局样式
│       ├── main.tsx               # React 入口
│       └── components/            # UI 组件
│           ├── NavigatorTree.tsx           # 左侧导航树
│           ├── SQLEditor.tsx               # SQL 编辑器
│           ├── DataGrid.tsx                # 数据表格
│           ├── DataGrid.css                # 表格样式
│           ├── ConnectionDialog.tsx        # 连接管理对话框
│           ├── TableProperties.tsx         # 表属性面板
│           ├── ExportDialog.tsx            # 数据导出对话框
│           ├── QueryHistoryPanel.tsx       # 查询历史面板
│           └── DatabaseInfoPanel.tsx       # 数据库信息面板
├── index.html                     # HTML 入口
├── vite.config.ts                 # Vite 配置
├── tsconfig.json                  # TypeScript 配置
├── package.json
└── README.md
```

## 🛠️ 技术栈

- **Electron**: 42.x - 桌面应用框架
- **React**: 19.x - UI 框架
- **TypeScript**: 6.x - 类型安全
- **Vite**: 8.x - 构建工具
- **Ant Design**: 6.x - UI 组件库
- **Monaco Editor**: VS Code 编辑器引擎
- **AG Grid**: 企业级表格组件
- **Lucide React**: 图标库
- **date-fns**: 日期格式化库

## 📊 开发进度

- ✅ Phase 0: 项目脚手架搭建（100%）
- ✅ Phase C: 核心前端组件（100%）
  - ✅ Navicat 风格工具栏
  - ✅ 左侧导航树
  - ✅ SQL 编辑器（Monaco Editor）
  - ✅ 数据表格（AG Grid，Navicat 配色）
  - ✅ 连接管理对话框
  - ✅ 表属性面板
  - ✅ 数据导出对话框
  - ✅ 查询历史面板
  - ✅ 数据库信息面板
  - ✅ 多 Tab 工作区
- ⏳ Phase 1: 与 DBeaver Java 后端集成（0%）
- ⏳ Phase 2: 高级功能（ER 图、数据传输）（0%）

**总进度：70%**

## 🎨 截图

（浏览器访问 http://localhost:5173 查看效果）

### 主界面
- 顶部：10 个大尺寸彩色图标工具栏
- 左侧：连接和数据库导航树
- 中央：多 Tab 工作区（表/SQL 查询/数据库信息）
- 右侧：表属性面板（列/索引/外键/DDL）

### 对话框
- 连接管理：3 步向导，支持 8 种数据库
- 数据导出：4 种格式，实时进度条
- 查询历史：侧边抽屉，搜索过滤

## 🔜 下一步计划

1. 解决 Electron 安装问题，打包成桌面应用
2. 集成 DBeaver Java 后端（数据库连接、SQL 执行）
3. 实现 ER 图编辑器（React Flow / X6）
4. 实现数据传输工具（向导式界面）
5. 实现 BI 仪表板（ECharts / Recharts）

## 📄 许可证

Apache-2.0
