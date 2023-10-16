import { WebSocket, Server as WebSocketServer } from 'ws';
import { Logger } from './util/Logger';
import { Events } from './structures/Events';
import { World } from './structures/World';
import { Util } from './util/Util';
import * as ip from 'ip';
import { version } from './util/constants';
import { CommandResult, RawText, ServerOptions } from './types';
import { ServerEvents, ServerEventTypes } from './structures/ServerEvents';

const defaultOption: ServerOptions = {
  timezone: 'UTC',
  listUpdateInterval: 1000,
  packetTimeout: 200000,
  debug: false,
  commandVersion: 31,
  formatter: {}
}

export class Server {
  public readonly options: ServerOptions;
  private worldNumber: number;
  private readonly worlds: Map<string, World>;
  public readonly wss: WebSocketServer;

  public readonly startTime: number;
  public readonly logger: Logger;
  public readonly ip: string;
  public readonly events: ServerEvents;
  public readonly rawEvents: Events<any>;

  constructor(options: ServerOptions = {}) {
    this.wss = new WebSocketServer({ ...defaultOption, ...options });
    this.options = { ...defaultOption, ...options };

    this.startTime = Date.now();
    this.logger = new Logger('Server', this.options);
    this.ip = ip.address();
    this.events = new ServerEvents(this);
    this.rawEvents = new Events(this);
    this.worlds = new Map();
    this.worldNumber = 0;

    this.logger.info(`This server is running SocketBE version ${version}`);
    
    this.wss.on('connection', ws => {
      const world = this.createWorld(ws);
      
      ws.on('message', (packet) => {
        world.packets.handle(packet);
      });
      
      ws.on('close', () => {
        this.removeWorld(world);
      });
      
      ws.on('error', e => this.events.emit(ServerEventTypes.Error, e))
    });
    
    this.logger.info(`WebSocket Server is runnning on ${this.ip}:${this.options.port}`);
    
    this.wss.on('listening', () => this.events.emit(ServerEventTypes.ServerOpen, null));
    this.wss.on('close', () => this.events.emit(ServerEventTypes.ServerClose, null));
    this.wss.on('error', e => this.events.emit(ServerEventTypes.Error, e));
    
    setInterval(() => this.events.emit(ServerEventTypes.Tick, null), 1000 / 20);
    
    this.logger.debug(`Server: Loaded (${(Date.now() - this.startTime) / 1000} s)`);
  }
  
  createWorld(ws: WebSocket) {
    const world = new World(this, ws, `World #${this.worldNumber++}`);
    
    world.sendPacket(Util.eventBuilder('commandResponse'));
    
    if (
      this.events._subscriptionCache.has(ServerEventTypes.PlayerJoin) ||
      this.events._subscriptionCache.has(ServerEventTypes.PlayerLeave)
    ) world._startInterval();
    
    if (
      this.events._subscriptionCache.has(ServerEventTypes.PlayerChat) ||
      this.events._subscriptionCache.has(ServerEventTypes.PlayerTitle)
    ) world.subscribeEvent('PlayerMessage');
    
    this.worlds.set(world.id, world);
    this.events.emit(ServerEventTypes.WorldAdd, { world });
    
    return world;
  }
  
  private removeWorld(world: World) {
    world._stopInterval();
    this.events.emit(ServerEventTypes.WorldRemove, { world });
    this.worlds.delete(world.id);
  }
  
  /**
   * Returns a world based on the provided id.
   * @param worldId An identifier of the world.
   */
  getWorld(worldId: string): World | undefined {
    return this.worlds.get(worldId);
  }
  
  /**
   * Returns an array of all the connected worlds.
   */
  getWorlds(): World[] {
    return [...this.worlds.values()];
  }
  
  /**
   * Sends a command to all the worlds.
   */
  runCommand(command: string): Promise<CommandResult[]> {
    const res = this.getWorlds().map(w => w.runCommand(command));
    return Promise.all(res);
  }
  
  /**
   * Sends a message to all the worlds.
   * @param message The message to be displayed.
   * @param target Player name or target selector
   */
  sendMessage(message: string | RawText, target?: string): Promise<void[]> {
    const res = this.getWorlds().map(w => w.sendMessage(message, target));
    return Promise.all(res);
  }
  
  /**
   * Disconnects all worlds
   */
  disconnectAll(): void {
    this.getWorlds().forEach(w => w.disconnect());
  }
}
