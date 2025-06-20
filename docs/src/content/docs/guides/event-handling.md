---
title: Event Handling
description: Learn how to handle various Minecraft events with SocketBE
---

# Event Handling with SocketBE

SocketBE makes it easy to respond to various events that occur in your Minecraft world. This guide explains how to work with the event system.

## Available Events

SocketBE provides a comprehensive set of event handlers for Minecraft events. These events are available through the `ServerEvent` enum:

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });
```

Common events include:

- `ServerEvent.PlayerJoin` - Triggered when a player joins the game
- `ServerEvent.PlayerLeave` - Triggered when a player leaves the game
- `ServerEvent.PlayerChat` - Triggered when a player sends a chat message
- `ServerEvent.BlockPlaced` - Triggered when a block is placed
- `ServerEvent.BlockBroken` - Triggered when a block is broken
- `ServerEvent.ItemAcquired` - Triggered when a player acquires an item
- `ServerEvent.ItemCrafted` - Triggered when a player crafts an item
- `ServerEvent.ItemEquipped` - Triggered when a player equips an item

## Basic Event Handling

To handle events, use the `on` method of your server instance:

```js
server.on(ServerEvent.PlayerJoin, ev => {
  const { player } = ev;
  console.log(`Player ${player.name} joined the game`);
});
```

## Event Data

Each event provides relevant data. For example, the `PlayerChat` event includes:

```js
server.on(ServerEvent.PlayerChat, ev => {
  const { sender, message, world } = ev;
  
  console.log(`${sender.name} said: ${message}`);
  
  // You can respond to the message
  world.sendMessage(`Echo: ${message}`);
});
```

## Asynchronous Event Handling

Events can be handled asynchronously using async/await:

```js
server.on(ServerEvent.BlockBroken, async ev => {
  const { player, block, world } = ev;
  
  console.log(`${player.name} broke a ${block.type} block`);
  
  // Perform asynchronous operations
  await world.sendMessage(`${player.name} broke a block!`);
});
```

## Multiple Event Listeners

You can register multiple listeners for the same event:

```js
// Log player joins
server.on(ServerEvent.PlayerJoin, ev => {
  console.log(`${ev.player.name} joined`);
});

// Welcome players who join
server.on(ServerEvent.PlayerJoin, async ev => {
  await ev.world.sendMessage(`Welcome, ${ev.player.name}!`);
});
```

## Removing Event Listeners

You can also remove event listeners when they're no longer needed:

```js
// Store a reference to the event handler function
const onPlayerJoin = ev => {
  console.log(`${ev.player.name} joined the game`);
};

// Add the event listener
server.on(ServerEvent.PlayerJoin, onPlayerJoin);

// Later, remove the event listener
server.off(ServerEvent.PlayerJoin, onPlayerJoin);
```

## Example: Custom Game Mode

Here's a more complete example that monitors player interactions with blocks to implement a custom game mode:

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });
const playerScores = new Map();

server.on(ServerEvent.Open, () => {
  console.log('Custom game mode server started');
});

// Track when players join
server.on(ServerEvent.PlayerJoin, ev => {
  const { player } = ev;
  playerScores.set(player.name, 0);
  console.log(`${player.name} joined the game`);
});

// Track when players leave
server.on(ServerEvent.PlayerLeave, ev => {
  const { player } = ev;
  playerScores.delete(player.name);
  console.log(`${player.name} left the game`);
});

// Award points for breaking certain blocks
server.on(ServerEvent.BlockBroken, async ev => {
  const { player, block, world } = ev;
  
  if (block.type.includes('ore')) {
    const currentScore = playerScores.get(player.name) || 0;
    const newScore = currentScore + 1;
    playerScores.set(player.name, newScore);
    
    await world.sendMessage(`${player.name} found ore! Score: ${newScore}`);
  }
});

// Show scoreboard on chat command
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!score') {
    const score = playerScores.get(sender.name) || 0;
    await world.sendMessage(`${sender.name}'s score: ${score}`);
  }
  
  if (message === '!scoreboard') {
    const scores = Array.from(playerScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, score]) => `${name}: ${score}`)
      .join('\n');
    
    await world.sendMessage(`Scoreboard:\n${scores}`);
  }
});
```

## Next Steps

- Learn about [command execution](/guides/command-execution/)
- Explore [working with players](/guides/player-management/)
- Check out the [world manipulation](/guides/world-manipulation/) guide
