# 安装说明

MoeKoe Music 支持 Windows、macOS 和 Linux 等主流操作系统。请根据您的系统选择相应的安装方式。

## Windows 系统

### 安装包安装

1. 从[下载页面](/download)获取最新的 `.exe` 安装包
2. 双击运行安装包
3. 根据安装向导完成安装
4. 安装完成后，从开始菜单或桌面快捷方式启动应用

### 便携版

1. 从[下载页面](/download)下载最新的便携版压缩包 `.zip`
2. 解压到任意目录
3. 运行解压目录中的 `MoeKoeMusic.exe` 文件

## macOS 系统

### DMG 安装

1. 从[下载页面](/download)获取最新的 `.dmg` 文件
2. 双击打开 DMG 文件
3. 将 MoeKoe Music 图标拖动到应用程序文件夹
4. 从启动台或应用程序文件夹启动应用

## Linux 系统

### AppImage 方式

1. 从[下载页面](/download)下载最新的 `.AppImage` 文件
2. 为文件添加执行权限:
   ```bash
   chmod +x MoeKoeMusic-*.AppImage
   ```
3. 直接运行 AppImage 文件:
   ```bash
   ./MoeKoeMusic-*.AppImage
   ```

### Debian/Ubuntu 系统

1. 从[下载页面](/download)下载最新的 `.deb` 包
2. 使用以下命令安装:
   ```bash
   sudo dpkg -i MoeKoeMusic-*.deb
   sudo apt-get install -f  # 解决依赖问题(如果有)
   ```
3. 从应用程序菜单启动应用

### Arch Linux 系统

可以通过 AUR 安装:

```bash
yay -S moekoe-music
```

## 系统要求

- **Windows**: Windows 10 或更高版本
- **macOS**: macOS 10.14 (Mojave) 或更高版本
- **Linux**: 现代发行版，如 Ubuntu 18.04+, Fedora 30+, Arch Linux 等

## 安装后注意事项

- 首次启动时，您可能需要同意网络访问权限
- 在某些系统上，可能需要手动添加防火墙例外
- 建议启用自动更新以获取最新功能和安全修复

## 卸载方法

### Windows
- 从控制面板的"程序和功能"中卸载
- 或使用安装目录中的卸载程序

### macOS
- 将应用从应用程序文件夹拖到垃圾桶
- 或使用第三方卸载工具彻底清理

### Linux
- 对于 DEB 包: `sudo apt remove moekoe-music`
- 对于 AppImage: 直接删除 AppImage 文件 