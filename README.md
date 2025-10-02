# MoeKoe Music 文档网站

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![VitePress](https://img.shields.io/badge/VitePress-1.6.3-green.svg)](https://vitepress.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen.svg)](https://nodejs.org/)

这是 [MoeKoe Music](https://github.com/iAJue/MoeKoeMusic) 项目的官方文档网站，基于 VitePress 构建，提供完整的使用指南、API文档和故障排查信息。

## 🌍 多语言支持

文档网站支持以下语言：
- 🇨🇳 简体中文 (默认)
- 🇺🇸 English
- 🇯🇵 日本語
- 🇹🇼 繁體中文

## 📚 文档内容

### 📖 用户指南
- [快速开始](docs/quick-start.md) - 快速上手指南
- [安装说明](docs/installation.md) - 详细安装步骤
- [下载页面](docs/download.md) - 获取最新版本

### 🛠️ 开发者文档
- [开发部署](docs/development.md) - 开发环境搭建
- [WebSocket API](docs/websocket-api.md) - WebSocket接口文档
- [Web API](docs/api-docs.md) - REST API文档

### 🔧 故障排查
- [调试模式](docs/debug-mode.md) - 调试模式和错误排查
- [macOS 问题](docs/mac-troubleshooting.md) - macOS 系统常见问题
- [常见问题](docs/faq/) - FAQ 集合

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
```

### 本地开发

启动开发服务器：

```bash
npm run docs:dev
```

访问 `http://localhost:5173` 查看文档网站。

### 构建生产版本

```bash
npm run docs:build
```

构建产物将生成在 `docs/.vitepress/dist` 目录中。

### 预览构建结果

```bash
npm run docs:preview
```

## 📁 项目结构

```
MoeKoeMusicWeb/
├── docs/                          # 文档源文件
│   ├── .vitepress/                # VitePress 配置
│   │   └── config.js              # 主配置文件
│   ├── public/                    # 静态资源
│   ├── en/                        # 英文文档
│   ├── ja/                        # 日文文档
│   ├── zh-TW/                     # 繁体中文文档
│   ├── faq/                       # 常见问题
│   ├── index.md                   # 首页
│   ├── about.md                   # 关于页面
│   ├── quick-start.md             # 快速开始
│   ├── installation.md            # 安装说明
│   ├── development.md             # 开发指南
│   ├── download.md                # 下载页面
│   ├── api-docs.md                # API 文档
│   ├── websocket-api.md           # WebSocket API
│   ├── debug-mode.md              # 调试模式
│   └── mac-troubleshooting.md     # macOS 故障排查
├── package.json                   # 项目配置
├── LICENSE                        # 许可证文件
└── README.md                      # 项目说明
```

## 🎨 特性

- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🌙 **深色模式** - 支持明暗主题切换
- 🔍 **全文搜索** - 基于 Algolia 的搜索功能
- 🌐 **多语言** - 支持 4 种语言界面
- ⚡ **快速加载** - 基于 Vite 的极速构建
- 📖 **SEO 友好** - 优化的 meta 标签和结构化数据

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 如何贡献文档

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/improve-docs`)
3. 提交更改 (`git commit -am 'Add some feature'`)
4. 推送到分支 (`git push origin feature/improve-docs`)
5. 创建 Pull Request

### 文档编写规范

- 使用 Markdown 格式编写
- 遵循现有的文档结构和风格
- 为新增内容提供多语言版本
- 确保代码示例可以正常运行
- 添加适当的截图和图表说明

## 📄 许可证

本项目基于 [Apache License 2.0](LICENSE) 开源协议发布。

## 🔗 相关链接

- [MoeKoe Music 主项目](https://github.com/iAJue/MoeKoeMusic) - 音乐播放器主程序
- [在线文档](https://moekoe-music-docs.example.com) - 在线查看文档
- [问题反馈](https://github.com/iAJue/MoeKoeMusic/issues) - 提交 Bug 或建议
- [讨论区](https://github.com/iAJue/MoeKoeMusic/discussions) - 社区讨论

## ⭐ 支持项目

如果这个文档对您有帮助，请给我们一个 Star！

[![GitHub stars](https://img.shields.io/github/stars/iAJue/MoeKoeMusic.svg?style=social&label=Star)](https://github.com/iAJue/MoeKoeMusic)

---

<div align="center">
  <p>由 ❤️ 和 VitePress 强力驱动</p>
</div>