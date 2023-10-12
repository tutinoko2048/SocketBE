import WebSocket from 'ws';
import { Logger } from './util/Logger';
import { Events } from './structures/Events';
import { World } from './structures/World';
import { Util } from './util/Util';
import ip from 'ip';
import { version } from './util/constants';
import { EventId } from './util/Events';
import { CommandResult, RawText, ServerOption } from './types';
import { ServerEvents } from './structures/ServerEvents';

const defaultOption: ServerOption = {
  timezone: 'UTC',
  listUpdateInterval: 1000,
  packetTimeout: 200000,
  debug: false,
  commandVersion: 31,
  formatter: {}
}

export class Server extends WebSocket.Server {
  public readonly option: ServerOption;
  private worldNumber: number;
  private worlds: Map<string, World>;

  public readonly startTime: number;
  public readonly logger: Logger;
  public readonly ip: string;
  public readonly events: ServerEvents;
  public readonly rawEvents: Events<any>;

  constructor(option: ServerOption = {}) {
    super({ ...defaultOption, ...option });
    this.option = { ...defaultOption, ...option };

    this.startTime = Date.now();
    this.logger = new Logger('Server', this.option);
    this.ip = ip.address();
    this.events = new ServerEvents(this);
    this.rawEvents = new Events(this);
    this.worlds = new Map();
    this.worldNumber = 0;

    this.logger.info(`This server is running SocketBE version ${version}`);
    
    this.on('connection', ws => {
      const world = this.createWorld(ws);
      
      ws.on('message', (packet) => {
        // @ts-ignore
        const res = JSON.parse(packet);
        this.events.emit(EventId.PacketReceive, { packet: res, world });
        world._handlePacket(res);
      });
      
      ws.on('close', () => {
        this.removeWorld(world);
      });
      
      ws.on('error', e => this.events.emit(EventId.Error, e))
    });
    
    this.logger.info(`WebSocket Server is runnning on ${this.ip}:${this.option.port}`);
    
    this.on('listening', () => this.events.emit(EventId.ServerOpen, null));
    this.on('close', () => this.events.emit(EventId.ServerClose, null));
    this.on('error', e => this.events.emit(EventId.Error, e));
    
    setInterval(() => this.events.emit(EventId.Tick, null), 1000 / 20);
    
    this.logger.debug(`Server: Loaded (${(Date.now() - this.startTime) / 1000} s)`);
  }
  
  createWorld(ws: WebSocket.WebSocket) {
    const world = new World(this, ws, `World #${this.worldNumber++}`);
    
    world.sendPacket(Util.eventBuilder('commandResponse'));
    
    if (
      this.events._subscribed.has(EventId.PlayerJoin) ||
      this.events._subscribed.has(EventId.PlayerLeave)
    ) world._startInterval();
    
    if (
      this.events._subscribed.has(EventId.PlayerChat) ||
      this.events._subscribed.has(EventId.PlayerTitle)
    ) world.subscribeEvent('PlayerMessage');
    
    this.worlds.set(world.id, world);
    this.events.emit(EventId.WorldAdd, { world });
    
    return world;
  }
  
  private removeWorld(world: World) {
    world._stopInterval();
    this.events.emit(EventId.WorldRemove, { world });
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
