const Events = /** @type {const} */({
  ServerOpen: 'serverOpen',
  ServerClose: 'serverClose',
  WorldAdd: 'worldAdd',
  WorldRemove: 'worldRemove',
  PlayerJoin: 'playerJoin',
  PlayerLeave: 'playerLeave',
  PacketReceive: 'packetReceive',
  Error: 'error',
  PlayerChat: 'playerChat',
  PlayerTitle: 'playerTitle',
  Tick: 'tick'
})

module.exports = Events