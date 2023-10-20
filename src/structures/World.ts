import { WebSocket } from 'ws';
import { Util, Logger } from '../util';
import { randomUUID } from 'node:crypto';
import { ServerEventTypes } from '../structures';
import { PacketManager, ScoreboardManager } from '../managers';
import type { Server } from '../Server';
import { PlayerList, PlayerDetail, ServerPacket, PlayerInfo, RawText, CommandResult } from '../types';

export class World {
  /** A websocket instance of the world. */
  public readonly ws: WebSocket;
  public readonly server: Server;
  public readonly logger: Logger;
  public readonly scoreboards: ScoreboardManager;
  public readonly packets: PacketManager;
  public readonly connectedAt: number;
  public readonly id: string;
  public name: string;

  protected lastPlayers: string[];
  protected maxPlayers: number;
  protected localPlayer: string | null;
  private countInterval: NodeJS.Timeout | null;

  constructor(server: Server, ws: WebSocket, name: string) {
    this.ws = ws;
    this.server = server;
    this.name = name;
    this.logger = new Logger(this.name, this.server.options);
    this.lastPlayers = [];
    this.maxPlayers = 0;
    this.scoreboards = new ScoreboardManager(this);
    this.packets = new PacketManager(this);
    this.connectedAt = Date.now();
    this.id = randomUUID();
    this.localPlayer = null;
    this.countInterval;

    this.sendPacket(Util.eventBuilder('commandResponse'));
    this.initializeEvents();
    this.ws.on('close', () => this.stopPlayerCounter());
  }
  
  /**
   * The latency between server and minecraft
   */
  get ping(): number {
    return Util.median(this.packets.responseTimes);
  }
  
  /**
   * Runs a particular command from the world.
   * @param command Command to run.
   * @returns A JSON structure with command response values.
   * @throws
   */
  public async runCommand(command: string): Promise<CommandResult> {
    const packet = Util.commandBuilder(command, this.server.options.commandVersion);
    this.sendPacket(packet);
    if (command.startsWith('tellraw')) return { statusCode: 0 }; // no packet returns on tellraw command
    
    const response = await this.packets.getCommandResponse(packet);
    return response.body;
  }
  
  /**
   * Sends a messsage to the player.
   * @param  message The message to be displayed.
   * @param target Player name or target selector.
   */
  public async sendMessage(message: string | RawText, target: string = '@a'): Promise<void> {
    if (!target.match(/@s|@p|@a|@r|@e/)) target = `"${target}"`;
    
    const rawtext = (typeof message === 'object')
      ? message
      : { rawtext: [{ text: String(message) }] }
    
    await this.runCommand(`tellraw ${target} ${JSON.stringify(rawtext)}`);
  }
  
  
  /**
   * Returns information about players in the world.
   */
  public async getPlayerList(): Promise<PlayerList> {
    const data = await this.runCommand('list');
    const status = data.statusCode == 0;
    const players = status ? (data.players as string).split(', ') : [];
    const formattedPlayers = players.map(name => this.server.options.formatter.playerName?.(name) ?? name);
    return {
      current: status ? data.currentPlayerCount : 0,
      max: status ? data.maxPlayerCount : 0,
      players: formattedPlayers
    }
  }
  
  /**
   * Returns an array of player names in the world.
   */
  public async getPlayers(): Promise<string[]> {
    const { players } = await this.getPlayerList();
    return players;
  }
  
  /**
   * Returns the name of local player (client)
   */
  public async getLocalPlayer(): Promise<string> {
    const res = await this.runCommand('getlocalplayername');
    const player = res.localplayername as string;
    this.localPlayer = this.server.options.formatter.playerName?.(player) ?? player;
    return this.localPlayer;
  }
  
  /**
   * Returns all tags that a player has.
   */
  public async getTags(player: string): Promise<string[]> {
    const res = await this.runCommand(`tag "${player}" list`);
    return res.statusMessage.match(/§a.*?§r/g).map((str) => str.replace(/§a|§r/g, ''));
  }
  
  /**
   * Tests whether an player has a particular tag.
   */
  public async hasTag(player: string, tag: string): Promise<boolean> {
    const tags = await this.getTags(player);
    return tags.includes(tag);
  }
  
  /**
   * Returns information about players with more details in the world.
   */
  public async getPlayerDetail(): Promise<PlayerDetail> {
    const res = await this.runCommand('listd stats');
    const status = res.statusCode === 0;
    const details: PlayerInfo[] = JSON.parse(res.details.match(/\{.*\}/g)[0]).result;
    const players: string[] = status ? res.players.split(', ') : [];
    const formattedPlayers = players.map(name => this.server.options.formatter.playerName?.(name) ?? name);
    
    return {
      details,
      current: status ? res.currentPlayerCount : 0,
      max: status ? res.maxPlayerCount : 0,
      players: formattedPlayers
    }
  }

  /** Sends a packet to the world. */
  public sendPacket(packet: ServerPacket): void {
    this.packets.send(packet);
  }

  private async updatePlayerList(): Promise<void> {
    try {
      const { players, max } = await this.getPlayerList();
      const join = players.filter(i => this.lastPlayers.indexOf(i) === -1);
      const leave = this.lastPlayers.filter(i => players.indexOf(i) === -1);
      
      this.lastPlayers = players;
      this.maxPlayers = max;
      
      if (join.length > 0) this.server.events.emit(ServerEventTypes.PlayerJoin, { world: this, joinedPlayers: join });
      if (leave.length > 0) this.server.events.emit(ServerEventTypes.PlayerLeave, { world: this, leftPlayers: leave });
    } catch (e) {}
  }
  
  /**
   * Sends an event subscribe packet.
   * @param eventName A name of the event.
   */
  public subscribeEvent(eventName: string): void {
    this.sendPacket(Util.eventBuilder(eventName, 'subscribe'));
  }
  
  /**
   * Sends an event unsubscribe packet.
   * @param eventName A name of the event.
   */
  public unsubscribeEvent(eventName: string): void {
    this.sendPacket(Util.eventBuilder(eventName, 'unsubscribe'));
  }
  
  /**
   * Disconnects this world.
   */
  public disconnect(): void {
    this.ws.close();
  }

  private initializeEvents(): void {
    const subscriptions = this.server.events._subscriptionCache;
    if (
      subscriptions.has(ServerEventTypes.PlayerJoin) ||
      subscriptions.has(ServerEventTypes.PlayerLeave)
    ) {
      this.startPlayerCounter();
    }

    if (
      subscriptions.has(ServerEventTypes.PlayerChat) ||
      subscriptions.has(ServerEventTypes.PlayerTitle)
    ) {
      this.subscribeEvent('PlayerMessage');
    }
  }

  private startPlayerCounter(): void {
    if (this.countInterval) return;
    this.updatePlayerList();
    this.countInterval = setInterval(() => this.updatePlayerList(), this.server.options.listUpdateInterval);
  }

  private stopPlayerCounter(): void {
    if (!this.countInterval) return;
    clearInterval(this.countInterval);
    this.countInterval = null;
  }
}
