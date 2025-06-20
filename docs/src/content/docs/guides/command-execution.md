---
title: Command Execution
description: Learn how to execute Minecraft commands and handle responses with SocketBE
---

# Command Execution with SocketBE

One of the most powerful features of SocketBE is the ability to execute Minecraft commands programmatically and handle their responses. This guide explains how to work with commands in your SocketBE applications.

## Basic Command Execution

To execute a command, use the `runCommand` method on the `World` object:

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });

server.on(ServerEvent.PlayerJoin, async ev => {
  const { player, world } = ev;
  
  // Execute a command to welcome the player
  await world.runCommand(`title ${player.name} title Welcome!`);
});
```

## Handling Command Responses

When you execute a command, you can get the response containing status and information:

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message.startsWith('!time ')) {
    const timeArg = message.split(' ')[1];
    
    try {
      const response = await world.runCommand(`time set ${timeArg}`);
      
      if (response.statusCode === 0) {
        await world.sendMessage(`Time set to ${timeArg}`);
      } else {
        await world.sendMessage(`Failed to set time: ${response.statusMessage}`);
      }
    } catch (error) {
      console.error('Command error:', error);
      await world.sendMessage('An error occurred when executing the command.');
    }
  }
});
```

## Command Response Structure

The command response typically includes:

- `statusCode`: A numeric code indicating success (0) or failure (non-zero)
- `statusMessage`: A message describing the result of the command
- `data`: Additional data returned by the command (if any)

## Using Command Data

Some commands return useful data that you can process in your application:

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!locate') {
    try {
      const response = await world.runCommand(`locate structure village`);
      
      if (response.statusCode === 0 && response.data) {
        const locationData = response.data;
        await world.sendMessage(`Nearest village at: ${JSON.stringify(locationData)}`);
      } else {
        await world.sendMessage(`Could not locate a village`);
      }
    } catch (error) {
      console.error('Command error:', error);
    }
  }
});
```

## Player-Specific Commands

You can also execute commands in the context of a specific player:

```js
server.on(ServerEvent.PlayerJoin, async ev => {
  const { player } = ev;
  
  try {
    // Execute a command as the player
    const response = await player.runCommand('list');
    console.log(`Players online: ${response.statusMessage}`);
  } catch (error) {
    console.error('Command error:', error);
  }
});
```

## Using Command Builders

For more complex commands, you can use command builders to construct commands safely:

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message === '!give diamond') {
    try {
      // Building a command with proper escaping and formatting
      const playerName = sender.name.replace(/"/g, '\\"'); // Escape quotes
      const command = `give "${playerName}" diamond 1`;
      
      const response = await world.runCommand(command);
      console.log('Command response:', response);
    } catch (error) {
      console.error('Command error:', error);
    }
  }
});
```

## Command Queue Management

For complex operations requiring multiple commands, it's good practice to manage your command queue to avoid overwhelming the server:

```js
async function runCommandSequence(world, commands) {
  const results = [];
  
  for (const cmd of commands) {
    try {
      // Add a small delay between commands
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
    console.log('Command sequence results:', results);
  }
});
```

## Error Handling Best Practices

Always wrap command execution in try-catch blocks to handle potential errors:

```js
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (message.startsWith('!tp ')) {
    const targetPlayer = message.split(' ')[1];
    
    try {
      const response = await world.runCommand(`tp "${sender.name}" "${targetPlayer}"`);
      
      if (response.statusCode === 0) {
        console.log(`Teleported ${sender.name} to ${targetPlayer}`);
      } else {
        await world.sendMessage(`Teleport failed: ${response.statusMessage}`);
      }
    } catch (error) {
      console.error('Teleport command error:', error);
      await world.sendMessage('An error occurred during teleportation');
    }
  }
});
```

## Example: Custom Command Handler

Here's a more comprehensive example of a custom command system:

```js
import { Server, ServerEvent } from 'socket-be';

const server = new Server({ port: 8000 });
const commandPrefix = '!';

// Define custom commands
const commands = {
  help: {
    description: 'Show available commands',
    execute: async (world, args, sender) => {
      const helpText = Object.entries(commands)
        .map(([cmd, info]) => `${commandPrefix}${cmd}: ${info.description}`)
        .join('\n');
        
      await world.sendMessage(`Available commands:\n${helpText}`);
    }
  },
  
  time: {
    description: 'Set the time (day/night/noon/midnight)',
    execute: async (world, args, sender) => {
      const timeArg = args[0] || 'day';
      try {
        await world.runCommand(`time set ${timeArg}`);
        await world.sendMessage(`Time set to ${timeArg}`);
      } catch (error) {
        await world.sendMessage(`Failed to set time: ${error.message}`);
      }
    }
  },
  
  tp: {
    description: 'Teleport to another player',
    execute: async (world, args, sender) => {
      const target = args[0];
      if (!target) {
        await world.sendMessage('Usage: !tp <player_name>');
        return;
      }
      
      try {
        await world.runCommand(`tp "${sender.name}" "${target}"`);
        await world.sendMessage(`Teleported to ${target}`);
      } catch (error) {
        await world.sendMessage(`Teleport failed: ${error.message}`);
      }
    }
  }
};

// Handle chat messages for commands
server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;
  
  if (!message.startsWith(commandPrefix)) return;
  
  // Parse the command and arguments
  const parts = message.slice(commandPrefix.length).split(' ');
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  // Execute the command if it exists
  const command = commands[commandName];
  if (command) {
    try {
      await command.execute(world, args, sender);
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      await world.sendMessage(`An error occurred when executing the command`);
    }
  } else {
    await world.sendMessage(`Unknown command. Type ${commandPrefix}help for a list of commands`);
  }
});

server.on(ServerEvent.Open, () => {
  console.log('Custom command handler is running!');
});
```

## Next Steps

- Learn about [player management](/guides/player-management/)
- Explore [world manipulation](/guides/world-manipulation/) 
- Check out the complete [API reference](/reference/api/)
