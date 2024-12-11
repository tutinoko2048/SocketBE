import { Server, ServerEvent } from 'socket-be';

const server = new Server();

server.on(ServerEvent.Open, () => {
  console.log('Server opened', server.network);
});

server.on(ServerEvent.PlayerJoin, ev => {
  ev
})