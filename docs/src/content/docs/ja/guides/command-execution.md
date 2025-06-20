---
title: コマンド実行
description: SocketBEを使ってMinecraftコマンドを実行し、応答を処理する方法を学ぶ
---

# SocketBEでのコマンド実行

SocketBEの最も強力な機能の1つは、プログラムでMinecraftコマンドを実行し、その応答を処理する能力です。このガイドでは、SocketBEアプリケーションでコマンドを扱う方法を説明します。

## 基本的なコマンド実行

コマンドを実行するには、`World`オブジェクトの`runCommand`メソッドを使用します：

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });

server.on(ServerEvent.PlayerJoin, async ev => {
  const { player, world } = ev;
  
  // プレイヤーを歓迎するコマンドを実行
  await world.runCommand(`title ${player.name} title ようこそ！`);
});
```

## コマンド応答の処理

コマンドを実行すると、ステータスと情報を含む応答を取得できます：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message.startsWith('!time ')) {
    const timeArg = message.split(' ')[1];
    
    try {
      const response = await world.runCommand(`time set ${timeArg}`);
      
      if (response.statusCode === 0) {
        await world.sendMessage(`時間を${timeArg}に設定しました`);
      } else {
        await world.sendMessage(`時間の設定に失敗しました: ${response.statusMessage}`);
      }
    } catch (error) {
      console.error('コマンドエラー:', error);
      await world.sendMessage('コマンド実行中にエラーが発生しました。');
    }
  }
});
```

## コマンド応答の構造

コマンド応答は通常以下を含みます：

- `statusCode`: 成功(0)または失敗(0以外)を示す数値コード
- `statusMessage`: コマンドの結果を説明するメッセージ
- `data`: コマンドによって返された追加データ(ある場合)

## コマンドデータの使用

一部のコマンドはアプリケーションで処理できる有用なデータを返します：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!locate') {
    try {
      const response = await world.runCommand(`locate structure village`);
      
      if (response.statusCode === 0 && response.data) {
        const locationData = response.data;
        await world.sendMessage(`最寄りの村の位置: ${JSON.stringify(locationData)}`);
      } else {
        await world.sendMessage(`村を見つけられませんでした`);
      }
    } catch (error) {
      console.error('コマンドエラー:', error);
    }
  }
});
```

## プレイヤー固有のコマンド

特定のプレイヤーのコンテキストでコマンドを実行することもできます：

```js
server.on(ServerEvent.PlayerJoin, async ev => {
  const { player } = ev;
  
  try {
    // プレイヤーとしてコマンドを実行
    const response = await player.runCommand('list');
    console.log(`オンラインプレイヤー: ${response.statusMessage}`);
  } catch (error) {
    console.error('コマンドエラー:', error);
  }
});
```

## コマンドビルダーの使用

より複雑なコマンドの場合、コマンドビルダーを使用して安全にコマンドを構築できます：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!give diamond') {
    try {
      // 適切なエスケープと書式設定でコマンドを構築
      const playerName = sender.name.replace(/"/g, '\\"'); // 引用符をエスケープ
      const command = `give "${playerName}" diamond 1`;
      
      const response = await world.runCommand(command);
      console.log('コマンド応答:', response);
    } catch (error) {
      console.error('コマンドエラー:', error);
    }
  }
});
```

## コマンドキュー管理

複数のコマンドを必要とする複雑な操作の場合、サーバーに負荷をかけないようにコマンドキューを管理することをお勧めします：

```js
async function runCommandSequence(world, commands) {
  const results = [];
  
  for (const cmd of commands) {
    try {
      // コマンド間に小さな遅延を追加
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const response = await world.runCommand(cmd);
      results.push({ command: cmd, response });
    } catch (error) {
      results.push({ command: cmd, error });
    }
  }
  
  return results;
}

server.on(ServerEvent.PlayerChat, async ev => {
  const { message, world } = ev;
  
  if (message === '!setup') {
    const commands = [
      'time set day',
      'weather clear',
      'gamerule doDaylightCycle false',
      'difficulty peaceful'
    ];
    
    const results = await runCommandSequence(world, commands);
    console.log('コマンドシーケンス結果:', results);
  }
});
```

## エラー処理のベストプラクティス

潜在的なエラーを処理するために、常にコマンド実行をtry-catchブロックでラップしてください：

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message.startsWith('!tp ')) {
    const targetPlayer = message.split(' ')[1];
    
    try {
      const response = await world.runCommand(`tp "${sender.name}" "${targetPlayer}"`);
      
      if (response.statusCode === 0) {
        console.log(`${sender.name}を${targetPlayer}にテレポートしました`);
      } else {
        await world.sendMessage(`テレポートに失敗しました: ${response.statusMessage}`);
      }
    } catch (error) {
      console.error('テレポートコマンドエラー:', error);
      await world.sendMessage('テレポート中にエラーが発生しました');
    }
  }
});
```

## 例：カスタムコマンドハンドラー

より包括的なカスタムコマンドシステムの例を示します：

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });
const commandPrefix = '!';

// カスタムコマンドを定義
const commands = {
  help: {
    description: '利用可能なコマンドを表示',
    execute: async (world, args, sender) => {
      const helpText = Object.entries(commands)
        .map(([cmd, info]) => `${commandPrefix}${cmd}: ${info.description}`)
        .join('\n');
        
      await world.sendMessage(`利用可能なコマンド:\n${helpText}`);
    }
  },
  
  time: {
    description: '時間を設定する(day/night/noon/midnight)',
    execute: async (world, args, sender) => {
      const timeArg = args[0] || 'day';
      try {
        await world.runCommand(`time set ${timeArg}`);
        await world.sendMessage(`時間を${timeArg}に設定しました`);
      } catch (error) {
        await world.sendMessage(`時間の設定に失敗しました: ${error.message}`);
      }
    }
  },
  
  tp: {
    description: '他のプレイヤーにテレポート',
    execute: async (world, args, sender) => {
      const target = args[0];
      if (!target) {
        await world.sendMessage('使用法: !tp <プレイヤー名>');
        return;
      }
      
      try {
        await world.runCommand(`tp "${sender.name}" "${target}"`);
        await world.sendMessage(`${target}にテレポートしました`);
      } catch (error) {
        await world.sendMessage(`テレポートに失敗しました: ${error.message}`);
      }
    }
  }
};

// コマンド用のチャットメッセージを処理
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (!message.startsWith(commandPrefix)) return;
  
  // コマンドと引数を解析
  const parts = message.slice(commandPrefix.length).split(' ');
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  // コマンドが存在する場合は実行
  const command = commands[commandName];
  if (command) {
    try {
      await command.execute(world, args, sender);
    } catch (error) {
      console.error(`コマンド${commandName}の実行中にエラーが発生:`, error);
      await world.sendMessage(`コマンド実行中にエラーが発生しました`);
    }
  } else {
    await world.sendMessage(`不明なコマンドです。コマンド一覧は${commandPrefix}helpを入力してください`);
  }
});

server.on(ServerEvent.Open, () => {
  console.log('カスタムコマンドハンドラーが実行中です！');
});
```

## 次のステップ

- [プレイヤー管理](/ja/guides/player-management/)について学ぶ
- [ワールド操作](/ja/guides/world-manipulation/)を探索する 
- 完全な[APIリファレンス](/ja/reference/api/)をチェックする
