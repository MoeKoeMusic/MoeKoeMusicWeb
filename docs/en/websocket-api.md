# WebSocket API Documentation

This document details the WebSocket API interface specification for MoeKoe Music. Through WebSocket, clients can receive real-time music playback status updates, lyrics synchronization, and other features.

## Connection Information

- WebSocket Service Address: `ws://127.0.0.1:6520/` *(Please refer to the client display)*
- Protocol: `ws://`
- Default Port: 6520

## Message Format

All messages are transmitted in JSON format:

```json
{
  "type": "string",    // Message type
  "data": object,      // Message data
}
```

## Message Types

### 1. Welcome Message (welcome)

* When the client connects successfully, the server will send a welcome message
```json
{
  "type": "welcome",
  "data": {
        "type": "welcome",
        "data": "Welcome to MoeKoe Music, documentation: https://music.moekoe.cn/"
    }
}
```

### 2. Song Information (lyrics)

* When the client first connects or when song data changes, the server will send song information messages
```json
{
  "type": "lyrics",
  "data": { 
        "currentTime": number, // Current time
        "lyricsData": string, // Lyrics data
        "currentSong": object, // Current song information
        "duration": number // Total duration
    }
}
```

### 3. Playback Status (playerState)

* When the client first connects or when playback status changes, the server will send playback status messages
```json
{
  "type": "playerState",
  "data": {
        "isPlaying": boolean, // Whether it is playing
        "currentTime": number // Current time
    }
}
```

## Client Commands

Clients can send the following commands to control the player:

### 1. Playback Control (player_control)

```json
{
  "type": "control",
  "data": {
    "command": "toggle|next|prev", // Control commands: toggle play state, next song, previous song
  }
}
```

## Error Handling

When an error occurs, the server will send an error message:

```json
{
  "type": "error",
  "data": {
    "code": number,     // Error code
    "message": string   // Error description
  }
}
```

## Example Code

### JavaScript Client Example

```javascript
const ws = new WebSocket('ws://127.0.0.1:6520/');

ws.onopen = () => {
  console.log('Connection established');
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

// Send play command
function play() {
  ws.send(JSON.stringify({
    type: 'control',
    data: {
      command: 'toggle'
    }
  }));
}
```

## Notes

1. It is recommended to use WebSocket client libraries to handle reconnection and heartbeat mechanisms
2. All time-related values use UTC timestamps
3. It is recommended to implement error retry mechanisms 