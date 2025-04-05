# WebSocket API 文档

本文档详细说明了 MoeKoe Music 的 WebSocket API 接口规范。通过 WebSocket，客户端可以实时接收音乐播放状态更新、歌词同步等功能。

## 连接信息

- WebSocket 服务地址：`ws://127.0.0.1:6520/` *(请以客户端显示的为准)*
- 协议：`ws://`
- 默认端口：6520

## 消息格式

所有的消息都使用 JSON 格式进行传输：

```json
{
  "type": "string",    // 消息类型
  "data": object,      // 消息数据
}
```

## 消息类型

### 1. 欢迎消息 (welcome)

* 当客户端连接成功时，服务器会发送欢迎消息
```json
{
  "type": "welcome",
  "data": {
        "type": "welcome",
        "data": "感谢接入MoeKoe Music，文档地址：https://music.moekoe.cn/"
    }
}
```

### 2. 歌曲信息 (lyrics)

* 当客户端首次连接时或歌曲数据发生变化时，服务器会发送歌曲信息消息
```json
{
  "type": "lyrics",
  "data": { 
        "currentTime": number, // 当前时间
        "lyricsData": string, // 歌词数据
        "currentSong": object, // 当前歌曲信息
        "duration": number // 总时长
    }
}
```

### 3. 播放状态 (playerState)

* 当客户端首次连接时或播放状态发生变化时，服务器会发送播放状态消息
```json
{
  "type": "playerState",
  "data": {
        "isPlaying": boolean, // 是否正在播放
        "currentTime": number // 当前时间
    }
}
```

## 客户端命令

客户端可以发送以下命令来控制播放器：

### 1. 播放控制 (player_control)

```json
{
  "type": "control",
  "data": {
    "command": "toggle|next|prev", // 控制命令，toggle 切换播放状态，next 下一首，prev 上一首
  }
}
```

## 错误处理

当发生错误时，服务器会发送错误消息：

```json
{
  "type": "error",
  "data": {
    "code": number,     // 错误代码
    "message": string   // 错误描述
  }
}
```

## 示例代码

### JavaScript 客户端示例

```javascript
const ws = new WebSocket('ws://127.0.0.1:6520/');

ws.onopen = () => {
  console.log('连接已建立');
};

ws.onmessage = (event) => {
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

// 发送播放命令
function play() {
  ws.send(JSON.stringify({
    type: 'control',
    data: {
      command: 'toggle'
    }
  }));
}
```

## 注意事项

1. 建议使用 WebSocket 客户端库来处理重连、心跳等机制
2. 所有时间相关的值都使用 UTC 时间戳
3. 建议实现错误重试机制