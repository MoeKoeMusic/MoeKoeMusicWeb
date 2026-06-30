# 进阶插件开发教程

进阶插件适合需要本地系统能力的场景，例如调用本地可执行程序、处理大量本地数据、接入系统工具或复用已有命令行程序。

示例项目： [MoeKoeMusic/moekoe-native-host-demo](https://github.com/MoeKoeMusic/moekoe-native-host-demo)


## 工作方式

MoeKoe Music 的进阶插件仍然是 Manifest V3 插件，但可以额外声明 `moekoe_native_hosts`。客户端会根据声明启动插件目录内的本地可执行程序，并通过标准输入/输出与它通信。

通信模型：

1. 插件在 `manifest.json` 中声明本地程序。
2. 用户在插件管理页授权该本地程序。
3. 插件页面通过 MoeKoe 暴露的 Native Host API 发送消息。
4. MoeKoe Music 启动本地程序，并把消息写入子进程 stdin。
5. 本地程序通过 stdout 返回 JSON Lines 消息。
6. MoeKoe Music 把返回消息转发给同一个插件的页面。

## 目录结构

进阶插件通常包含插件页面、桥接页和本地程序：

```text
moekoe-native-host-demo/
├─ manifest.json
├─ popup.html
├─ popup.js
├─ bridge.html
├─ bridge.js
└─ bin/
   ├─ win32/
   │  └─ demo-host.exe
   ├─ darwin/
   │  └─ demo-host
   └─ linux/
      └─ demo-host
```

本地程序必须放在插件目录内。不要声明插件目录外的绝对路径。

## manifest 示例

```json
{
  "manifest_version": 3,
  "name": "MoeKoe Native Host Demo",
  "version": "1.0.0",
  "description": "MoeKoe Music Native Host 示例插件",
  "moekoe": true,
  "plugin_id": "moekoe-native-host-demo",
  "minversion": "1.6.6",
  "action": {
    "default_popup": "popup.html"
  },
  "moekoe_permissions": [
    "moekoe:nativeHost"
  ],
  "moekoe_native_hosts": [
    {
      "id": "demo-host",
      "auto_start": false,
      "bridge": "bridge.html",
      "platforms": {
        "win32": {
          "path": "bin/win32/demo-host.exe",
          "args": []
        },
        "darwin": {
          "path": "bin/darwin/demo-host",
          "args": []
        },
        "linux": {
          "path": "bin/linux/demo-host",
          "args": []
        }
      }
    }
  ]
}
```

关键字段：

- `moekoe_permissions`：需要包含 `moekoe:nativeHost`。
- `moekoe_native_hosts`：本地程序声明数组。
- `id`：本地程序 ID，同一个插件内保持唯一。
- `auto_start`：授权后是否自动启动本地程序。
- `bridge`：桥接页路径。桥接页用于接收本地程序返回消息。
- `platforms`：不同平台的本地程序路径。
- `path`：必须是插件目录内的相对路径。
- `args`：启动本地程序时传入的字符串参数数组。

Windows 平台的本地程序路径必须以 `.exe` 结尾。

## 插件侧发送消息

插件页面可以调用 MoeKoe Music 暴露的 Native Host API：

```js
const hostId = 'demo-host'

async function sendMessage(payload) {
  const status = await window.electronAPI.nativeHost.getStatus(hostId)
  if (!status.success || !status.host.authorized) {
    throw new Error('本地程序未授权')
  }

  const result = await window.electronAPI.nativeHost.send(hostId, payload)
  if (!result.success) {
    throw new Error(result.message || '发送失败')
  }
}

sendMessage({
  action: 'ping'
})
```

发送的消息会被 MoeKoe Music 包装为 JSON Lines 写入本地程序 stdin：

```json
{"type":"message","payload":{"action":"ping"}}
```

## 桥接页接收消息

桥接页需要监听本地程序返回的消息：

```js
window.electronAPI.nativeHost.onMessage(({ hostId, message }) => {
  if (hostId !== 'demo-host') return

  chrome.runtime.sendMessage({
    type: 'native-host-message',
    hostId,
    message
  })
})
```

如果 popup 或其他插件页面需要接收结果，可以再通过 `chrome.runtime.onMessage` 转发。

## 本地程序通信协议

本地程序从 stdin 读取 JSON Lines，每行是一个 JSON 对象。常见输入：

```json
{"type":"message","payload":{"action":"ping"}}
```

应用退出、插件卸载或取消授权时，可能收到关闭消息：

```json
{"type":"shutdown"}
```

本地程序向 stdout 输出 JSON Lines：

```json
{"type":"pong","time":1710000000000}
```

注意事项：

- 每条 stdout 消息必须以换行结尾。
- stdout 必须输出合法 JSON。
- 单条消息不要超过 64 KB。
- 日志建议输出到 stderr，避免污染 stdout 的 JSON 协议。

## 授权和安全限制

Native Host 属于高权限能力，MoeKoe Music 会做以下限制：

- 插件必须声明 `moekoe:nativeHost` 权限。
- 本地程序路径必须位于插件目录内。
- 不允许使用绝对路径或 `../` 跳出插件目录。
- 只支持 `win32`、`darwin`、`linux` 三个平台声明。
- 用户必须在插件管理页手动授权后，插件才能发送消息。
- 插件不能自己修改 Native Host 授权状态。
