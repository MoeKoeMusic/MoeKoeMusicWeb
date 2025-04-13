# macOS 常见问题排查

在 macOS 系统上使用 MoeKoe Music 时，可能会遇到一些特定的问题。本文档将帮助您解决在 macOS 上可能遇到的常见问题。

## "应用已损坏"提示解决方法

在 GitHub Actions 上打包的 macOS 应用可能会显示"已损坏"的提示，这通常是由于 macOS 的安全机制（如代码签名和公证）未通过或被绕过导致的。macOS 要求应用程序进行代码签名，否则在安装或运行时可能会被认为"已损坏"。

### 解决方案

1. **方法一：清除应用的扩展属性**

   打开终端应用，输入以下命令：

   ```bash
   xattr -cr /Applications/MoeKoeMusic.app
   ```

   这个命令会递归清除应用的扩展属性，解决 macOS 的不信任问题。

2. **方法二：暂时禁用 Gatekeeper（仅用于测试）**

   在终端中输入以下命令：

   ```bash
   sudo spctl --master-disable
   ```

   此操作会暂时禁用 macOS 的安全检查机制。**注意：这种方法不推荐用于日常使用，仅建议在测试环境中临时使用。**

   使用完毕后，可以重新启用安全机制：

   ```bash
   sudo spctl --master-enable
   ```

## API 启动失败问题

有些用户在 macOS 上（特别是 M1/M2 芯片的设备上）可能会遇到 API 启动失败的问题。

### 解决方案

1. **检查网络连接**：确保您的设备已连接到互联网

2. **重置应用程序设置**：
   
   删除以下目录下的配置文件：
   ```bash
   ~/Library/Application Support/moekoemusic/
   ```

3. **检查防火墙设置**：
   
   确保 MoeKoe Music 没有被系统防火墙阻止

4. **使用最新版本**：
   
   确保您使用的是适用于 Apple Silicon 芯片的最新版本应用

## 其他 macOS 特定问题

### 1. 应用无法启动或启动后立即崩溃

- 尝试重新下载并安装应用
- 检查系统日志 (打开"控制台"应用程序查看)

### 2. 播放音乐时没有声音

- 检查系统音量设置
- 确认其他应用是否有声音
- 重启应用或系统

### 3. 权限问题

macOS 可能会要求多种权限，确保您允许以下权限：

- 网络访问权限
- 通知权限（如果需要）
- 磁盘访问权限（如果需要）

## 相关问题链接

- [macos15.2 arm打开应用显示API启动失败](https://github.com/iAJue/MoeKoeMusic/issues/214)

如果您遇到其他未在此文档中提及的问题，请在 [GitHub Issues](https://github.com/iAJue/MoeKoeMusic/issues) 中提交问题报告。 