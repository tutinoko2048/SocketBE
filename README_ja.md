# SocketBE
MinecraftBEで使えるWebSocketのライブラリです。

## Discord


## 使い方:
NodeJS v16以上が必要なのでインストールしてください。  
  
- cloneして使う場合
このリポジトリをCloneした後
`npm i`  
で依存パッケージをインストールしてください。  
`node test.js`  
で動かすことができます。  

- npmのライブラリとして使う場合
`npm i socket-be`
でインストールしてください  
  
使用例: (送られたメッセージをコンソールに出力、そのまま送り返す)
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
  if (event.sender === '外部') return;
  
  server.logger.info(`<${event.sender}> ${event.message}`);
  
  if (event.message === 'ping') {
    await event.world.sendMessage('Pong!');
  }
});
```
  
使用例2: ("apple"とチャットしたプレイヤーが10以上のスコアを持っていたらりんごを与える)
```js
server.events.on('playerChat', async (event) => {
  const { sender, message, world } = event;
  if (sender === '外部') return;
  
  if (message === 'apple') {
    const score = await world.scoreboards.getScore(sender, 'objective');
    if (score >= 10) await world.runCommand(`give "${sender}" apple`);
  }
});
```