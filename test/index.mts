import { Packet, PacketBound, Server, ServerEvent } from 'socket-be';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', async line => {
  const [command, ...args] = line.trim().split(' ');
  if (command === '') return;

  if (command === '.disconnect') {
    return server.getWorlds().forEach(world => world.disconnect());
  }

  if (command === '.eval') {
    const world = server.getWorlds()[0];
    try {
      const result = await eval(args.join(' '));
      console.log(result);
    } catch (error) {
      console.error(error);
    }
    return;
  }

  for (const world of server.getWorlds()) {
    world.runCommand([command, ...args].join(' ')).then(res => {
      console.log(res);
    }).catch(console.error);
  }
});

const server = new Server();
server.on(ServerEvent.Open, () => {
  console.log('Server is now open!', server.options.port);
});

server.network.on('all', event => {
  if (event.packet.getId() === Packet.CommandResponse || event.packet.getId() === Packet.CommandRequest) return;
  if (event.bound === PacketBound.Server) {
    console.log(`[C->S] ${event.packet.getId()}`);
  } else {
    console.log(`[S->C] ${event.packet.getId()}`);
  }
});

server.on(ServerEvent.PlayerChat, async event => {
  console.dir(event, { depth: 0 });
  const [command, ...args] = event.message.trim().split(' ');
  if (command === '.set') {
    const [block, _radius] = args;
    const radius = parseInt(_radius) || 5;
    for (let x = 0; x < radius; x++) {
      for (let y = 0; y < radius; y++) {
        for (let z = 0; z < radius; z++) {
          event.world.runCommand(`setblock ${x} ${y} ${z} ${block}`).catch(console.error);
        }
      }
    }
  }
})

server.on(ServerEvent.WorldAdd, event => {
  console.log('World added', event.world.connection.identifier);
})

server.on(ServerEvent.WorldInitialize, event => {
  console.log('World initialized', event.localPlayer.name);
})

server.on(ServerEvent.WorldRemove, event => {
  console.log('World removed', event.world.connection.identifier);
})

server.on(ServerEvent.PlayerMessage, event => {
  console.dir(event, { depth: 1 });
})

server.on(ServerEvent.PlayerTitle, event => {
  console.dir(event, { depth: 1 });
})

server.on(ServerEvent.PlayerJoin, event => {
  console.log('Player joined', event.player.name);
})

server.on(ServerEvent.PlayerLeave, event => {
  console.log('Player left', event.player.name);
})
