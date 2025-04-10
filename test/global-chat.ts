import { Server, ServerEvent } from 'socket-be';

const server = new Server({
  port: 8000,
})

server.on(ServerEvent.Open, () => {
  console.log('Server started')
})

server.on(ServerEvent.WorldInitialize, (event) => {
  console.log('World connected', event.world.name)
})

server.on(ServerEvent.PlayerChat, async ev => {
  const { sender, message, world } = ev;

  if (sender.name === '外部') return;
  console.log(`[${world.name}] ${sender.name}: ${message}`);

  for (const w of server.getWorlds()) {
    if (w === ev.world) continue;
    await w.sendMessage(`§6[${world.name}]§r <${sender.name}> ${message}`);
  }
});