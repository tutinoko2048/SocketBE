---
title: ワールド操作
description: SocketBEを使ってMinecraftのワールドを操作・管理する方法を学ぶ
---

# SocketBEでのワールド操作

SocketBEは、Minecraftのワールドを操作・管理するための強力なツールを提供します。このガイドでは、ブロックの変更、ゲーム設定の変更、ワールド環境の管理などさまざまな方法を説明します。

## ブロックの操作

### ブロック情報の取得

特定の座標にあるブロックの情報を取得できます：

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });

server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!block') {
    try {
      // プレイヤーの位置にあるブロックを取得
      const { location } = sender;
      const x = Math.floor(location.x);
      const y = Math.floor(location.y) - 1; // プレイヤーの足元のブロック
      const z = Math.floor(location.z);
      
      const block = await world.getBlock(x, y, z);
      
      if (block) {
        await world.sendMessage(`あなたの足元のブロック: ${block.type} 座標: (${x}, ${y}, ${z})`);
      } else {
        await world.sendMessage('足元のブロックを検出できませんでした');
      }
    } catch (error) {
      console.error('ブロック取得エラー:', error);
    }
  }
});
```

### ブロックの設置

ワールド内にブロックを設置したり変更したりできます：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message.startsWith('!set ')) {
    try {
      const blockType = message.split(' ')[1];
      const { location } = sender;
      const x = Math.floor(location.x);
      const y = Math.floor(location.y) + 3; // プレイヤーの頭上
      const z = Math.floor(location.z);
      
      // プレイヤーの頭上にブロックを設置
      await world.setBlock(x, y, z, blockType);
      await world.sendMessage(`${blockType}をあなたの頭上に設置しました`);
    } catch (error) {
      console.error('ブロック設置エラー:', error);
    }
  }
});
```

### ブロックで領域を埋める

特定の領域をブロックで埋めることができます：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message.startsWith('!fill ')) {
    try {
      const blockType = message.split(' ')[1];
      const { location } = sender;
      const x = Math.floor(location.x);
      const y = Math.floor(location.y);
      const z = Math.floor(location.z);
      
      // プレイヤーの周囲の5x5x5の領域を埋める
      await world.fillBlocks(x-2, y-2, z-2, x+2, y+2, z+2, blockType);
      await world.sendMessage(`あなたの周囲を${blockType}で埋めました`);
    } catch (error) {
      console.error('ブロック埋めエラー:', error);
    }
  }
});
```

## ワールド環境

### 時間の変更

Minecraftワールドの時間を制御できます：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { message, world } = ev;
  
  if (message === '!day') {
    try {
      await world.runCommand('time set day');
      await world.sendMessage('時間を昼に設定しました');
    } catch (error) {
      console.error('時間設定エラー:', error);
    }
  }
  
  if (message === '!night') {
    try {
      await world.runCommand('time set night');
      await world.sendMessage('時間を夜に設定しました');
    } catch (error) {
      console.error('時間設定エラー:', error);
    }
  }
});
```

### 天候の制御

Minecraftワールドの天候を変更できます：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { message, world } = ev;
  
  if (message === '!clear') {
    try {
      await world.runCommand('weather clear');
      await world.sendMessage('天候を晴れに設定しました');
    } catch (error) {
      console.error('天候設定エラー:', error);
    }
  }
  
  if (message === '!rain') {
    try {
      await world.runCommand('weather rain');
      await world.sendMessage('天候を雨に設定しました');
    } catch (error) {
      console.error('天候設定エラー:', error);
    }
  }
  
  if (message === '!thunder') {
    try {
      await world.runCommand('weather thunder');
      await world.sendMessage('天候を雷雨に設定しました');
    } catch (error) {
      console.error('天候設定エラー:', error);
    }
  }
});
```

## ゲームルール

ゲームルールを変更してゲームをカスタマイズできます：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { message, world } = ev;
  
  if (message === '!keepinventory on') {
    try {
      await world.runCommand('gamerule keepInventory true');
      await world.sendMessage('死亡時にインベントリを保持するようになりました');
    } catch (error) {
      console.error('ゲームルール設定エラー:', error);
    }
  }
  
  if (message === '!mobspawning off') {
    try {
      await world.runCommand('gamerule doMobSpawning false');
      await world.sendMessage('モブのスポーンが無効化されました');
    } catch (error) {
      console.error('ゲームルール設定エラー:', error);
    }
  }
  
  if (message === '!daycycle off') {
    try {
      await world.runCommand('gamerule doDaylightCycle false');
      await world.sendMessage('日周期が停止しました');
    } catch (error) {
      console.error('ゲームルール設定エラー:', error);
    }
  }
});
```

## メッセージの送信

### 全体メッセージ

ワールド内のすべてのプレイヤーにメッセージを送信できます：

```js
server.on(ServerEvent.PlayerJoin, async ev => {
  const { player, world } = ev;
  
  try {
    await world.sendMessage(`ようこそ、${player.name}さん！現在${(await world.getPlayers()).length}人のプレイヤーがオンラインです。`);
  } catch (error) {
    console.error('メッセージ送信エラー:', error);
  }
});

// 定期的なアナウンス
setInterval(async () => {
  try {
    const worlds = server.worlds;
    
    for (const world of worlds.values()) {
      await world.sendMessage('サーバーの更新情報については私たちのウェブサイトをご確認ください！');
    }
  } catch (error) {
    console.error('定期アナウンス送信エラー:', error);
  }
}, 15 * 60 * 1000); // 15分ごと
```

### タイトルの表示

プレイヤーの画面中央に表示されるタイトルを表示できます：

```js
server.on(ServerEvent.PlayerJoin, async ev => {
  const { player, world } = ev;
  
  try {
    // ウェルカムタイトルを表示
    await world.runCommand(`title "${player.name}" title ようこそ！`);
    await world.runCommand(`title "${player.name}" subtitle サーバーへ`);
  } catch (error) {
    console.error('タイトル表示エラー:', error);
  }
});
```

## ワールドイベント

SocketBEは、リッスンできるさまざまなワールドレベルのイベントを提供します：

```js
// ワールドの初期化
server.on(ServerEvent.WorldInitialize, ev => {
  const { world } = ev;
  console.log(`ワールドが初期化されました: ${world.id}`);
});

// プレイヤーがワールドに参加
server.on(ServerEvent.PlayerJoin, ev => {
  const { player, world } = ev;
  console.log(`${player.name}がワールド${world.id}に参加しました`);
});

// ワールドにブロックが設置された
server.on(ServerEvent.BlockPlaced, ev => {
  const { player, block, world } = ev;
  console.log(`${player.name}がワールド${world.id}に${block.type}を設置しました`);
});

// ワールドでブロックが壊された
server.on(ServerEvent.BlockBroken, ev => {
  const { player, block, world } = ev;
  console.log(`${player.name}がワールド${world.id}で${block.type}を壊しました`);
});
```

## ワールド構造物の生成

コマンドを使用してワールドに構造物を生成できます：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!village') {
    try {
      const { location } = sender;
      const x = Math.floor(location.x);
      const y = Math.floor(location.y);
      const z = Math.floor(location.z);
      
      // プレイヤーの位置に村を生成
      await world.runCommand(`structure load village ${x} ${y} ${z}`);
      await world.sendMessage('あなたの位置に村を生成しています');
    } catch (error) {
      console.error('構造物生成エラー:', error);
    }
  }
});
```

## ワールド境界とセーフエリア

カスタムのワールド境界やセーフエリアを実装できます：

```js
// ワールド境界を定義
const WORLD_BORDER = 1000; // スポーンから各方向に1000ブロック

// 定期的にプレイヤーの位置をチェック
setInterval(async () => {
  try {
    const worlds = server.worlds;
    
    for (const world of worlds.values()) {
      const players = await world.getPlayers();
      
      for (const player of players) {
        const { location } = player;
        
        // スポーンからの距離を計算（スポーンは0,0,0と仮定）
        const distance = Math.sqrt(location.x * location.x + location.z * location.z);
        
        if (distance > WORLD_BORDER) {
          // プレイヤーを境界内に戻す
          const angle = Math.atan2(location.z, location.x);
          const newX = (WORLD_BORDER - 10) * Math.cos(angle);
          const newZ = (WORLD_BORDER - 10) * Math.sin(angle);
          
          await player.teleport(newX, location.y, newZ);
          await world.sendMessage(`${player.name}はワールド境界まで来たので、内側にテレポートされました`);
        }
      }
    }
  } catch (error) {
    console.error('ワールド境界チェックエラー:', error);
  }
}, 5000); // 5秒ごと
```

## 高度なワールド管理の例

さまざまなワールド操作テクニックを組み合わせた、より包括的な例を示します：

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });
const worldSettings = new Map();

// サーバー起動時にワールド設定を初期化
server.on(ServerEvent.Open, () => {
  console.log('ワールドマネージャーが起動しました');
});

// ワールド接続時にワールド設定を初期化
server.on(ServerEvent.WorldInitialize, async ev => {
  const { world } = ev;
  
  console.log(`ワールドが初期化されました: ${world.id}`);
  
  // ワールド設定を保存
  worldSettings.set(world.id, {
    spawnX: 0,
    spawnY: 100,
    spawnZ: 0,
    worldBorder: 1000,
    safeMode: false,
    protectedBlocks: new Set()
  });
  
  try {
    // 初期ワールド設定
    await world.runCommand('gamerule showCoordinates true');
    await world.sendMessage('ワールドマネージャーが初期化されました');
  } catch (error) {
    console.error('ワールド初期化エラー:', error);
  }
});

// ワールドマネージャーコマンドを処理
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (!message.startsWith('!world ')) return;
  
  const args = message.slice(7).split(' ');
  const command = args[0]?.toLowerCase();
  const settings = worldSettings.get(world.id);
  
  if (!settings) {
    await world.sendMessage('ワールド設定が初期化されていません');
    return;
  }
  
  try {
    switch (command) {
      case 'spawn':
        // 現在の位置をワールドスポーンに設定
        const { location } = sender;
        settings.spawnX = Math.floor(location.x);
        settings.spawnY = Math.floor(location.y);
        settings.spawnZ = Math.floor(location.z);
        
        await world.runCommand(`setworldspawn ${settings.spawnX} ${settings.spawnY} ${settings.spawnZ}`);
        await world.sendMessage(`ワールドスポーンを${settings.spawnX}, ${settings.spawnY}, ${settings.spawnZ}に設定しました`);
        break;
        
      case 'border':
        // ワールド境界を設定
        const borderSize = parseInt(args[1]);
        if (isNaN(borderSize) || borderSize < 100) {
          await world.sendMessage('無効な境界サイズです。少なくとも100ブロック以上である必要があります。');
          return;
        }
        
        settings.worldBorder = borderSize;
        await world.sendMessage(`ワールド境界をスポーンから${borderSize}ブロックに設定しました`);
        break;
        
      case 'protect':
        // 現在のブロックを保護リストに追加
        const block = await world.getBlock(
          Math.floor(sender.location.x),
          Math.floor(sender.location.y) - 1,
          Math.floor(sender.location.z)
        );
        
        if (block) {
          settings.protectedBlocks.add(`${block.x},${block.y},${block.z}`);
          await world.sendMessage(`${block.x}, ${block.y}, ${block.z}のブロックを保護しました`);
        } else {
          await world.sendMessage('保護するブロックが見つかりませんでした');
        }
        break;
        
      case 'safe':
        // セーフモードの切り替え（ブロックの破壊を禁止）
        settings.safeMode = !settings.safeMode;
        await world.sendMessage(`セーフモードを${settings.safeMode ? '有効' : '無効'}にしました`);
        break;
        
      case 'reset':
        // ワールドの一部をリセット
        const radius = parseInt(args[1]) || 10;
        const blockType = args[2] || 'air';
        
        await world.fillBlocks(
          Math.floor(sender.location.x) - radius,
          Math.floor(sender.location.y) - radius,
          Math.floor(sender.location.z) - radius,
          Math.floor(sender.location.x) + radius,
          Math.floor(sender.location.y) + radius,
          Math.floor(sender.location.z) + radius,
          blockType
        );
        
        await world.sendMessage(`${radius * 2 + 1}x${radius * 2 + 1}x${radius * 2 + 1}ブロックの領域を${blockType}にリセットしました`);
        break;
        
      default:
        await world.sendMessage(
          '利用可能なコマンド:\n' +
          '!world spawn - 現在位置をワールドスポーンに設定\n' +
          '!world border <サイズ> - ワールド境界のサイズを設定\n' +
          '!world protect - 足元のブロックを保護\n' +
          '!world safe - セーフモードを切り替え\n' +
          '!world reset [半径] [ブロック] - 周囲の領域をリセット'
        );
    }
  } catch (error) {
    console.error(`ワールドコマンド${command}の処理エラー:`, error);
    await world.sendMessage('コマンドの処理中にエラーが発生しました');
  }
});

// 保護されたブロックの破壊を防止
server.on(ServerEvent.BlockBroken, async ev => {
  const { player, block, world } = ev;
  const settings = worldSettings.get(world.id);
  
  if (!settings) return;
  
  const blockKey = `${block.x},${block.y},${block.z}`;
  
  // セーフモードが有効か、このブロックが保護されているかをチェック
  if (settings.safeMode || settings.protectedBlocks.has(blockKey)) {
    try {
      // ブロックを復元
      await world.setBlock(block.x, block.y, block.z, block.type);
      await world.sendMessage(`${player.name}さん、そのブロックは保護されています`);
    } catch (error) {
      console.error('保護ブロック復元エラー:', error);
    }
  }
});

// ワールド境界を適用
server.on(ServerEvent.PlayerTransform, async ev => {
  const { player, location, world } = ev;
  const settings = worldSettings.get(world.id);
  
  if (!settings) return;
  
  // スポーンからの距離を計算
  const dx = location.x - settings.spawnX;
  const dz = location.z - settings.spawnZ;
  const distance = Math.sqrt(dx * dx + dz * dz);
  
  if (distance > settings.worldBorder) {
    try {
      // テレポート先の位置を計算（境界内）
      const angle = Math.atan2(dz, dx);
      const borderDistance = settings.worldBorder - 5;
      const newX = settings.spawnX + borderDistance * Math.cos(angle);
      const newZ = settings.spawnZ + borderDistance * Math.sin(angle);
      
      // プレイヤーを境界内にテレポート
      await player.teleport(newX, location.y, newZ);
      await world.sendMessage(`${player.name}さんはワールド境界に到達したため、境界内にテレポートされました`);
    } catch (error) {
      console.error('ワールド境界適用エラー:', error);
    }
  }
});
```

## 次のステップ

- [プレイヤー管理](/ja/guides/player-management/)について学ぶ
- [コマンド実行](/ja/guides/command-execution/)の詳細を探る
- [APIリファレンス](/ja/reference/classes/world/)でWorldクラスについて確認する
