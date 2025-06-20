---
title: Getting Started
description: A guide to getting started with SocketBE
---

SocketBE is a powerful WebSocket library designed to interact with the Minecraft Bedrock Edition WebSocket Protocol. This guide will help you set up your first project with SocketBE.

## Prerequisites

- Node.js v18 or later
- Minecraft Bedrock Edition with WebSocket functionality enabled

## Installation

You can install SocketBE using npm:

```bash
npm install socket-be
```

Or using other package managers:

```bash
yarn add socket-be
```

```bash
pnpm add socket-be
```

> **Note**: Bun is not currently supported due to compatibility issues. See [Runtime Compatibility Issues](#runtime-compatibility-issues) for more details. Please use Node.js with npm, yarn, or pnpm instead.

## Setting Up Connection

### On the Same Device

If you're running the server on the same device as Minecraft on Windows, you need to allow loopback connections:

```bash
CheckNetIsolation.exe LoopbackExempt -a -n="Microsoft.MinecraftUWP_8wekyb3d8bbwe"
```

### Connecting to the Server

In Minecraft, use the `/wsserver` or `/connect` command to connect to your WebSocket server:

```
/wsserver <IP Address>:<PORT>
```

For example:
```
/wsserver 127.0.0.1:8000
```

## Basic Example

Here's a simple example that shows how to create a WebSocket server, listen for chat messages, and respond to them:

```js
import { Server, ServerEvent } from 'socket-be';

// Create a new server listening on port 8000
const server = new Server({ port: 8000 });

// Event triggered when the server starts
server.on(ServerEvent.Open, () => {
  console.log('Server started');
});

// Event triggered when a player sends a chat message
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;

  // Avoid message loops from external sources
  if (sender.name === 'External') return;

  // Log the message to console
  console.log(`<${sender.name}> ${message}`);

  await world.sendMessage(`${sender.name} said: ${message}`);
});
```

## Troubleshooting

If you're having trouble connecting:

1. Make sure your firewall isn't blocking the connection
2. Verify that your Minecraft has permission to connect to WebSocket servers
3. Confirm the IP address and port are correct in your `/wsserver` command
4. [On the same device, ensure loopback connections are allowed](#on-the-same-device)

### Runtime Compatibility Issues

- **Node.js**: SocketBE requires Node.js v18 or later. Some features may not work correctly on older versions.
- **Bun**: SocketBE is currently **not fully compatible** with Bun due to issues with encryption processing. Specifically, Bun's implementation of certain crypto APIs required for encryption is not fully compatible with SocketBE. You may be able to use SocketBE with Bun if you **disable encryption** in the server options (`{ disableEncryption: true }`), but full functionality is not guaranteed. For best results, please use Node.js with npm, yarn, or pnpm instead.
- **Deno**: SocketBE is not designed for use with Deno. Use Node.js for best compatibility.

### Platform Limitations

- **Bedrock Dedicated Server (BDS)**: SocketBE cannot be used with Bedrock Dedicated Server as BDS does not support the WebSocket protocol. SocketBE is designed to work with Minecraft Bedrock Edition client directly.

## Next Steps

- Learn about [handling game events](./guides/event-handling)
- Explore [executing commands](./guides/command-execution)
- Check out the [API reference](/reference/) for advanced usage
