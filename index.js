const { Server } = require("./src");
const { PORT } = require("./config.json");

const server = new Server({ port: PORT });

server.events.on("serverOpen", () => {
  console.log("open");
});

server.events.on("worldAdd", (ev) => {
  const { world } = ev;
  server.logger.info("connection opened: " + world.id);
});

server.events.on("worldRemove", (ev) => {
  const { world } = ev;
  server.logger.info("connection closed: " + world.id);
});

server.events.on("playerJoin", (ev) => {
  const { players } = ev;
  server.logger.info(`Joined: ${players}`);
});

server.events.on("playerLeave", (ev) => {
  const { players } = ev;
  server.logger.info(`Left: ${players}`);
});

server.events.on("playerChat", async (ev) => {
  const { sender, message } = ev;
  server.logger.info(`<${sender}> ${message}`);
});
