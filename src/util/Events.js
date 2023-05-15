const Events = /** @type {const} */({
  ServerOpen: 'serverOpen',
  ServerClose: 'serverClose',
  WorldAdd: 'worldAdd',
  WorldRemove: 'worldRemove',
  PlayerJoin: 'playerJoin',
  PlayerLeave: 'playerLeave',
  PacketSend: 'packetSend',
  PacketReceive: 'packetReceive',
  Error: 'error',
  PlayerChat: 'playerChat',
  PlayerTitle: 'playerTitle',
  Tick: 'tick'
});

module.exports = Events