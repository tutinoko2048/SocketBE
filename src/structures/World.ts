import WebSocket from 'ws';
import { Util } from '../util/Util';
import { randomUUID } from 'node:crypto';
import { EventId } from '../util/Events';
import { Logger } from '../util/Logger';
import { ScoreboardManager } from '../managers/ScoreboardManager';
import type { Server } from '../Server';
import { PlayerList, PlayerDetail, ServerPacket, PlayerInfo } from '../types';

export class World {
  /** A websocket instance of the world. */
  public readonly ws: WebSocket.WebSocket;
  private server: Server;
  private responseTimes: number[];
  private countInterval: NodeJS.Timeout | null;
  private awaitingResponses: Map<string, (arg: ServerPacket) => void>

  public name: string;
  public readonly logger: Logger;
  public lastPlayers: string[];
  public maxPlayers: number;
  public readonly scoreboards: ScoreboardManager;
  public readonly connectedAt: number;
  public readonly id: string;
  protected localPlayer: string | null;

  constructor(server: Server, ws: WebSocket.WebSocket, name: string) {
    this.ws = ws;
    this.server = server;
    this.name = name;
    this.logger = new Logger(this.name, this.server.option);
    this.lastPlayers = [];
    this.maxPlayers = 0;
    this.scoreboards = new ScoreboardManager(this);
    this.connectedAt = Date.now();
    this.id = randomUUID();
    this.localPlayer = null;
    this.countInterval;
    this.awaitingResponses = new Map();
    this.responseTimes = [];
  }
  
  /**
   * The latency between server and minecraft
   */
  get ping(): number {
    return Util.median(this.responseTimes);
  }
  
  /**
   * Runs a particular command from the world.
   * @param command Command to run.
   * @returns A JSON structure with command response values.
   */
  async runCommand(command: string): Promise<any> {
    const packet = Util.commandBuilder(command, this.server.option.commandVersion);
    this.sendPacket(packet);
    if (command.startsWith('tellraw')) return {}; // no packet returns on tellraw command
    return await this.#getResponse(packet);
  }
  
  /**
   * Sends a messsage to the player.
   * @param  message The message to be displayed.
   * @param target Player name or target selector.
   */
  async sendMessage(message: string | Object, target: string = '@a'): Promise<void> {
    if (!target.match(/@s|@p|@a|@r|@e/)) target = `"${target}"`;
    
    const rawtext = (typeof message === 'object')
      ? message
      : { rawtext: [{ text: String(message) }] }
    
    await this.runCommand(`tellraw ${target} ${JSON.stringify(rawtext)}`);
  }
  
  
  /**
   * Returns information about players in the world.
   */
  async getPlayerList(): Promise<PlayerList> {
    const data = await this.runCommand('list');
    const status = data.statusCode == 0;
    const players = status ? data.players.split(', ') : [];
    const formattedPlayers = players.map(name => this.server.option.formatter.playerName?.(name) ?? name);
    return {
      current: status ? data.currentPlayerCount : 0,
      max: status ? data.maxPlayerCount : 0,
      players: formattedPlayers
    }
  }
  
  /**
   * Returns an array of player names in the world.
   */
  async getPlayers(): Promise<string[]> {
    const { players } = await this.getPlayerList();
    return players;
  }
  
  /**
   * Returns the name of local player (client)
   * @returns {Promise<string>}
   */
  async getLocalPlayer(): Promise<string> {
    const res = await this.runCommand('getlocalplayername');
    const player = res.localplayername;
    this.localPlayer = this.server.option.formatter.playerName?.(player) ?? player;
    return this.localPlayer;
  }
  
  /**
   * Returns all tags that a player has.
   */
  async getTags(player: string): Promise<string[]> {
    const res = await this.runCommand(`tag "${player}" list`);
    return (res.statusMessage as string).match(/§a.*?§r/g).map((str) => str.replace(/§a|§r/g, ''));
  }
  
  /**
   * Tests whether an player has a particular tag.
   */
  async hasTag(player: string, tag: string): Promise<boolean> {
    const tags = await this.getTags(player);
    return tags.includes(tag);
  }
  
  /**
   * Returns information about players with more details in the world.
   */
  async getPlayerDetail(): Promise<PlayerDetail> {
    const res = await this.runCommand('listd stats');
    const status = res.statusCode === 0;
    const details: PlayerInfo[] = JSON.parse(res.details.match(/\{.*\}/g)[0]).result;
    const players: string[] = status ? res.players.split(', ') : [];
    const formattedPlayers = players.map(name => this.server.option.formatter.playerName?.(name) ?? name);
    
    return {
      details,
      current: status ? res.currentPlayerCount : 0,
      max: status ? res.maxPlayerCount : 0,
      players: formattedPlayers
    }
  }

  /**
   * Sends a packet to the world.
   */
  sendPacket(packet: ServerPacket) {
    this.ws.send(JSON.stringify(packet));
    this.server.events.emit(EventId.PacketSend, { packet, world: this });
  }
  
  /**
   * Handles incoming packets
   * @returns {void}
   */
  _handlePacket(packet: ServerPacket) {
    const { header, body } = packet;
    // @ts-ignore
    this.server.events.emit(header.eventName, { ...body, world: this }); // minecraft ws events
    
    if (header.eventName === 'PlayerMessage') {
      body.sender = this.server.option.formatter.playerName?.(body.sender) ?? body.sender;
      if (body.type === 'title') {
        this.server.events.emit(EventId.PlayerTitle, { ...body, world: this });
      } else {
        this.server.events.emit(EventId.PlayerChat, { ...body, world: this });
      }
    }
    
    if (['commandResponse','error'].includes(header.messagePurpose)) {
      if (!this.awaitingResponses.has(packet.header.requestId)) return;
      this.awaitingResponses.get(packet.header.requestId)(packet.body);
      this.awaitingResponses.delete(packet.header.requestId);
    }
  }
  
  /**
   *
   * @param {ServerPacket} packet
   * @returns {Promise<Object>}
   */
  #getResponse(packet) {
    const packetId = packet.header.requestId;
    const sendTime = Date.now();
    
    return new Promise((res, rej) => {
      if (this.ws.readyState !== WebSocket.OPEN) return rej(new Error(`client is offline\npacket: ${JSON.stringify(packet, null, 2)}`));
        
      const timeout = setTimeout(() => {
        rej(new Error(`response timeout\npacket: ${JSON.stringify(packet, null, 2)}`));
      }, this.server.option.packetTimeout);
      
      this.awaitingResponses.set(packetId, (response) => {
        clearTimeout(timeout);
        if (this.responseTimes.length > 20) this.responseTimes.shift();
        this.responseTimes.push(Date.now() - sendTime);
        res(response);
      });
    });
  }
  
  async #updatePlayers() {
    try {
      const { players, max } = await this.getPlayerList();
      const join = players.filter(i => this.lastPlayers.indexOf(i) === -1);
      const leave = this.lastPlayers.filter(i => players.indexOf(i) === -1);
      
      this.lastPlayers = players;
      this.maxPlayers = max;
      
      if (join.length > 0) this.server.events.emit(EventId.PlayerJoin, { world: this, players: join });
      if (leave.length > 0) this.server.events.emit(EventId.PlayerLeave, { world: this, players: leave });
    } catch (e) {}
  }
  
  /** @ignore */
  _startInterval() {
    if (this.countInterval) return;
    this.#updatePlayers();
    this.countInterval = setInterval(this.#updatePlayers.bind(this), this.server.option.listUpdateInterval);
  }
  
  /** @ignore */
  _stopInterval() {
    if (this.countInterval) {
      clearInterval(this.countInterval);
      this.countInterval = null;
    }
  }
  
  /**
   * Sends an event subscribe packet.
   * @param {string} eventName A name of the event.
   */
  subscribeEvent(eventName) {
    this.sendPacket(Util.eventBuilder(eventName, 'subscribe'));
  }
  
  /**
   * Sends an event unsubscribe packet.
   * @param {string} eventName A name of the event.
   */
  unsubscribeEvent(eventName) {
    this.sendPacket(Util.eventBuilder(eventName, 'unsubscribe'));
  }
  
  /**
   * Closes a connection.
   * @deprecated
   */
  close() {
    process.emitWarning('World.close() Deprecated!', {
      code: 'Deprecated',
      detail: 'Use World.disconnect() instead',
    });
    this.ws.close();
  }
  
  /**
   * Disconnects this world.
   */
  disconnect() {
    this.ws.close();
  }
}