const WebSocket = require('ws');
const Logger = require('./util/Logger');
const Events = require('./structures/Events');
const World = require('./structures/World');
const Util = require('./util/Util');
const { v4: uuidv4 } = require('uuid');
const ip = require('ip');
const { version } = require('./util/constants');
const ServerEvents = require('./util/Events');

class Server extends WebSocket.Server {
  /**
   * 
   * @param {ServerOptions} [options]
   */
  constructor(options = {}) {
    super(options);
    
    /** @type {ServerOptions} */
    this.options = options;

    /** @type {number} */
    this.startTime = Date.now();

    /** @type {Logger} */
    this.logger = new Logger('Server');

    /** @type {Events} */
    this.events = new Events(this);

    /** @type {Map<string, World>} */
    this.worlds = new Map();

    /** @type {number} */
    this.worldNumber = 0;

    this.logger.info(`This server is running SocketBE version ${version}`);
    
    this.on('connection', ws => {
      Object.defineProperty(ws, 'id', {
        value: uuidv4(),
        writable: false
      });

      const world = new World(this, ws, this.worldNumber++);
      this.#addWorld(world);
      
      ws.on('message', packet => {
        const res = JSON.parse(packet);
        const world = this.getWorld(ws.id);
        this.emit(ServerEvents.PacketReceive, { ...res, world });
        world._handlePacket(res);
      });
      
      ws.on('close', () => {
        this.#removeWorld(world);
      });
    });
    
    this.on('listening', () => this.events.emit(ServerEvents.ServerOpen));
    this.on('close', () => this.events.emit(ServerEvents.ServerClose));
    this.on('error', e => this.events.emit(ServerEvents.Error, e));
    
    this.logger.info(`WebSocket Server is runnning on ${ip.address()}:${options.port}`);
    this.logger.debug(`Server: Loaded (${(Date.now() - this.startTime) / 1000} s)`);
  }
  
  /**
   * 
   * @param {World} world 
   */
  #addWorld(world) {
    this.worlds.set(world.id, world);
    this.events.emit(ServerEvents.WorldAdd, { world });
    
    world.sendPacket(Util.eventBuilder('commandResponse'));
    
    if (
      this.events._subscribed.has(ServerEvents.PlayerJoin) ||
      this.events._subscribed.has(ServerEvents.PlayerLeave)
    ) world._startInterval();
    
    if (
      this.events._subscribed.has(ServerEvents.PlayerChat) ||
      this.events._subscribed.has(ServerEvents.PlayerTitle)
    ) world.subscribeEvent('PlayerMessage');
  }
  
  /**
   * 
   * @param {World} world 
   */
  #removeWorld(world) {
    world._stopInterval();
    this.events.emit(ServerEvents.WorldRemove, { world });
    this.worlds.delete(world.id);
  }
  
  /**
   * 
   * @param {string} worldId 
   * @returns {World|undefined}
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
  
  /**
   *
   * @param {string|Object} message
   * @param {string} [target]
   */
  sendMessage(message, target) {
    const res = this.getWorlds().map(w => w.sendMessage(message, target));
    return Promise.all(res);
  }
}

module.exports = Server;