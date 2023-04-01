# SocketBE
This is a tool to connect with MinecraftBE via websocket easier.  
  
日本語版はこちら: [README_ja.md](./README_ja.md)  
  
<img src="https://raw.githubusercontent.com/tutinoko2048/SocketBE/main/docs/image.jpeg" alt="image" width="80%"/>  

## Features
- Multiple client connection
- Command execution + Handling responses
- Simple event subscribing
- Player Join/Leave events
- Player score/tag management

## Discord
Support server(Japanese community): https://discord.gg/XGR8FcCeFc  
We are waiting for your contribution and bug reports!  

## Installation:
Requires more than NodeJS v16
  
- Install with clone  
After cloning this repository, run  
`npm i`  
and install the dependencies.  
We can run sample script with:  
`node test.js`  

- Install as npm package  
Run this and install!
`npm i socket-be`  
  
## Try connecting
If you use this inside same device, allow the loopback connection.  
`CheckNetIsolation.exe LoopbackExempt -a -n="Microsoft.MinecraftUWP_8wekyb3d8bbwe"`  
  
Also turn off "Encrypted websocket connection" in Minecraft settings  
  
We use `/wsserver` or `/connect` command to connect with mc  
EX: `/wsserver <IP Address>:<PORT>`  
Try checking firewall setting if fails to connect  
  
## Usage
- Outputs received messages in console, and send back to mc  
```js
const { Server } = require('socket-be');
const server = new Server({
  port: 8000,
  timezone: 'Asia/Tokyo',
});

server.events.on('serverOpen', () => {
  console.log('open!');
});

server.events.on('playerChat', async (event) => {
  if (event.sender === 'External') return; // prevents spam loop
  
  server.logger.info(`<${event.sender}> ${event.message}`);
  
  if (event.message === 'ping') {
    await event.world.sendMessage('Pong!');
  }
});
```
  
## SocketBE Wiki
https://github.com/tutinoko2048/SocketBE/wiki

## License
MIT License!!