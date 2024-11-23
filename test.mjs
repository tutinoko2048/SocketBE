// @ts-check
import { Server, ServerEvent } from './src';

const server = new Server();
server.on(ServerEvent.Open, () => {
  console.log('Server is open');
});