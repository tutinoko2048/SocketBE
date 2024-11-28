import { Scoreboard } from './scoreboard';
import { CommandRequestPacket } from '../network';
import { PlayerJoinSignal, PlayerLeaveSignal } from '../events';
import type { RawText } from '@minecraft/server';
import type { Server } from '../server';
import type { PlayerList, PlayerDetail, PlayerListDetail } from '../types';
import type { BasePacket, Connection } from '../network';
import type { CommandResult, IHeader } from '../types';


export class World {
  private static index = 0;
  
  public readonly server: Server;

  public readonly connection: Connection;
  
  public readonly scoreboard: Scoreboard;

  public localPlayer: string | null = null;
  
  public maxPlayers: number = -1;
  
  public lastPlayers: string[] = [];

  private readonly index = World.index++;

  private countInterval: NodeJS.Timeout | null = null;
  
  constructor(server: Server, connection: Connection) {
    this.server = server;
    this.connection = connection;
    this.scoreboard = new Scoreboard(this);

    this.startInterval();
  }

  public get name() {
    return `World #${this.index}`;
  }

  public get connectedAt() {
    return this.connection.establishedAt;
  }

  public get averagePing() {
    const responseTimes = this.connection.responseTimes;
    if (responseTimes.length === 0) return -1;
    return responseTimes.reduce((a, b) => a + b) / responseTimes.length;
  }

  public send(packet: BasePacket): IHeader {
    return this.server.network.send(this.connection, packet);
  }
  
  /**
   * Runs a particular command from the world.
   * @param command Command to run.
   * @returns A JSON structure with command response values.
   */
  public async runCommand<
    R extends Record<string, any> = Record<string, any>
  >(command: string): Promise<CommandResult<R>> {
    const packet = new CommandRequestPacket();
    packet.version = this.server.options.commandVersion;
    packet.commandLine = command;

    const header = this.send(packet);

    const response = await this.connection.awaitCommandResponse(header.requestId, packet);
    return response.toCommandResult<R>();

    //TODO - recheck tellraw command response
    // if (command.startsWith('tellraw')) return {}; // no packet returns on tellraw command
  }
  
  /**
   * Sends a messsage to the player.
   * @param message The message to be displayed.
   * @param target Player name or target selector.
   */
  public async sendMessage(message: string | RawText, target = '@a') {
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
    const players: string[] = status ? data.players.split(', ') : [];
    const formattedPlayers = players.map(name => this.formatPlayer(name));
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
    const player = res.localplayername;
    this.localPlayer = this.formatPlayer(player);
    return this.localPlayer;
  }
  
  /**
   * Returns all tags that a player has.
   */
  public async getTags(player: string): Promise<string[]> {
    const res = await this.runCommand(`tag "${player}" list`);
    const tags: string[] = (res.statusMessage.match(/§a.*?§r/g) as string[])
      .map(str => str.replace(/§a|§r/g, ''));
    return tags;
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
  public async getPlayerDetail(): Promise<PlayerListDetail> {
    const res = await this.runCommand('listd stats');
    const status = res.statusCode === 0;
    const details: PlayerDetail[] = JSON.parse(res.details.match(/\{.*\}/g)[0]).result;
    const players: string[] = status ? res.players.split(', ') : [];
    const formattedPlayers = players.map(name => this.formatPlayer(name));
    
    return {
      details,
      current: status ? res.currentPlayerCount : 0,
      max: status ? res.maxPlayerCount : 0,
      players: formattedPlayers
    }
  }
  
  private async updatePlayerList(isFirst = false) {
    try {
      const { players, max } = await this.getPlayerList();
      const joins = players.filter(i => this.lastPlayers.indexOf(i) === -1);
      const leaves = this.lastPlayers.filter(i => players.indexOf(i) === -1);
      
      this.lastPlayers = players;
      this.maxPlayers = max;

      if (isFirst) return;

      for (const player of joins) {
        new PlayerJoinSignal(this, player).emit();
      }

      for (const player of leaves) {
        new PlayerLeaveSignal(this, player).emit();
      }
    } catch {}
  }
  

  private startInterval() {
    if (this.countInterval) return;
    void this.updatePlayerList();
    this.countInterval = setInterval(this.updatePlayerList.bind(this), this.server.options.listUpdateInterval);
  }
  
  private stopInterval() {
    if (this.countInterval) {
      clearInterval(this.countInterval);
      this.countInterval = null;
    }
  }
  
  /**
   * Disconnects this world.
   */
  public async disconnect() {
    await this.runCommand('closewebsocket');
  }

  public onDisconnect() {
    this.stopInterval();
  }

  private formatPlayer(player: string) {
    return this.server.options.formatter.playerName?.(player) ?? player;
  }
}
