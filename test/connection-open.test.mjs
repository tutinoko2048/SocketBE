import { expect, it } from 'vite-plus/test';
import { Server, ServerEvent } from '../src/index';

function createSocket() {
  return {
    OPEN: 1,
    readyState: 1,
    closed: false,
    on() {},
    close() {
      this.closed = true;
    },
  };
}

it('rejects a connection before encryption and world registration', async () => {
  const server = new Server({ port: 0 });
  const socket = createSocket();
  let handled = false;

  server.before(ServerEvent.ConnectionOpen, ({ connection }) => {
    return connection.info.headers.authorization === 'allowed';
  });
  server.on(ServerEvent.ConnectionOpen, () => {
    handled = true;
  });

  try {
    await server.network.onConnection(socket, {
      headers: { authorization: 'denied' },
      url: '/',
      socket: { remoteAddress: '127.0.0.1' },
    });

    expect(socket.closed).toBe(true);
    expect(handled).toBe(false);
    expect(server.network.connections.size).toBe(0);
    expect(server.worlds.size).toBe(0);
  } finally {
    server.network.stop();
  }
});
