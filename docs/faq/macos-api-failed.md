# macOS ARM设备API启动失败解决方法

## 问题描述

在搭载 Apple Silicon (M1/M2/M3) 芯片的 macOS 设备上，有用户反馈启动 MoeKoe Music 时出现"API 启动失败"的错误提示。这个问题通常在日志中会显示类似以下的错误信息：

```
API 服务启动失败: Error: spawn Unknown system error -86
at ChildProcess.spawn (node:internal/child_process:421:11)
at spawn (node:child_process:777:9)
```

## 解决方法

### 方法一：安装 Rosetta 2

多数用户反馈，在安装 Rosetta 2 后，问题得到解决。即使是 ARM 版本的应用，某些依赖组件仍可能需要 Rosetta 2 来运行。

1. 当首次运行需要 Rosetta 的应用时，系统通常会自动提示安装
2. 如果没有提示，可以手动安装 Rosetta 2：打开终端并运行以下命令：

```bash
softwareupdate --install-rosetta --agree-to-license
```

### 方法二：尝试安装 Intel 版本

有些用户发现，安装 Intel 版本的 MoeKoe Music 反而可以在 Apple Silicon 设备上正常运行：

1. 下载 Intel (x86_64) 版本的 MoeKoe Music
2. 系统会提示安装 Rosetta 2（如果尚未安装）
3. 安装完成后再尝试运行 ARM 版本的应用

### 方法三：重置应用程序设置

删除应用程序的配置文件可能会解决一些启动问题：

```bash
rm -rf ~/Library/Application\ Support/moekoemusic/
```

### 方法四：检查系统完整性

1. 重启 Mac 并进入恢复模式（在开机时按住 Command + R）
2. 打开终端，运行 First Aid：

```bash
diskutil firstAid /
```

## 其他可能的解决方法

- 确保您使用的是最新版本的 MoeKoe Music
- 检查系统是否有可用更新
- 尝试重新下载并安装应用
- 检查系统防火墙设置，确保应用有网络访问权限

## 技术原因解析

这个问题可能与 Apple Silicon 架构上的进程生成机制有关。错误码 `-86` 通常表示系统在尝试启动子进程时遇到了权限或兼容性问题，这在 ARM 架构的 macOS 上比较常见。

Rosetta 2 通过提供 x86_64 指令集的翻译层，能够解决某些与架构相关的兼容性问题，即使应用本身声称支持 ARM 架构。

## 相关问题链接

- [macos15.2 arm打开应用显示API启动失败](https://github.com/iAJue/MoeKoeMusic/issues/214)

## 其他资源

如果上述方法未能解决您的问题，请参考：

- [调试模式和错误排查](/debug-mode) - 了解如何启用调试模式并查看详细日志
- [macOS 常见问题排查](/mac-troubleshooting) - 获取更多 macOS 平台上的故障排查信息 