# 开发部署

本文档介绍如何搭建 MoeKoe Music 的开发环境、进行本地调试以及构建应用程序。

## 技术栈

MoeKoe Music 使用以下技术栈开发：

- **前端框架**: [Vue 3](https://v3.vuejs.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **桌面框架**: [Electron](https://www.electronjs.org/)
- **编程语言**: [JavaScript](https://www.javascript.com/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **UI 组件库**: [Element Plus](https://element-plus.org/)

## 环境准备

在开始开发之前，请确保您的系统已安装以下工具：

- [Node.js](https://nodejs.org/) (推荐 v18.x 或更高版本)
- [npm](https://www.npmjs.com/) (通常随 Node.js 一起安装)
- [Git](https://git-scm.com/)

## 获取源码

1. 克隆代码仓库：

```bash
git clone https://github.com/iAJue/MoeKoeMusic.git
cd MoeKoeMusic
```

2. 安装依赖：

```bash
npm install
```

## 本地开发

### 启动开发服务器

```bash
npm run dev
```

这将启动 Electron 应用程序和 Vue 开发服务器，支持热重载。

### 调试应用

- 使用 Chrome DevTools 调试渲染进程
- 使用 VS Code 调试主进程

## 项目结构

```
MoeKoeMusic/
├── electron/          # Electron 主进程代码
├── src/
│   ├── api/           # API 接口
│   ├── assets/        # 静态资源
│   ├── components/    # 公共组件
│   ├── router/        # 路由配置
│   ├── store/         # Pinia 状态管理
│   ├── styles/        # 全局样式
│   ├── utils/         # 工具函数
│   ├── views/         # 页面组件
│   ├── App.vue        # 根组件
│   └── main.ts        # 入口文件
├── public/            # 静态资源
├── package.json       # 项目配置
└── vite.config.ts     # Vite 配置
```

## 构建应用

### 构建所有平台版本

```bash
npm run build
```

### 构建特定平台版本

```bash
# 仅构建 Windows 版本
npm run build:win

# 仅构建 macOS 版本
npm run build:mac

# 仅构建 Linux 版本
npm run build:linux
```

构建的安装包将会输出到 `dist` 目录下。

## WebSocket API 开发

MoeKoe Music 提供了 WebSocket API 用于外部控制和扩展。相关代码在 `electron/websocket` 目录下。

如需详细了解 WebSocket API 的使用方法，请参阅 [WebSocket API 文档](/websocket-api)。

## 贡献代码

1. Fork 代码仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 代码规范

项目使用 ESLint 和 Prettier 进行代码规范检查和格式化：

```bash
# 运行代码检查
npm run lint

# 运行代码格式化
npm run format
```

## 单元测试

```bash
npm run test
```