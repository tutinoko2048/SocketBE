---
title: イベント処理
description: SocketBEを使用してMinecraftのさまざまなイベントを処理する方法を学ぶ
---

# SocketBEでのイベント処理

SocketBEを使用すると、Minecraft世界で発生するさまざまなイベントに簡単に応答できます。このガイドでは、イベントシステムの使い方について説明します。

## 利用可能なイベント

SocketBEはMinecraftイベント用の包括的なイベントハンドラーを提供しています。これらのイベントは`ServerEvent`列挙型を通じて利用できます：

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });
```

主なイベントには以下が含まれます：

- `ServerEvent.PlayerJoin` - プレイヤーがゲームに参加したときに発生
- `ServerEvent.PlayerLeave` - プレイヤーがゲームを退出したときに発生
- `ServerEvent.PlayerChat` - プレイヤーがチャットメッセージを送信したときに発生
- `ServerEvent.BlockPlaced` - ブロックが配置されたときに発生
- `ServerEvent.BlockBroken` - ブロックが壊されたときに発生
- `ServerEvent.ItemAcquired` - プレイヤーがアイテムを入手したときに発生
- `ServerEvent.ItemCrafted` - プレイヤーがアイテムをクラフトしたときに発生
- `ServerEvent.ItemEquipped` - プレイヤーがアイテムを装備したときに発生

## 基本的なイベント処理

イベントを処理するには、サーバーインスタンスの`on`メソッドを使用します：

```js
server.on(ServerEvent.PlayerJoin, ev => {
  const { player } = ev;
  console.log(`プレイヤー${player.name}がゲームに参加しました`);
});
```

## イベントデータ

各イベントは関連するデータを提供します。例えば、`PlayerChat`イベントには次のものが含まれます：

```js
server.on(ServerEvent.PlayerChat, ev => {
  const { sender, message, world } = ev;
  
  console.log(`${sender.name}が言いました: ${message}`);
  
  // メッセージに応答できます
  world.sendMessage(`エコー: ${message}`);
});
```

## 非同期イベント処理

イベントはasync/awaitを使用して非同期に処理できます：

```js
server.on(ServerEvent.BlockBroken, async ev => {
  const { player, block, world } = ev;
  
  console.log(`${player.name}が${block.type}ブロックを壊しました`);
  
  // 非同期操作を実行する
  await world.sendMessage(`${player.name}がブロックを壊しました！`);
});
```

## 複数のイベントリスナー

同じイベントに対して複数のリスナーを登録できます：

```js
// プレイヤーの参加をログに記録
server.on(ServerEvent.PlayerJoin, ev => {
  console.log(`${ev.player.name}が参加しました`);
});

// 参加したプレイヤーを歓迎
server.on(ServerEvent.PlayerJoin, async ev => {
  await ev.world.sendMessage(`ようこそ、${ev.player.name}さん！`);
});
```

## イベントリスナーの削除

イベントリスナーが不要になった場合は削除することもできます：

```js
// イベントハンドラー関数への参照を保存
const onPlayerJoin = ev => {
  console.log(`${ev.player.name}がゲームに参加しました`);
};

// イベントリスナーを追加
server.on(ServerEvent.PlayerJoin, onPlayerJoin);

// 後でイベントリスナーを削除
server.off(ServerEvent.PlayerJoin, onPlayerJoin);
```

## 例：カスタムゲームモード

ブロックとのプレイヤーの相互作用を監視してカスタムゲームモードを実装する、より完全な例を紹介します：

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });
const playerScores = new Map();

server.on(ServerEvent.Open, () => {
  console.log('カスタムゲームモードサーバーが起動しました');
});

// プレイヤーが参加したときの追跡
server.on(ServerEvent.PlayerJoin, ev => {
  const { player } = ev;
  playerScores.set(player.name, 0);
  console.log(`${player.name}がゲームに参加しました`);
});

// プレイヤーが退出したときの追跡
server.on(ServerEvent.PlayerLeave, ev => {
  const { player } = ev;
  playerScores.delete(player.name);
  console.log(`${player.name}がゲームを退出しました`);
});

// 特定のブロックを壊すとポイントを付与
server.on(ServerEvent.BlockBroken, async ev => {
  const { player, block, world } = ev;
  
  if (block.type.includes('ore')) {
    const currentScore = playerScores.get(player.name) || 0;
    const newScore = currentScore + 1;
    playerScores.set(player.name, newScore);
    
    await world.sendMessage(`${player.name}が鉱石を見つけました！スコア: ${newScore}`);
  }
});

// チャットコマンドでスコアボードを表示
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!score') {
    const score = playerScores.get(sender.name) || 0;
    await world.sendMessage(`${sender.name}のスコア: ${score}`);
  }
  
  if (message === '!scoreboard') {
    const scores = Array.from(playerScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, score]) => `${name}: ${score}`)
      .join('\n');
    
    await world.sendMessage(`スコアボード:\n${scores}`);
  }
});
```

## 次のステップ

- [コマンド実行](/ja/guides/command-execution/)について学ぶ
- [プレイヤー管理](/ja/guides/player-management/)を探索する
- [ワールド操作](/ja/guides/world-manipulation/)ガイドをチェックする
