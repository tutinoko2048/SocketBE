import { BasePacket, DataRequestPacket, EventSubscribePacket, MessagePurpose, Packet, PacketBound, Server, ServerEvent, TravelMethod } from 'socket-be';
import { createInterface } from 'readline';
import { writeFileSync } from 'fs';

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
      const env = { world, server };
      const result = await (new Function(...Object.keys(env), `return (${args.join(' ')});`))(...Object.values(env));
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
    if (
      [Packet.PlayerMessage, Packet.PlayerTravelled, Packet.PlayerTransform].includes(event.packet.getId())
    ) return;

    console.log(`[C->S] ${event.packet.getId()}`);
  } else {
    console.log(`[S->C] ${event.packet.getId()}`);
  }
});

server.on(ServerEvent.PlayerChat, async event => {
  const { message, world } = event;
  console.dir(event, { depth: 0 });
  const [command, ...args] = message.trim().split(' ');
  if (command === '.set') {
    const [block, _radius] = args;
    const radius = parseInt(_radius) || 5;
    for (let x = 0; x < radius; x++) {
      for (let y = 0; y < radius; y++) {
        for (let z = 0; z < radius; z++) {
          world.runCommand(`setblock ${x} ${y} ${z} ${block}`).catch(console.error);
        }
      }
    }
  } else if (command === '.data') {}
})


server.on(ServerEvent.WorldAdd, event => {
  console.log('World added', event.world.connection.identifier);
})

server.on(ServerEvent.WorldInitialize, event => {
  console.log('World initialized', event.localPlayer.name);

  // for (const packetId of getPacketIds()) {
  //   const packet = new EventSubscribePacket();
  //   packet.eventName = packetId as any;
  //   event.world.send(packet);
  // }
})

server.on(ServerEvent.WorldRemove, event => {
  console.log('World removed', event.world.connection.identifier);
})

server.on(ServerEvent.PlayerMessage, event => {
  console.dir(event, { depth: 1 });
})

server.on(ServerEvent.PlayerTitle, event => {
  // console.dir(event, { depth: 1 });
})

server.on(ServerEvent.PlayerJoin, event => {
  console.log('Player joined', event.player.name);
})

server.on(ServerEvent.PlayerLeave, event => {
  console.log('Player left', event.player.name);
})

// server.on(ServerEvent.PlayerTravelled, ev => {
//   ev.player.onScreenDisplay.setActionBar(`TravelMethod: ${TravelMethod[ev.travelMethod]}`);
// })
const events = [
  ServerEvent.BlockBroken,
  ServerEvent.BlockPlaced,
  ServerEvent.EnableEncryption,
  ServerEvent.ItemAcquired,
  ServerEvent.ItemCrafted,
  ServerEvent.ItemEquipped,
  ServerEvent.ItemInteracted,
  ServerEvent.ItemSmelted,
  ServerEvent.ItemTraded,
  ServerEvent.MobInteracted,
  ServerEvent.PlayerBounced,
  ServerEvent.PlayerLoad,
  ServerEvent.PlayerTeleported,
  ServerEvent.PlayerTransform,
  ServerEvent.PlayerTravelled,
  ServerEvent.TargetBlockHit,
]
// events.forEach(event => {
//   server.on(event, ev => {
//     console.dir(ev, { depth: 1 });
//   })
// })