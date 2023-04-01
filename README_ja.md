# SocketBE
MinecraftBEで使えるWebSocketのライブラリです。  
  
<img src="https://raw.githubusercontent.com/tutinoko2048/SocketBE/main/docs/image.jpeg" alt="image" width="80%"/>  

## 特徴
- 複数クライアントの接続
- コマンドの実行+レスポンスの受け取り
- イベントの登録
- プレイヤーの参加/退出イベント
- プレイヤーのスコア/タグの管理

## Discord
サポートサーバー: https://discord.gg/XGR8FcCeFc  
機能の提案、バグの報告などもお待ちしています！  

## インストール:
NodeJS v16以上が必要なのでインストールしてください。  
  
- cloneして使う場合  
このリポジトリをCloneした後  
`npm i`  
で依存パッケージをインストールしてください。  
`node test.js`  
でサンプルを動かすことができます。  

- npmのライブラリとして使う場合  
`npm i socket-be`  
でインストールしてください  
  
## 繋いでみよう
同じPC内で接続する場合はループバック接続を許可してください
`CheckNetIsolation.exe LoopbackExempt -a -n="Microsoft.MinecraftUWP_8wekyb3d8bbwe"`  
  
マイクラの設定で暗号化したWebSocket接続をオフにしてください  
  
マイクラとの接続には `/wsserver` または `/connect` コマンドを使用します  
EX: `/wsserver <IPアドレス>:<ポート>`  
繋がらない時はファイアウォールの設定も確認してみてください。  
  
## 使用例
- 送られたメッセージをコンソールに出力、そのまま送り返す  
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
  if (event.sender === '外部') return; // スパムの無限ループを防ぐ
  
  server.logger.info(`<${event.sender}> ${event.message}`);
  
  if (event.message === 'ping') {
    await event.world.sendMessage('Pong!');
  }
});
```
  
## SocketBE Wiki
https://github.com/tutinoko2048/SocketBE/wiki

## License
MITライセンスです。