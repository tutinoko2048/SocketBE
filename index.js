const { Server } = require('./src');
const { PORT } = require('./config.json');

const server = new Server({ port: PORT });

server.events.subscribe('open', ev => {
  const { world } = ev;
  server.getLogger().info('connection opened: '+ world.id);
});

server.events.subscribe('close', ev => {
  const { world } = ev;
  server.getLogger().info('connection closed: '+ world.id);
});

server.events.subscribe('PlayerJoin', ev => {
  const { join } = ev;
  server.getLogger().info(`Joined: ${join}`);
});

server.events.subscribe('PlayerLeave', ev => {
  const { leave } = ev;
  server.getLogger().info(`Left: ${leave}`);
});

server.events.subscribe('PlayerMessage', async ev => {
  const { sender, message, world } = ev;
  server.getLogger().info(`<${sender}> ${message}`);
});