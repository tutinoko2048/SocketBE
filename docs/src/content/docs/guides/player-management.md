---
title: Player Management
description: Learn how to manage and interact with players in SocketBE
---

# Player Management in SocketBE

SocketBE provides powerful tools for interacting with players in your Minecraft world. This guide covers the various ways you can manage and interact with players.

## Getting Player Information

You can access player information through event objects or the world instance:

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });

// Get player information when they join
server.on(ServerEvent.PlayerJoin, ev => {
  const { player } = ev;
  
  console.log(`Player name: ${player.name}`);
  console.log(`Player ID: ${player.id}`);
  console.log(`Player position: ${player.location.x}, ${player.location.y}, ${player.location.z}`);
});

// Get all players in the world
server.on(ServerEvent.WorldInitialize, async ev => {
  const { world } = ev;
  
  try {
    const players = await world.getPlayers();
    console.log(`There are ${players.length} players in the world:`);
    
    players.forEach(player => {
      console.log(`- ${player.name} (ID: ${player.id})`);
    });
  } catch (error) {
    console.error('Error getting players:', error);
  }
});
```

## Player Interactions

### Giving Items to Players

You can give items to players using the `giveItem` method:

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!diamond') {
    try {
      // Simple method to give a basic item
      await sender.giveItem('diamond', 1);
      await world.sendMessage(`Gave a diamond to ${sender.name}`);
    } catch (error) {
      console.error('Error giving item:', error);
    }
  }
  
  if (message === '!sword') {
    try {
      // Advanced method with enchantments
      await sender.giveItem({
        item: 'diamond_sword',
        amount: 1,
        data: 0,
        nameTag: 'The Destroyer',
        enchantments: [
          { id: 'sharpness', level: 5 },
          { id: 'unbreaking', level: 3 }
        ]
      });
      await world.sendMessage(`Gave an enchanted sword to ${sender.name}`);
    } catch (error) {
      console.error('Error giving enchanted item:', error);
    }
  }
});
```

### Teleporting Players

You can teleport players to specific coordinates or to other players:

```js
// Teleport a player to specific coordinates
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message } = ev;
  
  if (message === '!spawn') {
    try {
      await sender.teleport(0, 100, 0);
      console.log(`Teleported ${sender.name} to spawn`);
    } catch (error) {
      console.error('Teleport error:', error);
    }
  }
});

// Teleport all players to a specific location
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!tpall') {
    try {
      const players = await world.getPlayers();
      const { location } = sender;
      
      for (const player of players) {
        if (player.id !== sender.id) {
          await player.teleport(location.x, location.y, location.z);
          console.log(`Teleported ${player.name} to ${sender.name}`);
        }
      }
      
      await world.sendMessage('All players have been teleported to your location');
    } catch (error) {
      console.error('Error teleporting players:', error);
    }
  }
});
```

### Applying Game Effects

You can apply various game effects to players:

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!effect') {
    try {
      // Apply speed effect to the player
      await world.runCommand(`effect "${sender.name}" speed 30 2`);
      await world.sendMessage('Speed boost applied!');
    } catch (error) {
      console.error('Error applying effect:', error);
    }
  }
});
```

## Player Events

SocketBE provides several player-specific events:

```js
// Player join event
server.on(ServerEvent.PlayerJoin, ev => {
  console.log(`${ev.player.name} joined the game`);
});

// Player leave event
server.on(ServerEvent.PlayerLeave, ev => {
  console.log(`${ev.player.name} left the game`);
});

// Player chat event
server.on(ServerEvent.PlayerChat, ev => {
  console.log(`${ev.sender.name} said: ${ev.message}`);
});

// Player movement/transformation event
server.on(ServerEvent.PlayerTransform, ev => {
  const { player, location } = ev;
  console.log(`${player.name} moved to ${location.x}, ${location.y}, ${location.z}`);
});
```

## Player Selection and Filtering

You can use Minecraft's selector syntax to query players:

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { message, world } = ev;
  
  if (message === '!list') {
    try {
      // Get all players
      const allPlayers = await world.getPlayers('@a');
      console.log('All players:', allPlayers.map(p => p.name).join(', '));
      
      // Get nearest player
      const nearestPlayer = await world.getPlayers('@p');
      if (nearestPlayer.length > 0) {
        console.log('Nearest player:', nearestPlayer[0].name);
      }
      
      // Get random player
      const randomPlayer = await world.getPlayers('@r');
      if (randomPlayer.length > 0) {
        console.log('Random player:', randomPlayer[0].name);
      }
    } catch (error) {
      console.error('Error querying players:', error);
    }
  }
});
```

## Player Permissions and Abilities

You can check and set player abilities:

```js
server.on(ServerEvent.PlayerJoin, async ev => {
  const { player, world } = ev;

  try {
    // Check if player is operator
    const isOp = await world.runCommand(`testfor @a[name="${player.name}",tag=op]`);
    
    if (isOp.statusCode === 0) {
      console.log(`${player.name} is an operator`);
      // Grant special abilities or permissions
    } else {
      console.log(`${player.name} is not an operator`);
    }
  } catch (error) {
    console.error('Error checking operator status:', error);
  }
});
```

## Player Inventory Management

You can check a player's inventory and manipulate it:

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!clear') {
    try {
      // Clear player's inventory
      await world.runCommand(`clear "${sender.name}"`);
      await world.sendMessage('Your inventory has been cleared');
    } catch (error) {
      console.error('Error clearing inventory:', error);
    }
  }
  
  if (message === '!kit starter') {
    try {
      // Give player a starter kit
      await sender.giveItem('stone_sword', 1);
      await sender.giveItem('stone_pickaxe', 1);
      await sender.giveItem('stone_axe', 1);
      await sender.giveItem('bread', 16);
      await world.sendMessage('You have received the starter kit');
    } catch (error) {
      console.error('Error giving starter kit:', error);
    }
  }
});
```

## Player Events Tracking

A more comprehensive example showing how to track player statistics:

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });
const playerStats = new Map();

// Initialize player stats
server.on(ServerEvent.PlayerJoin, ev => {
  const { player } = ev;
  
  // Create or reset player stats
  playerStats.set(player.id, {
    name: player.name,
    joinTime: Date.now(),
    blocksBroken: 0,
    blocksPlaced: 0,
    chatMessages: 0,
    deaths: 0
  });
  
  console.log(`${player.name} joined. Stats tracking started.`);
});

// Remove player stats when they leave
server.on(ServerEvent.PlayerLeave, ev => {
  const { player } = ev;
  const stats = playerStats.get(player.id);
  
  if (stats) {
    const playTime = Math.floor((Date.now() - stats.joinTime) / 1000);
    console.log(`${player.name} left after ${playTime} seconds`);
    console.log(`Final stats: ${JSON.stringify(stats)}`);
    playerStats.delete(player.id);
  }
});

// Track blocks broken
server.on(ServerEvent.BlockBroken, ev => {
  const { player } = ev;
  const stats = playerStats.get(player.id);
  
  if (stats) {
    stats.blocksBroken++;
  }
});

// Track blocks placed
server.on(ServerEvent.BlockPlaced, ev => {
  const { player } = ev;
  const stats = playerStats.get(player.id);
  
  if (stats) {
    stats.blocksPlaced++;
  }
});

// Track chat messages
server.on(ServerEvent.PlayerChat, ev => {
  const { sender } = ev;
  const stats = playerStats.get(sender.id);
  
  if (stats) {
    stats.chatMessages++;
  }
});

// Command to check stats
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!stats') {
    const stats = playerStats.get(sender.id);
    
    if (stats) {
      const playTime = Math.floor((Date.now() - stats.joinTime) / 1000);
      
      await world.sendMessage(
        `Stats for ${sender.name}:\n` +
        `- Play time: ${playTime} seconds\n` +
        `- Blocks broken: ${stats.blocksBroken}\n` +
        `- Blocks placed: ${stats.blocksPlaced}\n` +
        `- Chat messages: ${stats.chatMessages}`
      );
    }
  }
});
```

## Next Steps

- Learn about [world manipulation](/guides/world-manipulation/)
- Explore [command execution](/guides/command-execution/) in more detail
- Check out the [API reference](/reference/classes/player/) for the Player class
