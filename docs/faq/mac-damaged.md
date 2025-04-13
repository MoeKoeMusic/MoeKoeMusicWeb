# Mac系统应用显示"已损坏"解决方法

## 问题描述

在 macOS 系统上，当您下载并尝试打开 MoeKoe Music 时，可能会遇到系统提示应用"已损坏"或"无法打开"的问题。这通常是由于 macOS 的安全机制（Gatekeeper）阻止了未经苹果官方认证的应用运行所导致的。

## 解决方法

### 方法一：使用终端清除应用扩展属性（推荐）

1. 打开"终端"应用程序（可在"应用程序/实用工具"中找到）
2. 输入以下命令，并按回车键执行：

```bash
xattr -cr /Applications/MoeKoeMusic.app
```

> 注意：如果您的应用安装在其他位置，请相应地更改命令中的路径。

3. 命令执行完毕后，再次尝试打开应用

这个命令会递归清除应用的扩展属性，解决 macOS 的不信任问题。

### 方法二：暂时禁用 Gatekeeper（仅用于测试）

如果上述方法不起作用，您可以尝试暂时禁用 macOS 的 Gatekeeper 功能：

1. 打开"终端"应用程序
2. 输入以下命令并按回车键（需要输入管理员密码）：

```bash
sudo spctl --master-disable
```

3. 尝试再次打开应用
4. 使用完毕后，建议重新启用安全设置：

```bash
sudo spctl --master-enable
```

> **警告**：禁用 Gatekeeper 会降低系统安全性，仅推荐在确认应用安全的情况下临时使用此方法。

## 为什么会出现这个问题？

在 GitHub Actions 等自动化平台上打包的 macOS 应用程序通常未经过苹果的代码签名和公证流程，因此 macOS 会将其视为不可信的应用。MoeKoe Music 作为开源软件，尚未完成苹果的官方公证流程，因此会触发这一安全机制。

## 相关问题链接

- [Mac 安装程序显示 "已损坏" 如何处理?](https://github.com/iAJue/MoeKoeMusic/issues/3)
- [Mac 安装後遇到問題如何該怎麼解決?](https://github.com/iAJue/MoeKoeMusic/issues/204)

## 其他 macOS 相关问题

如果您遇到其他 macOS 相关问题，请参考[macOS 常见问题排查](/mac-troubleshooting)页面获取更多帮助。 