**English** | [日本語](./README_ja.md)

# SocketBE
A powerful websocket library to interact with MCBE WebSocket Protocol  
  
  
<img src="./docs/image.png" alt="image" width="80%"/>  

## Features
- Fully typed vanilla event handler
- Command execution + Handling responses
- Multiple connection support
- Various wrapper APIs (World, Player, Scoreboard, etc.)
- Encryption support

## Installation:
Requires Node.js v18 or later.
```bash
npm install socket-be
```
  
## Running:
If you use this inside same device, allow the loopback connection.  
`CheckNetIsolation.exe LoopbackExempt -a -n="Microsoft.MinecraftUWP_8wekyb3d8bbwe"`  
    
You can use `/wsserver` or `/connect` command to connect with websocket server.  
EX: `/wsserver <IP Address>:<PORT>`  
  
## Usage
- Outputs received messages in console, and send back to mc  
```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 })

server.on(ServerEvent.Open, () => {
  console.log('Server started')
});

server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;

  if (sender.name === 'External') return; // prevents spam loop

  console.log(`<${sender.name}> ${message}`);

  if (message === 'ping') {
    await world.sendMessage('Pong!');
  }
});
```

## License
This project is licensed under the GPL-3.0 License.