---
title: プレイヤー管理
description: SocketBEを使ってプレイヤーを管理し操作する方法を学ぶ
---

# SocketBEでのプレイヤー管理

SocketBEは、Minecraftの世界でプレイヤーと対話するための強力なツールを提供します。このガイドでは、プレイヤーを管理・操作するさまざまな方法を説明します。

## プレイヤー情報の取得

イベントオブジェクトやワールドインスタンスを通じてプレイヤー情報にアクセスできます：

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });

// プレイヤーが参加したときに情報を取得
server.on(ServerEvent.PlayerJoin, ev => {
  const { player } = ev;
  
  console.log(`プレイヤー名: ${player.name}`);
  console.log(`プレイヤーID: ${player.id}`);
  console.log(`プレイヤー位置: ${player.location.x}, ${player.location.y}, ${player.location.z}`);
});

// ワールド内のすべてのプレイヤーを取得
server.on(ServerEvent.WorldInitialize, async ev => {
  const { world } = ev;
  
  try {
    const players = await world.getPlayers();
    console.log(`ワールドには${players.length}人のプレイヤーがいます：`);
    
    players.forEach(player => {
      console.log(`- ${player.name} (ID: ${player.id})`);
    });
  } catch (error) {
    console.error('プレイヤー取得エラー:', error);
  }
});
```

## プレイヤーとの対話

### プレイヤーにアイテムを与える

`giveItem`メソッドを使用してプレイヤーにアイテムを与えることができます：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!diamond') {
    try {
      // 基本的なアイテムを与える簡単な方法
      await sender.giveItem('diamond', 1);
      await world.sendMessage(`${sender.name}にダイヤモンドを与えました`);
    } catch (error) {
      console.error('アイテム付与エラー:', error);
    }
  }
  
  if (message === '!sword') {
    try {
      // エンチャント付きの高度な方法
      await sender.giveItem({
        item: 'diamond_sword',
        amount: 1,
        data: 0,
        nameTag: '破壊者',
        enchantments: [
          { id: 'sharpness', level: 5 },
          { id: 'unbreaking', level: 3 }
        ]
      });
      await world.sendMessage(`${sender.name}にエンチャントされた剣を与えました`);
    } catch (error) {
      console.error('エンチャントアイテム付与エラー:', error);
    }
  }
});
```

### プレイヤーのテレポート

プレイヤーを特定の座標や他のプレイヤーにテレポートできます：

```js
// プレイヤーを特定の座標にテレポート
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message } = ev;
  
  if (message === '!spawn') {
    try {
      await sender.teleport(0, 100, 0);
      console.log(`${sender.name}をスポーンにテレポートしました`);
    } catch (error) {
      console.error('テレポートエラー:', error);
    }
  }
});

// すべてのプレイヤーを特定の場所にテレポート
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!tpall') {
    try {
      const players = await world.getPlayers();
      const { location } = sender;
      
      for (const player of players) {
        if (player.id !== sender.id) {
          await player.teleport(location.x, location.y, location.z);
          console.log(`${player.name}を${sender.name}にテレポートしました`);
        }
      }
      
      await world.sendMessage('すべてのプレイヤーがあなたの位置にテレポートされました');
    } catch (error) {
      console.error('プレイヤーテレポートエラー:', error);
    }
  }
});
```

### ゲーム効果の適用

プレイヤーにさまざまなゲーム効果を適用できます：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!effect') {
    try {
      // プレイヤーに速度効果を適用
      await world.runCommand(`effect "${sender.name}" speed 30 2`);
      await world.sendMessage('スピードブーストが適用されました！');
    } catch (error) {
      console.error('効果適用エラー:', error);
    }
  }
});
```

## プレイヤーイベント

SocketBEはいくつかのプレイヤー固有のイベントを提供しています：

```js
// プレイヤー参加イベント
server.on(ServerEvent.PlayerJoin, ev => {
  console.log(`${ev.player.name}がゲームに参加しました`);
});

// プレイヤー退出イベント
server.on(ServerEvent.PlayerLeave, ev => {
  console.log(`${ev.player.name}がゲームを退出しました`);
});

// プレイヤーチャットイベント
server.on(ServerEvent.PlayerChat, ev => {
  console.log(`${ev.sender.name}が言いました: ${ev.message}`);
});

// プレイヤー移動/変形イベント
server.on(ServerEvent.PlayerTransform, ev => {
  const { player, location } = ev;
  console.log(`${player.name}が${location.x}, ${location.y}, ${location.z}に移動しました`);
});
```

## プレイヤーの選択とフィルタリング

Minecraftのセレクター構文を使用してプレイヤーをクエリできます：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { message, world } = ev;
  
  if (message === '!list') {
    try {
      // すべてのプレイヤーを取得
      const allPlayers = await world.getPlayers('@a');
      console.log('すべてのプレイヤー:', allPlayers.map(p => p.name).join(', '));
      
      // 最も近いプレイヤーを取得
      const nearestPlayer = await world.getPlayers('@p');
      if (nearestPlayer.length > 0) {
        console.log('最も近いプレイヤー:', nearestPlayer[0].name);
      }
      
      // ランダムなプレイヤーを取得
      const randomPlayer = await world.getPlayers('@r');
      if (randomPlayer.length > 0) {
        console.log('ランダムなプレイヤー:', randomPlayer[0].name);
      }
    } catch (error) {
      console.error('プレイヤークエリエラー:', error);
    }
  }
});
```

## プレイヤー権限と能力

プレイヤーの能力をチェックして設定できます：

```js
server.on(ServerEvent.PlayerJoin, async ev => {
  const { player, world } = ev;

  try {
    // プレイヤーがオペレーターかどうかをチェック
    const isOp = await world.runCommand(`testfor @a[name="${player.name}",tag=op]`);
    
    if (isOp.statusCode === 0) {
      console.log(`${player.name}はオペレーターです`);
      // 特別な能力や権限を付与
    } else {
      console.log(`${player.name}はオペレーターではありません`);
    }
  } catch (error) {
    console.error('オペレータステータスチェックエラー:', error);
  }
});
```

## プレイヤーインベントリ管理

プレイヤーのインベントリをチェックして操作できます：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!clear') {
    try {
      // プレイヤーのインベントリをクリア
      await world.runCommand(`clear "${sender.name}"`);
      await world.sendMessage('あなたのインベントリがクリアされました');
    } catch (error) {
      console.error('インベントリクリアエラー:', error);
    }
  }
  
  if (message === '!kit starter') {
    try {
      // プレイヤーにスターターキットを与える
      await sender.giveItem('stone_sword', 1);
      await sender.giveItem('stone_pickaxe', 1);
      await sender.giveItem('stone_axe', 1);
      await sender.giveItem('bread', 16);
      await world.sendMessage('スターターキットを受け取りました');
    } catch (error) {
      console.error('スターターキット付与エラー:', error);
    }
  }
});
```

## プレイヤーイベントの追跡

プレイヤーの統計情報を追跡する、より包括的な例を示します：

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });
const playerStats = new Map();

// プレイヤーの統計を初期化
server.on(ServerEvent.PlayerJoin, ev => {
  const { player } = ev;
  
  // プレイヤーの統計を作成またはリセット
  playerStats.set(player.id, {
    name: player.name,
    joinTime: Date.now(),
    blocksBroken: 0,
    blocksPlaced: 0,
    chatMessages: 0,
    deaths: 0
  });
  
  console.log(`${player.name}が参加しました。統計追跡を開始します。`);
});

// プレイヤーが退出したときに統計を削除
server.on(ServerEvent.PlayerLeave, ev => {
  const { player } = ev;
  const stats = playerStats.get(player.id);
  
  if (stats) {
    const playTime = Math.floor((Date.now() - stats.joinTime) / 1000);
    console.log(`${player.name}が${playTime}秒後に退出しました`);
    console.log(`最終統計: ${JSON.stringify(stats)}`);
    playerStats.delete(player.id);
  }
});

// ブロック破壊を追跡
server.on(ServerEvent.BlockBroken, ev => {
  const { player } = ev;
  const stats = playerStats.get(player.id);
  
  if (stats) {
    stats.blocksBroken++;
  }
});

// ブロック設置を追跡
server.on(ServerEvent.BlockPlaced, ev => {
  const { player } = ev;
  const stats = playerStats.get(player.id);
  
  if (stats) {
    stats.blocksPlaced++;
  }
});

// チャットメッセージを追跡
server.on(ServerEvent.PlayerChat, ev => {
  const { sender } = ev;
  const stats = playerStats.get(sender.id);
  
  if (stats) {
    stats.chatMessages++;
  }
});

// 統計をチェックするコマンド
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!stats') {
    const stats = playerStats.get(sender.id);
    
    if (stats) {
      const playTime = Math.floor((Date.now() - stats.joinTime) / 1000);
      
      await world.sendMessage(
        `${sender.name}の統計:\n` +
        `- プレイ時間: ${playTime}秒\n` +
        `- 壊したブロック: ${stats.blocksBroken}\n` +
        `- 設置したブロック: ${stats.blocksPlaced}\n` +
        `- チャットメッセージ: ${stats.chatMessages}`
      );
    }
  }
});
```

## 次のステップ

- [ワールド操作](/ja/guides/world-manipulation/)について学ぶ
- [コマンド実行](/ja/guides/command-execution/)の詳細を探る
- [APIリファレンス](/ja/reference/classes/player/)でPlayerクラスについて確認する
