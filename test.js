const { Server } = require("./src");

const server = new Server({
  port: 8000,
  debug: true,
  timezone: 'Asia/Tokyo',
});

server.events.on("serverOpen", () => {
  server.logger.log("open");
});

server.events.on("worldAdd", (ev) => {
  const { world } = ev;
  server.logger.info("connection opened: " + world.id);
  world.sendMessage('connected')
});

server.events.on("worldRemove", (ev) => {
  const { world } = ev;
  server.logger.info("connection closed: " + world.id);
});

server.events.on("playerJoin", (ev) => {
  const { players } = ev;
  server.logger.info(`Joined: ${players.join(', ')}`);
});

server.events.on("playerLeave", (ev) => {
  const { players } = ev;
  server.logger.info(`Left: ${players.join(', ')}`);
});

server.events.on("playerChat", async (ev) => {
  const { sender, message, type, world } = ev;
  server.logger.info(`${type} <${sender}> ${message}`);
  
  if (!message.startsWith('!')) return;
  const [ command, ...args ] = message.slice(1).split(' ');
  if (command == 'get') {
    const obj = await world.scoreboards.getObjectives();
    world.sendMessage(JSON.stringify(obj))
  }
});

server.events.on("playerTitle", ev => {
  const { sender, message } = ev;
  server.logger.info(`${sender}: title ${message}`)
})
server.events.on('error', e => {
  server.logger.error(e);
});

server.on('error', console.error);

process.stdin.setEncoding("utf8");

var reader = require("readline").createInterface({
  input: process.stdin,
});

reader.on("line", (line) => {
  if (line.startsWith('/')) {
    server.runCommand(line).then(console.log)
  } else {
    try {
      const res = eval(line);
      console.log(res)
    } catch (e) {
      console.error('EvalError', e);
    }
  }
});