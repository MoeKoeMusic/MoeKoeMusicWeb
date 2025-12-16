# Ubuntu 系统沙箱启动失败问题

## 问题描述

在 Ubuntu 23.10 及更高版本（包括 Ubuntu 24.04 LTS）上，通过 .deb 安装包安装 MoeKoe Music 后，应用可能无法正常启动，并出现 Chrome 沙箱相关的错误信息。

典型的错误信息包括：

```
[ERROR:zygote_host_impl_linux.cc(89)] Running as root without --no-sandbox is not supported.
FATAL:setuid_sandbox_host.cc(157)] The SUID sandbox helper binary was found, but is not configured correctly.
```

或在尝试修复权限后出现：

```
LaunchProcess: failed to execvp: /opt/MoeKoe
Invalid argument
```

## 问题原因

Ubuntu 23.10+ 引入了新的安全特性，修改了内核参数 `apparmor_restrict_unprivileged_userns` 的默认值为 1。这个设置会阻止非特权用户创建用户命名空间（user namespace），导致 Chrome 的沙箱机制无法正常工作。

当 Chrome 无法使用现代沙箱机制时，会回退到旧版沙箱处理器，但该处理器存在 bug，无法正确处理包含空格的路径（如 `/opt/MoeKoe Music/`），最终导致应用崩溃。

::: warning 注意
一些 Ubuntu 衍生发行版（如 Linux Mint、AnduinOS）可能将此参数默认设置为 0，因此不会遇到此问题。
:::

## 解决方法

### 方法一：配置 AppArmor 配置文件（推荐）

这是最安全的解决方案，通过为应用创建 AppArmor 配置文件来允许其使用用户命名空间：

1. 创建 AppArmor 配置文件：

```bash
sudo nano /etc/apparmor.d/moekoemusic
```

2. 添加以下内容：

```
abi <abi/4.0>,
include <tunables/global>

profile moekoemusic /opt/MoeKoe\ Music/moekoemusic flags=(unconfined) {
  userns,

  include if exists <local/moekoemusic>
}
```

3. 加载配置文件：

```bash
sudo apparmor_parser -r /etc/apparmor.d/moekoemusic
```

4. 重新启动应用，问题应该得到解决。

### 方法二：修改内核参数（临时方案）

::: warning 安全警告
此方法会降低系统安全性，仅建议用于测试或临时使用。不推荐在生产环境中使用。
:::

临时修改内核参数（重启后失效）：

```bash
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```

永久修改（不推荐）：

```bash
echo "kernel.apparmor_restrict_unprivileged_userns=0" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 方法三：使用 --no-sandbox 参数（不推荐）

::: danger 严重警告
禁用沙箱会严重降低应用的安全性，使系统更容易受到恶意代码攻击。强烈不推荐使用此方法。
:::

如果您确实需要临时使用此方法，可以通过以下方式启动应用：

```bash
/opt/MoeKoe\ Music/moekoemusic --no-sandbox
```

## 验证问题是否修复

启动应用后，如果能正常进入主界面并播放音乐，说明问题已解决。

您也可以在终端中启动应用查看是否还有错误信息：

```bash
/opt/MoeKoe\ Music/moekoemusic
```

## 其他注意事项

### 为什么不直接修改应用权限？

有些教程可能建议使用以下命令：

```bash
sudo chown root:root /opt/MoeKoe\ Music/chrome-sandbox
sudo chmod 4755 /opt/MoeKoe\ Music/chrome-sandbox
```

虽然这能解决权限错误，但无法解决 Ubuntu 23.10+ 的命名空间限制问题，仍会遇到 "Invalid argument" 错误。

### 为什么某些发行版不受影响？

不同的 Linux 发行版对安全特性的默认配置不同：

- **Ubuntu 23.10+**：`apparmor_restrict_unprivileged_userns=1`（严格模式）
- **Linux Mint**：`apparmor_restrict_unprivileged_userns=0`（宽松模式）
- **Debian**：取决于具体版本
- **Arch Linux**：通常不启用此限制

## 技术背景

### User Namespace 是什么？

用户命名空间（User Namespace）是 Linux 内核提供的一种隔离机制，允许非特权进程在受限环境中运行。Chrome/Chromium 及其衍生应用（包括 Electron 应用）使用此技术来实现沙箱隔离。

### 为什么 Ubuntu 要限制它？

Ubuntu 认为用户命名空间可能被恶意软件利用来提升权限或绕过安全限制，因此在 23.10 版本中默认启用了更严格的限制。这是一个安全性与兼容性之间的权衡。

### AppArmor 配置文件如何工作？

AppArmor 是 Linux 的一个安全模块，通过配置文件定义应用程序的访问权限。我们创建的配置文件明确允许 MoeKoe Music 使用用户命名空间，而不影响系统的整体安全策略。

## 相关问题链接

- [GitHub Issue #453: MoeKoeMusic installed via .deb package fails to create sandbox on Ubuntu](https://github.com/MoeKoeMusic/MoeKoeMusic/issues/453)

## 其他资源

如果上述方法未能解决您的问题，请参考：

- [调试模式和错误排查](/debug-mode) - 了解如何启用调试模式并查看详细日志
- [GitHub Issues](https://github.com/iAJue/MoeKoeMusic/issues) - 搜索或提交新问题
