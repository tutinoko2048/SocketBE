const WebSocket = require('ws');
const Logger = require('./util/Logger');
const ServerEvent = require('./structures/ServerEvent');
const World = require('./structures/World');
const Util = require('./util/Util');
const { v4: uuidv4 } = require('uuid');
const ip = require('ip');
const { version } = require('./util/constants');
const Events = require('./util/Events');

  /**
   * @typedef {Object} ServerOptions
   * @property {number} [port]
   * @property {boolean} [debug]
   */

class Server extends WebSocket.Server {
  /**
   * 
   * @param {ServerOptions} [options]
   */
  constructor(options = {}) {
    console.log(`${'='.repeat(30)}\nStarting SocketBE Server\n${'='.repeat(30)}`);
    super(options);

    /** @type {ServerOptions} */
    this.options = options;

    /** @type {number} */
    this.startTime = Date.now();

    /** @type {Logger} */
    this.logger = new Logger('Server');

    /** @type {ServerEvent} */
    this.events = new ServerEvent(this);

    /** @type {Map<string, World>} */
    this.worlds = new Map();

    /** @type {number} */
    this.worldNumber = 0;

    this.logger.info(`This server is running SocketBE version ${version}`);
    
    this.on('connection', ws => {
      ws.id = uuidv4();

      const world = new World(this, ws, this.worldNumber++);
      this.addWorld(world);
      
      ws.on('message', packet => {
        const res = JSON.parse(packet);
        const world = this.getWorld(ws.id);
        res.world = world;
        this.emit(Events.PacketReceive, res);
        world.emit(Events.PacketReceive, res);
      });
      
      ws.on('close', () => {
        this.removeWorld(world);
      });
    });
    
    this.on('listening', () => this.events.emit(Events.ServerOpen));
    this.on('close', () => this.events.emit(Events.ServerClose));
    this.on('error', e => this.events.emit(Events.Error, e));
    
    this.logger.info(`WebSocket Server is runnning on ${ip.address()}:${options.port}`);
    this.logger.info(`Done (${(Date.now() - this.startTime) / 1000}s)!`); 
  }
  
  /**
   * 
   * @param {World} world 
   */
  addWorld(world) {
    this.worlds.set(world.id, world);
    this.events.emit(Events.WorldAdd, { world });
    
    world.sendPacket(Util.eventBuilder('commandResponse'));
    
    if (
      this.events._subscribed.has(Events.PlayerJoin) ||
      this.events._subscribed.has(Events.PlayerLeave)
    ) world._startInterval();
    
    if (
      this.events._subscribed.has(Events.PlayerChat) ||
      this.events._subscribed.has(Events.PlayerTitle)
    ) world.subscribeEvent('PlayerMessage');
  }
  
  /**
   * 
   * @param {World} world 
   */
  removeWorld(world) {
    world._stopInterval();
    this.events.emit('worldRemove', { world });
    this.worlds.delete(world.id);
  }
  
  /**
   * 
   * @param {string} worldId 
   * @returns {?World}
   */
  getWorld(worldId) {
    return this.worlds.get(worldId);
  }
  
  /**
   * 
   * @returns {World[]}
   */
  getWorlds() {
    return [...this.worlds.values()];
  }
  
  /**
   * 
   * @param {string} command 
   * @returns {Promise<Object[]>}
   */
  runCommand(command) {
    const res = this.getWorlds().map(w => w.runCommand(command));
    return Promise.all(res);
  }
  
  
  sendMessage(message, target) {
    const res = this.getWorlds().map(w => w.sendMessage(message, target));
    return Promise.all(res);
  }
}

module.exports = Server;