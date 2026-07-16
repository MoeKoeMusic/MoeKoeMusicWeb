# 安装说明

MoeKoe Music 支持 Windows、macOS 和 Linux 等主流操作系统。请根据您的系统选择相应的安装方式。

## Windows 系统

### 安装包安装

Release 页面提供了以下 Windows 安装包：

| 安装包 | 说明 |
|--------|------|
| `MoeKoe_Music_Setup_vX.X.X.exe` | 统一安装包（推荐），包含 32 位和 64 位 |
| `MoeKoe_Music_Setup_vX.X.X-x64.exe` | 仅 64 位，体积更小 |
| `MoeKoe_Music_Setup_vX.X.X-ia32.exe` | 仅 32 位，适用于老系统 |

1. 从[下载页面](/download)或[Github](https://github.com/MoeKoeMusic/MoeKoeMusic/releases/latest)获取安装包（不确定架构请选择统一安装包）
2. 双击运行安装包
3. 根据安装向导完成安装
4. 安装完成后，从开始菜单或桌面快捷方式启动应用

## macOS 系统

### DMG 安装（推荐）

根据您的 Mac 芯片选择对应版本：

- **Apple Silicon（M1/M2/M3/M4）**：下载 `MoeKoe_Music_vX.X.X-arm64.dmg`
- **Intel**：下载 `MoeKoe_Music_vX.X.X-x64.dmg`

> 也可以下载对应的 `.zip` 文件，解压后将应用拖入应用程序文件夹即可。

1. 从[下载页面](/download)或[Github](https://github.com/MoeKoeMusic/MoeKoeMusic/releases/latest)获取 `.dmg` 文件
2. 双击打开 DMG 文件
3. 将 MoeKoe Music 图标拖动到应用程序文件夹
4. 从启动台或应用程序文件夹启动应用

## Linux 系统

### AppImage 方式（x86_64）

1. 从[下载页面](/download)或[Github](https://github.com/MoeKoeMusic/MoeKoeMusic/releases/latest)下载 `MoeKoe_Music_vX.X.X-x86_64.AppImage` 文件
2. 为文件添加执行权限:
   ```bash
   chmod +x MoeKoe_Music_*.AppImage
   ```
3. 直接运行 AppImage 文件:
   ```bash
   ./MoeKoe_Music_*.AppImage
   ```

### Debian/Ubuntu 系统（amd64）

1. 从[下载页面](/download)或[Github](https://github.com/MoeKoeMusic/MoeKoeMusic/releases/latest)下载 `MoeKoe_Music_vX.X.X-amd64.deb` 包
2. 使用以下命令安装:
   ```bash
   sudo dpkg -i MoeKoe_Music_*.deb
   sudo apt install -f  # 解决依赖问题(如果有)
   ```
3. 从应用程序菜单启动应用

### Arch Linux 系统

可以通过 AUR 安装:

```bash
# 使用预编译包（推荐）
yay -S moekoemusic-bin
```

```bash
# 或从源码构建
yay -S moekoemusic
```

## 系统要求

- **Windows**: Windows 10 或更高版本
- **macOS**: macOS 10.14 (Mojave) 或更高版本
- **Linux**: 现代发行版，如 Ubuntu 18.04+, Fedora 30+, Arch Linux 等

## 安装后注意事项

- 首次启动时，您可能需要同意网络访问权限
- 在某些系统上，可能需要手动添加防火墙例外
- 应用支持自动更新，有新版本时会自动提示

## 卸载方法

### Windows
- 从控制面板的"程序和功能"中卸载
- 或使用安装目录中的卸载程序

### macOS
- 将应用从应用程序文件夹拖到垃圾桶

### Linux
- 对于 DEB 包: `sudo apt remove moekoemusic`
- 对于 AUR 安装： `yay -R moekoemusic` 或 `yay -R moekoemusic-bin`
- 对于 AppImage: 直接删除 AppImage 文件 
