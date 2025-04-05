# WebSocket API 文檔

本文檔詳細說明了 MoeKoe Music 的 WebSocket API 介面規範。通過 WebSocket，客戶端可以即時接收音樂播放狀態更新、歌詞同步等功能。

## 連接資訊

- WebSocket 服務地址：`ws://127.0.0.1:6520/` *(請以客戶端顯示的為準)*
- 協議：`ws://`
- 預設連接埠：6520

## 訊息格式

所有的訊息都使用 JSON 格式進行傳輸：

```json
{
  "type": "string",    // 訊息類型
  "data": object,      // 訊息資料
}
```

## 訊息類型

### 1. 歡迎訊息 (welcome)

* 當客戶端連接成功時，伺服器會發送歡迎訊息
```json
{
  "type": "welcome",
  "data": {
        "type": "welcome",
        "data": "感謝接入MoeKoe Music，文檔地址：https://music.moekoe.cn/"
    }
}
```

### 2. 歌曲資訊 (lyrics)

* 當客戶端首次連接時或歌曲資料發生變化時，伺服器會發送歌曲資訊訊息
```json
{
  "type": "lyrics",
  "data": { 
        "currentTime": number, // 當前時間
        "lyricsData": string, // 歌詞資料
        "currentSong": object, // 當前歌曲資訊
        "duration": number // 總時長
    }
}
```

### 3. 播放狀態 (playerState)

* 當客戶端首次連接時或播放狀態發生變化時，伺服器會發送播放狀態訊息
```json
{
  "type": "playerState",
  "data": {
        "isPlaying": boolean, // 是否正在播放
        "currentTime": number // 當前時間
    }
}
```

## 客戶端命令

客戶端可以發送以下命令來控制播放器：

### 1. 播放控制 (player_control)

```json
{
  "type": "control",
  "data": {
    "command": "toggle|next|prev", // 控制命令，toggle 切換播放狀態，next 下一首，prev 上一首
  }
}
```

## 錯誤處理

當發生錯誤時，伺服器會發送錯誤訊息：

```json
{
  "type": "error",
  "data": {
    "code": number,     // 錯誤代碼
    "message": string   // 錯誤描述
  }
}
```

## 示例程式碼

### JavaScript 客戶端示例

```javascript
const ws = new WebSocket('ws://127.0.0.1:6520/');

ws.onopen = () => {
  console.log('連接已建立');
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

// 發送播放命令
function play() {
  ws.send(JSON.stringify({
    type: 'control',
    data: {
      command: 'toggle'
    }
  }));
}
```

## 注意事項

1. 建議使用 WebSocket 客戶端函式庫來處理重連、心跳等機制
2. 所有時間相關的值都使用 UTC 時間戳
3. 建議實現錯誤重試機制