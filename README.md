# DBeaver Navicat UI

基于 Electron + React + TypeScript 的现代化数据库管理工具前端，采用 Navicat 风格设计。

## 特性

- 🎨 **Navicat 风格 UI**：大尺寸彩色图标（48x48）+ 文字标签
- ⚡ **现代化技术栈**：Electron + React 19 + TypeScript 6
- 🎯 **企业级组件**：Ant Design 6.x
- 🚀 **热重载**：Vite 开发服务器，修改立即生效
- 📦 **跨平台**：支持 Windows、macOS、Linux

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

然后在另一个终端启动 Electron：

```bash
npm start
```

### 构建生产版本

```bash
npm run build
npm run package
```

## 项目结构

```
dbeaver-navicat-ui/
├── src/
│   ├── main/           # Electron 主进程
│   │   └── main.ts
│   ├── preload/        # 预加载脚本（安全桥接）
│   │   └── preload.ts
│   └── renderer/       # React 渲染进程
│       ├── App.tsx     # 主组件
│       ├── App.css     # 样式
│       └── main.tsx    # React 入口
├── index.html          # HTML 入口
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TypeScript 配置
└── package.json
```

## 技术栈

- **Electron**: 42.x - 桌面应用框架
- **React**: 19.x - UI 框架
- **TypeScript**: 6.x - 类型安全
- **Vite**: 8.x - 构建工具
- **Ant Design**: 6.x - UI 组件库
- **Lucide React**: 图标库

## 开发路线图

- [x] Phase 0: 项目脚手架搭建
- [x] Phase 1: Navicat 风格工具栏
- [ ] Phase 2: 左侧导航树
- [ ] Phase 3: SQL 编辑器（Monaco Editor）
- [ ] Phase 4: 数据表格（AG Grid）
- [ ] Phase 5: 连接管理
- [ ] Phase 6: 与 Java 后端集成

## 许可证

Apache-2.0
