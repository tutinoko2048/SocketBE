[English](./README.md) | **日本語**

# SocketBE
Minecraft統合版のWebSocketプロトコルと通信するためのライブラリです。

<img src="./docs/image.png" alt="image" width="80%"/>

## 主な機能
- Minecraftから送信されるイベントの型安全なハンドリング
- コマンドの実行とそのレスポンスの受け取り
- 複数クライアントとの接続
- World, Player, Scoreboard等の操作を抽象化した簡単なAPI
- 暗号化された接続のサポート

## インストール:
Node.js v18以上が必要です。
```bash
npm i socket-be
```
```bash
pnpm add socket-be
```
```bash
bun add socket-be
```

## マイクラとの接続方法
接続には `/wsserver` または `/connect` コマンドを使用します。

**コマンドの構文**: `/wsserver <アドレス>:<ポート>`

**例**: `/wsserver localhost:8000`

繋がらない時はファイアウォールの設定も確認してみてください。

## 使用例
```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });

server.on(ServerEvent.Open, () => {
  console.log('Server started');
});

// 受け取ったチャットメッセージをコンソールに出力し、同じ内容をマイクラに送り返す
server.on(ServerEvent.PlayerChat, async (ev) => {
  const { sender, message, world } = ev;

  console.log(`<${sender.name}> ${message}`);

  await world.sendMessage(`You said: ${message}`);
});
```

```js
// プレイヤーの参加退出ログを出力
server.on(ServerEvent.PlayerJoin, (ev) => {
  console.log(`${ev.player.name} joined the game`);
});

server.on(ServerEvent.PlayerLeave, (ev) => {
  console.log(`${ev.player.name} left the game`);
});
```

```js
// コマンドの実行
server.on(ServerEvent.PlayerChat, async (ev) => {
  const { message, world } = ev;

  if (message === '!diamond') {
    await world.runCommand('give @a diamond');
  }
});
```

DeepWikiを利用したドキュメントはこちらです: https://deepwiki.com/tutinoko2048/SocketBE

## License
このプロジェクトはMITライセンスの下で公開されています。
