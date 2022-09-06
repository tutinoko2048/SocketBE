const WebSocket = require('ws');
const { Util, World, ServerEvent, PluginManager, Logger } = require('../');
const { v4: uuidv4 } = require('uuid');
const ip = require('ip');
const { version } = require('../constants');

class Server extends WebSocket.Server {
  constructor(config) {
    console.log(`${'='.repeat(30)}\nStarting SocketBE Server\n${'='.repeat(30)}`);
    super(config);
    this.startTime = Date.now();
    this.logger = new Logger('Server');
    this.events = new ServerEvent(this);
    this.worlds = new Map();
    this.subscribedEvents = new Set();
    this.number = 0;
    this.getLogger().info(`This server is running SocketBE version ${version}`);
    this.plugin = new PluginManager(this);
    
    this.on('connection', async ws => {
      ws.id = uuidv4();
      const world = new World(this, ws);
      world.number = this.number++;
      this.addWorld(world);
      
      ws.on('message', packet => {
        const res = JSON.parse(packet);
        this.getWorld(ws.id).emit('packet', res);
      });
      
      ws.on('close', () => {
        this.removeWorld(world);
      });
    });
    
    this.plugin.enablePlugins();
    
    this.getLogger().info(`WebSocket Server is runnning on ${ip.address()}:${config.port || config}`);
    this.getLogger().info(`Done (${(Date.now()-this.startTime) / 1000}s)!`); 
    
  }
  
  addWorld(world) {
    this.worlds.set(world.id, world);
    this.events.emit('open', { world });
    
    world.ws.send(JSON.stringify(Util.eventBuilder('commandResponse')));

    this.subscribedEvents.forEach(eventName => {
      if (eventName == 'PlayerJoin' || eventName == 'PlayerLeave') { // start interval
        world.startInterval();
      } else {
        world.ws.send(JSON.stringify(Util.eventBuilder(eventName))); // send packet
      }
    });
  }
  
  removeWorld(world) {
    world.stopInterval();
    this.events.emit('close', { world });
    this.worlds.delete(world.id);
  }
  
  getWorld(id) {
    return id ? this.worlds.get(id) : this.getWorlds()[0];
  }
  
  getWorlds() {
    return [...this.worlds.values()];
  }
  
  getLogger() {
    return this.logger;
  }
  
  async runCommand(command) {
    const res = this.getWorlds().map(w => w.runCommand(command));
    return Promise.all(res);
  }
  
  async sendMessage(...args) {
    const res = this.getWorlds().map(w => w.sendMessage(...args));
    return Promise.all(res);
  }
}

module.exports = Server;