import { Packet, PacketBound, Server, ServerEvent } from 'socket-be';

const server = new Server();
server.on(ServerEvent.Open, () => {
  console.log('Server is now open!', server.options.port);
});

server.network.on('all', event => {
  if (event.packet.getId() === Packet.CommandResponse || event.packet.getId() === Packet.CommandRequest) return;
  if (event.bound === PacketBound.Server) {
    console.log(`[C->S] ${event.packet.getId()}`, event.packet);
  } else {
    console.log(`[S->C] ${event.packet.getId()}`);
  }
});

server.on(ServerEvent.PlayerChat, event => {
  console.log('Player chat', event.sender, event.message);
})

server.on(ServerEvent.WorldAdd, event => {
  console.log('World added', event.world.connection.identifier);
})

server.on(ServerEvent.WorldInitialize, event => {
  console.log('World initialized', event.localPlayer);
})

server.on(ServerEvent.WorldRemove, event => {
  console.log('World removed', event.world.connection.identifier);
})

server.on(ServerEvent.PlayerJoin, event => {
  console.log('Player joined', event.player);
})

server.on(ServerEvent.PlayerLeave, event => {
  console.log('Player left', event.player);
})
