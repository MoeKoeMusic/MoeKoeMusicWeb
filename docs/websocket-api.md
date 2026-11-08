# WebSocket API 文档

本文档说明 MoeKoe Music 的 WebSocket API 接口规范。通过 WebSocket，客户端可以实时接收音乐播放状态更新、歌词同步等信息，也可以下发播放控制指令。

## 连接信息

WebSocket 服务由客户端的 **API 模式**提供，只有 API 模式开启时才存在：

- 默认地址：`ws://127.0.0.1:6520/moekoe`
- 默认端口：`6520`
- 默认路径：`/moekoe`

端口与路径由客户端的 `apiModeConfig` 决定，被用户修改后地址会随之变化，因此**不要写死端口或路径**，请参考下一节获取实际地址。

::: warning 先开启 API 模式
路径：`设置` → `系统` → `API模式`，选择「自动决定」或「始终开启」，修改后需重启应用生效。

选择「始终关闭」时服务不会启动，连接会直接失败（`ECONNREFUSED`）。
:::

## 获取终结点

应用内页面与插件可以通过主世界的 `electronAPI.getApiModeUrl()` 获取真实的 HTTP 与 WebSocket 地址：

```js
const apiModeUrl = await electronAPI.getApiModeUrl(); // { http: string, ws: string } | null
if (!apiModeUrl) throw new Error('API 模式未开启');

const socket = new WebSocket(apiModeUrl.ws);
```

- 返回值中的 `ws` 形如 `ws://127.0.0.1:6520/moekoe`。
- 该接口由客户端 preload 注入，只在页面主世界可用，外部程序无法调用，请使用客户端设置中的实际端口（或默认值）。
- 插件申请 API 模式权限的方式见 [进阶插件开发教程](/guide/advanced-plugin-development)。

## 消息格式

所有消息都使用 JSON 格式传输：

```json
{
  "type": "string",   // 消息类型
  "data": any         // 消息数据，类型取决于 type
}
```

`data` 的类型随消息类型而定：`welcome` 是字符串，`lyrics` 与 `playerState` 是对象。

## 消息类型

### 1. 欢迎消息 (welcome)

连接建立后立即发送：

```json
{
  "type": "welcome",
  "data": "感谢接入MoeKoe Music，文档地址：https://music.moekoe.cn/"
}
```

### 2. 歌曲信息 (lyrics)

首次连接时（若客户端已持有歌词数据）以及歌词发生变化时发送：

```json
{
  "type": "lyrics",
  "data": {
    "currentTime": number, // 播放进度（秒）
    "lyricsData": string,  // 歌词原始文本，无歌词时可能为空数组 []
    "currentSong": object, // 当前歌曲信息
    "duration": number     // 歌曲总时长（秒）
  }
}
```

### 3. 播放状态 (playerState)

首次连接时以及播放状态变化时发送：

```json
{
  "type": "playerState",
  "data": {
    "isPlaying": boolean, // 是否正在播放
    "currentTime": number // 播放进度（秒）
  }
}
```

## 客户端命令

客户端可以发送命令控制播放器，目前只处理 `type` 为 `control` 的消息：

### 1. 播放控制 (control)

```json
{
  "type": "control",
  "data": {
    "command": "toggle|next|prev" // toggle 切换播放状态，next 下一首，prev 上一首
  }
}
```

`command` 只支持 `toggle`、`next`、`prev` 三个值，其他值会被忽略。

## 错误处理

当前版本**不会主动下发 `error` 消息**：

- JSON 解析失败或 `type` 未知的消息会被直接忽略，只在客户端日志中留下记录。
- 连接断开时服务端不会通知原因，需要客户端自行重连。

因此客户端应自行处理连接失败、消息解析失败与重连逻辑，不要依赖服务端回传错误。

## 示例代码

### JavaScript 客户端示例

```javascript
const socket = new WebSocket('ws://127.0.0.1:6520/moekoe');

socket.onopen = () => {
  console.log('连接已建立');
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  switch (message.type) {
    case 'welcome':
      updateWelcome(message.data);
      break;
    case 'lyrics':
      updateLyrics(message.data);
      break;
    case 'playerState':
      updatePlayerState(message.data);
      break;
  }
};

socket.onerror = () => console.error('连接出错');
socket.onclose = () => console.log('连接已关闭');

// 发送播放命令
function play() {
  socket.send(JSON.stringify({
    type: 'control',
    data: {
      command: 'toggle'
    }
  }));
}
```

## 注意事项

1. 建议使用 WebSocket 客户端库来处理重连、心跳等机制。
2. `currentTime` 与 `duration` 都是播放进度的秒数，不是 UTC 时间戳。
3. 连接失败时，先确认 API 模式是否开启，再检查端口与路径是否与客户端设置一致。
