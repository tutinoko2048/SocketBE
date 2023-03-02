const WebSocket = require('ws');
const Logger = require('../util/Logger');
const ServerEvent = require('../server/ServerEvent');
const World = require('../world/World');
const Util = require('../util/Util');
const { v4: uuidv4 } = require('uuid');
const ip = require('ip');
const { version } = require('../util/constants');

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

    /** @type {Set<string>} */
    this.subscribedEvents = new Set();

    /** @type {number} */
    this.worldNumber = 0;

    this.getLogger().info(`This server is running SocketBE version ${version}`);
    
    this.on('connection', ws => {
      ws.id = uuidv4();

      const world = new World(this, ws);
      this.addWorld(world);
      
      ws.on('message', packet => {
        const res = JSON.parse(packet);
        const world = this.getWorld(ws.id);
        res.world = world;
        this.emit('packetReceive', res);
        world.emit('packetReceive', res);
      });
      
      ws.on('close', () => {
        this.removeWorld(world);
      });
    });
    
    this.getLogger().info(`WebSocket Server is runnning on ${ip.address()}:${options.port}`);
    this.getLogger().info(`Done (${(Date.now() - this.startTime) / 1000}s)!`); 
    
    this.emit('serverOpen');
  }
  
  /**
   * 
   * @param {World} world 
   */
  addWorld(world) {
    world.setNumber(this.worldNumber++);

    this.worlds.set(world.id, world);
    this.events.emit('worldAdd', { world });
    
    world.sendPacket(Util.eventBuilder('commandResponse'));

    this.subscribedEvents.forEach(eventName => {
      if (eventName == 'playerJoin' || eventName == 'playerLeave') { // start interval
        world.startInterval();
      } else {
        world.sendPacket(Util.eventBuilder(eventName)); // send packet
      }
    });
  }
  
  /**
   * 
   * @param {World} world 
   */
  removeWorld(world) {
    world.stopInterval();
    this.events.emit('worldRemove', { world });
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
   * @returns {Logger}
   */
  getLogger() {
    return this.logger;
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
  
  sendMessage(...args) {
    const res = this.getWorlds().map(w => w.sendMessage(...args));
    return Promise.all(res);
  }
}

module.exports = Server;