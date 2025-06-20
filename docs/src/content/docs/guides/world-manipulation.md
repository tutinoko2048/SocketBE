---
title: World Manipulation
description: Learn how to manipulate and interact with the Minecraft world using SocketBE
---

# World Manipulation with SocketBE

SocketBE provides powerful tools for manipulating and interacting with the Minecraft world. This guide covers the various ways you can modify blocks, change game settings, and manage the world environment.

## Working with Blocks

### Getting Block Information

You can get information about blocks at specific coordinates:

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });

server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!block') {
    try {
      // Get block at player's location
      const { location } = sender;
      const x = Math.floor(location.x);
      const y = Math.floor(location.y) - 1; // Block beneath player
      const z = Math.floor(location.z);
      
      const block = await world.getBlock(x, y, z);
      
      if (block) {
        await world.sendMessage(`Block beneath you: ${block.type} at (${x}, ${y}, ${z})`);
      } else {
        await world.sendMessage('Could not detect the block beneath you');
      }
    } catch (error) {
      console.error('Error getting block:', error);
    }
  }
});
```

### Setting Blocks

You can place or change blocks in the world:

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message.startsWith('!set ')) {
    try {
      const blockType = message.split(' ')[1];
      const { location } = sender;
      const x = Math.floor(location.x);
      const y = Math.floor(location.y) + 3; // Block above player's head
      const z = Math.floor(location.z);
      
      // Set a block above the player
      await world.setBlock(x, y, z, blockType);
      await world.sendMessage(`Placed ${blockType} above your head`);
    } catch (error) {
      console.error('Error setting block:', error);
    }
  }
});
```

### Filling Areas with Blocks

You can fill an entire area with blocks:

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
      
      // Fill a 5x5x5 area around the player
      await world.fillBlocks(x-2, y-2, z-2, x+2, y+2, z+2, blockType);
      await world.sendMessage(`Filled the area around you with ${blockType}`);
    } catch (error) {
      console.error('Error filling blocks:', error);
    }
  }
});
```

## World Environment

### Changing Time of Day

You can control the time of day in the Minecraft world:

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { message, world } = ev;
  
  if (message === '!day') {
    try {
      await world.runCommand('time set day');
      await world.sendMessage('Time set to day');
    } catch (error) {
      console.error('Error setting time:', error);
    }
  }
  
  if (message === '!night') {
    try {
      await world.runCommand('time set night');
      await world.sendMessage('Time set to night');
    } catch (error) {
      console.error('Error setting time:', error);
    }
  }
});
```

### Controlling Weather

You can change the weather in the Minecraft world:

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { message, world } = ev;
  
  if (message === '!clear') {
    try {
      await world.runCommand('weather clear');
      await world.sendMessage('Weather set to clear');
    } catch (error) {
      console.error('Error setting weather:', error);
    }
  }
  
  if (message === '!rain') {
    try {
      await world.runCommand('weather rain');
      await world.sendMessage('Weather set to rainy');
    } catch (error) {
      console.error('Error setting weather:', error);
    }
  }
  
  if (message === '!thunder') {
    try {
      await world.runCommand('weather thunder');
      await world.sendMessage('Weather set to thunderstorm');
    } catch (error) {
      console.error('Error setting weather:', error);
    }
  }
});
```

## Game Rules

You can customize the game by changing game rules:

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { message, world } = ev;
  
  if (message === '!keepinventory on') {
    try {
      await world.runCommand('gamerule keepInventory true');
      await world.sendMessage('Players will now keep their inventory on death');
    } catch (error) {
      console.error('Error setting game rule:', error);
    }
  }
  
  if (message === '!mobspawning off') {
    try {
      await world.runCommand('gamerule doMobSpawning false');
      await world.sendMessage('Mob spawning has been disabled');
    } catch (error) {
      console.error('Error setting game rule:', error);
    }
  }
  
  if (message === '!daycycle off') {
    try {
      await world.runCommand('gamerule doDaylightCycle false');
      await world.sendMessage('Day cycle has been stopped');
    } catch (error) {
      console.error('Error setting game rule:', error);
    }
  }
});
```

## Sending Messages

### Broadcasting Messages

You can send messages to all players in the world:

```js
server.on(ServerEvent.PlayerJoin, async ev => {
  const { player, world } = ev;
  
  try {
    await world.sendMessage(`Welcome, ${player.name}! There are currently ${(await world.getPlayers()).length} players online.`);
  } catch (error) {
    console.error('Error sending message:', error);
  }
});

// Scheduled announcements
setInterval(async () => {
  try {
    const worlds = server.worlds;
    
    for (const world of worlds.values()) {
      await world.sendMessage('Remember to check our website for server updates!');
    }
  } catch (error) {
    console.error('Error sending scheduled announcement:', error);
  }
}, 15 * 60 * 1000); // Every 15 minutes
```

### Displaying Titles

You can display titles that appear in the center of the player's screen:

```js
server.on(ServerEvent.PlayerJoin, async ev => {
  const { player, world } = ev;
  
  try {
    // Display a welcome title
    await world.runCommand(`title "${player.name}" title Welcome!`);
    await world.runCommand(`title "${player.name}" subtitle to the server`);
  } catch (error) {
    console.error('Error displaying title:', error);
  }
});
```

## World Events

SocketBE provides various world-level events you can listen for:

```js
// World initialization
server.on(ServerEvent.WorldInitialize, ev => {
  const { world } = ev;
  console.log(`World initialized: ${world.id}`);
});

// Player joins a world
server.on(ServerEvent.PlayerJoin, ev => {
  const { player, world } = ev;
  console.log(`${player.name} joined world ${world.id}`);
});

// Block placed in world
server.on(ServerEvent.BlockPlaced, ev => {
  const { player, block, world } = ev;
  console.log(`${player.name} placed ${block.type} in world ${world.id}`);
});

// Block broken in world
server.on(ServerEvent.BlockBroken, ev => {
  const { player, block, world } = ev;
  console.log(`${player.name} broke ${block.type} in world ${world.id}`);
});
```

## World Structure Generation

You can use commands to generate structures in the world:

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!village') {
    try {
      const { location } = sender;
      const x = Math.floor(location.x);
      const y = Math.floor(location.y);
      const z = Math.floor(location.z);
      
      // Generate a village at the player's location
      await world.runCommand(`structure load village ${x} ${y} ${z}`);
      await world.sendMessage('Generating a village at your location');
    } catch (error) {
      console.error('Error generating structure:', error);
    }
  }
});
```

## World Borders and Safe Areas

You can implement custom world borders and safe areas:

```js
// Define a world border
const WORLD_BORDER = 1000; // 1000 blocks in each direction from spawn

// Check player position periodically
setInterval(async () => {
  try {
    const worlds = server.worlds;
    
    for (const world of worlds.values()) {
      const players = await world.getPlayers();
      
      for (const player of players) {
        const { location } = player;
        
        // Calculate distance from spawn (assuming spawn is at 0,0,0)
        const distance = Math.sqrt(location.x * location.x + location.z * location.z);
        
        if (distance > WORLD_BORDER) {
          // Teleport player back inside the border
          const angle = Math.atan2(location.z, location.x);
          const newX = (WORLD_BORDER - 10) * Math.cos(angle);
          const newZ = (WORLD_BORDER - 10) * Math.sin(angle);
          
          await player.teleport(newX, location.y, newZ);
          await world.sendMessage(`${player.name} was teleported back inside the world border`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking world border:', error);
  }
}, 5000); // Every 5 seconds
```

## Advanced World Management Example

Here's a more comprehensive example that combines various world manipulation techniques:

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });
const worldSettings = new Map();

// Initialize world settings when server starts
server.on(ServerEvent.Open, () => {
  console.log('World manager started');
});

// Initialize world settings when a world connects
server.on(ServerEvent.WorldInitialize, async ev => {
  const { world } = ev;
  
  console.log(`World initialized: ${world.id}`);
  
  // Store world settings
  worldSettings.set(world.id, {
    spawnX: 0,
    spawnY: 100,
    spawnZ: 0,
    worldBorder: 1000,
    safeMode: false,
    protectedBlocks: new Set()
  });
  
  try {
    // Set initial world settings
    await world.runCommand('gamerule showCoordinates true');
    await world.sendMessage('World Manager has been initialized');
  } catch (error) {
    console.error('Error initializing world:', error);
  }
});

// Handle world manager commands
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (!message.startsWith('!world ')) return;
  
  const args = message.slice(7).split(' ');
  const command = args[0]?.toLowerCase();
  const settings = worldSettings.get(world.id);
  
  if (!settings) {
    await world.sendMessage('World settings not initialized');
    return;
  }
  
  try {
    switch (command) {
      case 'spawn':
        // Set the world spawn to current location
        const { location } = sender;
        settings.spawnX = Math.floor(location.x);
        settings.spawnY = Math.floor(location.y);
        settings.spawnZ = Math.floor(location.z);
        
        await world.runCommand(`setworldspawn ${settings.spawnX} ${settings.spawnY} ${settings.spawnZ}`);
        await world.sendMessage(`World spawn set to ${settings.spawnX}, ${settings.spawnY}, ${settings.spawnZ}`);
        break;
        
      case 'border':
        // Set the world border
        const borderSize = parseInt(args[1]);
        if (isNaN(borderSize) || borderSize < 100) {
          await world.sendMessage('Invalid border size. Must be at least 100 blocks.');
          return;
        }
        
        settings.worldBorder = borderSize;
        await world.sendMessage(`World border set to ${borderSize} blocks from spawn`);
        break;
        
      case 'protect':
        // Add current block to protected list
        const block = await world.getBlock(
          Math.floor(sender.location.x),
          Math.floor(sender.location.y) - 1,
          Math.floor(sender.location.z)
        );
        
        if (block) {
          settings.protectedBlocks.add(`${block.x},${block.y},${block.z}`);
          await world.sendMessage(`Protected block at ${block.x}, ${block.y}, ${block.z}`);
        } else {
          await world.sendMessage('Could not find block to protect');
        }
        break;
        
      case 'safe':
        // Toggle safe mode (no block breaking)
        settings.safeMode = !settings.safeMode;
        await world.sendMessage(`Safe mode ${settings.safeMode ? 'enabled' : 'disabled'}`);
        break;
        
      case 'reset':
        // Reset sections of the world
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
        
        await world.sendMessage(`Reset an area of ${radius * 2 + 1}x${radius * 2 + 1}x${radius * 2 + 1} blocks to ${blockType}`);
        break;
        
      default:
        await world.sendMessage(
          'Available commands:\n' +
          '!world spawn - Set world spawn to your location\n' +
          '!world border <size> - Set world border size\n' +
          '!world protect - Protect the block you\'re standing on\n' +
          '!world safe - Toggle safe mode\n' +
          '!world reset [radius] [block] - Reset an area around you'
        );
    }
  } catch (error) {
    console.error(`Error handling world command ${command}:`, error);
    await world.sendMessage('An error occurred while processing your command');
  }
});

// Prevent breaking protected blocks
server.on(ServerEvent.BlockBroken, async ev => {
  const { player, block, world } = ev;
  const settings = worldSettings.get(world.id);
  
  if (!settings) return;
  
  const blockKey = `${block.x},${block.y},${block.z}`;
  
  // Check if safe mode is on or if this is a protected block
  if (settings.safeMode || settings.protectedBlocks.has(blockKey)) {
    try {
      // Restore the block
      await world.setBlock(block.x, block.y, block.z, block.type);
      await world.sendMessage(`${player.name}, that block is protected`);
    } catch (error) {
      console.error('Error restoring protected block:', error);
    }
  }
});

// Enforce world border
server.on(ServerEvent.PlayerTransform, async ev => {
  const { player, location, world } = ev;
  const settings = worldSettings.get(world.id);
  
  if (!settings) return;
  
  // Calculate distance from spawn
  const dx = location.x - settings.spawnX;
  const dz = location.z - settings.spawnZ;
  const distance = Math.sqrt(dx * dx + dz * dz);
  
  if (distance > settings.worldBorder) {
    try {
      // Calculate position to teleport to (inside the border)
      const angle = Math.atan2(dz, dx);
      const borderDistance = settings.worldBorder - 5;
      const newX = settings.spawnX + borderDistance * Math.cos(angle);
      const newZ = settings.spawnZ + borderDistance * Math.sin(angle);
      
      // Teleport player back inside the border
      await player.teleport(newX, location.y, newZ);
      await world.sendMessage(`${player.name} reached the world border and was teleported back`);
    } catch (error) {
      console.error('Error enforcing world border:', error);
    }
  }
});
```

## Next Steps

- Learn about [player management](/guides/player-management/)
- Explore [command execution](/guides/command-execution/) in more detail
- Check out the [API reference](/reference/classes/world/) for the World class
