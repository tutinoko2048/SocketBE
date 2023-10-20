import { WebSocket, Server as WebSocketServer } from 'ws';
import { Logger, version } from './util';
import { Events, World, ServerEvents, ServerEventTypes } from './structures';
import * as ip from 'ip';
import { CommandResult, RawText, ServerOptions } from './types';

const defaultOptions: ServerOptions = {
  timezone: 'UTC',
  listUpdateInterval: 1000,
  packetTimeout: 200000,
  debug: false,
  commandVersion: 31,
  emitLogs: true,
  formatter: {},
  ws: {}
}

export class Server {
  public readonly options: ServerOptions;
  public readonly wss: WebSocketServer;
  public readonly startTime: number;
  public readonly logger: Logger;
  public readonly ip: string;
  public readonly port: number;
  public readonly events: ServerEvents;
  public readonly rawEvents: Events<any>;

  private readonly worlds: Map<string, World>;
  private worldNumber: number;

  constructor(options: ServerOptions) {
    this.ip = ip.address();
    this.port = options.port;
    const websocketOptions = options.ws ?? {};
    websocketOptions.port = options.port;
    this.wss = new WebSocketServer(websocketOptions);
    this.options = { ...defaultOptions, ...options };
    this.options.ws = this.wss.options;

    this.startTime = Date.now();
    this.logger = new Logger('Server', this.options);
    this.port = this.wss.options.port;
    this.events = new ServerEvents(this);
    this.rawEvents = new Events(this);
    this.worlds = new Map();
    this.worldNumber = 0;

    this.logger.info(`This server is running SocketBE version ${version}`);
    
    this.wss.on('connection', ws => {
      const world = this.createWorld(ws);
      ws.on('message', (packet) => world.packets.handle(packet));
      ws.on('close', () => this.removeWorld(world));
      ws.on('error', (e) => this.events.emit(ServerEventTypes.Error, e))
    });
    
    this.logger.info(`WebSocket Server is runnning on ${this.ip}:${this.options.port}`);
    
    this.wss.on('listening', () => this.events.emit(ServerEventTypes.ServerOpen, null));
    this.wss.on('close', () => this.events.emit(ServerEventTypes.ServerClose, null));
    this.wss.on('error', (e) => this.events.emit(ServerEventTypes.Error, e));
    
    setInterval(() => this.events.emit(ServerEventTypes.Tick, null), 1000 / 20);
    
    this.logger.debug(`Server: Loaded (${(Date.now() - this.startTime) / 1000} s)`);
  }
  
  private createWorld(ws: WebSocket) {
    const world = new World(this, ws, `World #${this.worldNumber++}`);
    this.worlds.set(world.id, world);
    this.events.emit(ServerEventTypes.WorldAdd, { world });
    return world;
  }
  
  private removeWorld(world: World) {
    this.events.emit(ServerEventTypes.WorldRemove, { world });
    this.worlds.delete(world.id);
  }
  
  /**
   * Returns a world based on the provided id.
   * @param worldId An identifier of the world.
   */
  public getWorld(worldId: string): World | undefined {
    return this.worlds.get(worldId);
  }
  
  /**
   * Returns an array of all the connected worlds.
   */
  public getWorlds(): World[] {
    return [...this.worlds.values()];
  }
  
  /**
   * Sends a command to all the worlds.
   */
  public runCommand(command: string): Promise<CommandResult[]> {
    const res = this.getWorlds().map(w => w.runCommand(command));
    return Promise.all(res);
  }
  
  /**
   * Sends a message to all the worlds.
   * @param message The message to be displayed.
   * @param target Player name or target selector
   */
  public sendMessage(message: string | RawText, target?: string): Promise<void[]> {
    const res = this.getWorlds().map(w => w.sendMessage(message, target));
    return Promise.all(res);
  }
  
  /**
   * Disconnects all worlds
   */
  public disconnectAll(): void {
    this.getWorlds().forEach(w => w.disconnect());
  }
}
