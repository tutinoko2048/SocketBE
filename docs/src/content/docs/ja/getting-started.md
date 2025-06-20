---
title: 入門
description: SocketBE 入門編
---

SocketBEは、Minecraft統合版でWebSocketを使うための強力なライブラリです。このガイドでは、このライブラリを使った最初のプロジェクトのセットアップ方法を説明します。

## 必要条件

- Node.js v18以上
- WebSocket機能が有効なMinecraft統合版

## インストール

npmを使ってSocketBEをインストールできます：

```bash
npm install socket-be
```

その他のパッケージマネージャーを使用する場合：

```bash
yarn add socket-be
```

```bash
pnpm add socket-be
```

> **注意**: Bunは現在互換性の問題でサポートされていません。(詳細については[ランタイムの互換性の問題](#ランタイムの互換性の問題)を参照してください。)
> Node.jsとnpm、yarn、またはpnpmを使用してください。

## 接続のセットアップ

### 同一デバイス上での接続

OSがWindowsの場合、Minecraftと同じデバイス上で動かす場合はループバック接続を許可する必要があります。予めこちらを管理者権限で実行しておいてください：

```bash
CheckNetIsolation.exe LoopbackExempt -a -n="Microsoft.MinecraftUWP_8wekyb3d8bbwe"
```

### サーバーへの接続

Minecraft内で、`/wsserver`または`/connect`コマンドを使用してWebSocketサーバーに接続します：

```
/wsserver <IPアドレス>:<ポート>
```

例：
```
/wsserver 127.0.0.1:8000
```

## 基本的な例

WebSocketサーバーを作成し、チャットを受信してそのまま送り返すコードを書いてみます：

```js
import { Server, ServerEvent } from 'socket-be';

// ポート8000でリッスンする新しいサーバーを作成
const server = new Server({ port: 8000 });

// サーバー起動時に発生するイベント
server.on(ServerEvent.Open, () => {
  console.log('サーバーが起動しました');
});

// プレイヤーがチャットメッセージを送信した時に発生するイベント
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;

  // 外部ソースからのメッセージループを防止
  if (sender.name === '外部') return;

  // メッセージをコンソールに記録
  console.log(`<${sender.name}> ${message}`);

  await world.sendMessage(`${sender.name} said: ${message}`);
});
```

## トラブルシューティング

接続に問題がある場合：

1. ファイアウォールが接続をブロックしていないことを確認してください
2. MinecraftがWebSocketサーバーに接続する権限を持っているか確認してください
3. `/wsserver`コマンドのIPアドレス・ポートが正しいことを確認してください
4. [同一デバイス上でサーバーを実行している場合、ループバック接続が許可されていることを確認してください](#同一デバイス上での接続)

### ランタイムの互換性の問題

- **Node.js**: SocketBEはNode.js v18以降が必要です。古いバージョンでは一部の機能が正しく動作しない可能性があります。
- **Bun**: SocketBEで使われている暗号化に関する一部の機能がBunでは実装されていないため、現在使うことができません。ただし、サーバーオプションで**暗号化を無効にする**（`{ disableEncryption: true }`）ことで動かすことはできますが、全ての機能の動作は保証されていません。Node.jsを使いましょう。
- **Deno**: SocketBEはDenoでの使用を想定していません。

### プラットフォームの制限

- **Bedrock Dedicated Server (BDS)**: Bedrock Dedicated Server(BDS)はWebSocketプロトコルをサポートしていないため、SocketBEをBDSで使用することはできません。SocketBEはMinecraft統合版のクライアントと直接つなぐことを前提に作られています。

## 次のステップ

- [ゲームイベントの処理](./guides/event-handling)について学ぶ
- [コマンドの実行](./guides/command-execution)について学ぶ
- 高度な使用方法については[API Reference](../reference/index)を確認してください
