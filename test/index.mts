import { Packet, PacketBound, Server, ServerEvent } from 'socket-be';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', line => {
  const command = line.trim();
  if (command === '') return;
  server.broadcastCommand(command).then(res => {
    console.log(res);
  }).catch(console.error);
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

server.on(ServerEvent.PlayerChat, event => {
  console.dir(event, { depth: 1 });
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
