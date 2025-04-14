# 麦克风权限问题

## 问题描述

在macOS系统上，部分用户可能会遇到以下麦克风权限问题：

- 每次切换歌曲时都会弹出麦克风权限请求
- 需要多次确认权限弹窗才能开始播放音乐

## 解决方案

### 1. 检查系统权限设置

1. 打开系统设置
2. 进入"隐私与安全性"
3. 选择"麦克风"
4. 确保MoeKoe Music的权限已开启

### 2. 修改应用包内的 Info.plist 文件

`Info.plist` 文件位于 `MoeKoeMusic.app/Contents/Info.plist`。

您可以在 Info.plist 文件中添加以下配置来禁用麦克风权限请求：

```xml
<key>NSMicrophoneUsageDescription</key>
<string>We do not require microphone access.</string>
```

### 3. 删除特定配置文件

如果上述方法无效，可以尝试删除以下配置文件：

1. 打开访达
2. 按下 `Command + Shift + G` 打开"前往文件夹"
3. 输入路径：`~/Library/Application Support/MoeKoeMusic`
4. 找到并删除该文件
5. 重启应用

## 注意事项

- 删除配置文件后，应用会重新创建默认配置
- 此操作不会影响您的音乐收藏和播放列表
- 如果问题仍然存在，请尝试完全卸载并重新安装应用

## 相关问题链接

- [每次切歌询问麦克风权限](https://github.com/iAJue/MoeKoeMusic/issues/278) 