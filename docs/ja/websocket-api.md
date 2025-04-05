# WebSocket API ドキュメント

このドキュメントでは、MoeKoe Musicの WebSocket API インターフェース仕様について詳しく説明します。WebSocketを通じて、クライアントはリアルタイムで音楽再生状態の更新、歌詞の同期などの機能を受信できます。

## 接続情報

- WebSocketサービスアドレス：`ws://127.0.0.1:6520/` *(クライアント表示を参照してください)*
- プロトコル：`ws://`
- デフォルトポート：6520

## メッセージフォーマット

すべてのメッセージはJSON形式で送信されます：

```json
{
  "type": "string",    // メッセージタイプ
  "data": object,      // メッセージデータ
}
```

## メッセージタイプ

### 1. ウェルカムメッセージ (welcome)

* クライアントが接続に成功すると、サーバーはウェルカムメッセージを送信します
```json
{
  "type": "welcome",
  "data": {
        "type": "welcome",
        "data": "MoeKoe Musicへようこそ、ドキュメント：https://music.moekoe.cn/"
    }
}
```

### 2. 楽曲情報 (lyrics)

* クライアントが最初に接続したとき、または楽曲データが変更されたときに、サーバーは楽曲情報メッセージを送信します
```json
{
  "type": "lyrics",
  "data": { 
        "currentTime": number, // 現在の時間
        "lyricsData": string, // 歌詞データ
        "currentSong": object, // 現在の楽曲情報
        "duration": number // 総再生時間
    }
}
```

### 3. 再生状態 (playerState)

* クライアントが最初に接続したとき、または再生状態が変更されたときに、サーバーは再生状態メッセージを送信します
```json
{
  "type": "playerState",
  "data": {
        "isPlaying": boolean, // 再生中かどうか
        "currentTime": number // 現在の時間
    }
}
```

## クライアントコマンド

クライアントは以下のコマンドを送信してプレーヤーを制御できます：

### 1. 再生制御 (player_control)

```json
{
  "type": "control",
  "data": {
    "command": "toggle|next|prev", // 制御コマンド：再生状態の切り替え、次の曲、前の曲
  }
}
```

## エラー処理

エラーが発生した場合、サーバーはエラーメッセージを送信します：

```json
{
  "type": "error",
  "data": {
    "code": number,     // エラーコード
    "message": string   // エラー説明
  }
}
```

## サンプルコード

### JavaScript クライアント例

```javascript
const ws = new WebSocket('ws://127.0.0.1:6520/');

ws.onopen = () => {
  console.log('接続が確立されました');
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

// 再生コマンドの送信
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

1. 再接続やハートビートなどの機能を処理するために、WebSocketクライアントライブラリの使用を推奨します
2. すべての時間関連の値はUTCタイムスタンプを使用します
3. エラーリトライメカニズムの実装を推奨します 