# 调试模式和错误排查

在使用 MoeKoe Music 时，如果遇到问题或错误，您可以通过启用调试模式来帮助排查问题。本文档将指导您如何启用调试模式以及如何查看和提交错误报告。

## 如何启动调试模式

对于已编译的程序，如在使用过程中遇到错误，您可以通过以下方式启动调试模式：

1. **使用快捷键打开开发者工具**：
   - Windows 和 Linux：按下 `Ctrl + Shift + I`
   - macOS：按下 `Command + Option + I`

2. **通过命令行启动程序**：
   - 您可以添加参数 `--remote-debugging-port=9222` 来启用远程调试

## 查看日志文件

程序 API 相关错误可查看日志文件，不同操作系统的日志位置如下：

- **Windows**：`C:\Users\<YourUsername>\AppData\Roaming\moekoemusic\logs\main.log`
- **macOS**：`/Users/<YourUsername>/Library/Logs/moekoemusic/main.log`
- **Linux**：`/home/<YourUsername>/.config/moekoemusic/logs/main.log`

## 常见错误排查

### 1. 应用无法启动

- 检查您的系统是否满足[最低系统要求](/installation#系统要求)
- 尝试以管理员/超级用户权限运行应用
- 查看日志文件中的错误信息

### 2. 音乐无法播放

- 检查网络连接是否正常
- 确认账号登录状态
- 查看是否有权限播放特定歌曲（可能需要会员权限）

### 3. 界面显示异常

- 尝试切换主题
- 重启应用
- 检查显示缩放设置

### 4. 登录失败

- 确认账号密码是否正确
- 检查网络连接
- 查看日志文件中的错误信息

## 如何提交错误报告

如果您遇到无法解决的问题，请按照以下步骤提交错误报告：

1. 打开 [GitHub Issues](https://github.com/iAJue/MoeKoeMusic/issues/new)
2. 提供详细的错误描述
3. 附上错误截图
4. 如果可能，附上相关日志文件
5. 说明您的操作系统和应用版本

您也可以在修复错误后提交 Pull Request，我们非常欢迎社区贡献！ 