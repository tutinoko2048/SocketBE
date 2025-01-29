import { Scoreboard } from './scoreboard';
import { CommandRequestPacket } from '../network';
import { PlayerJoinSignal, PlayerLeaveSignal, WorldInitializeSignal } from '../events';
import { Player } from './player';
import type { RawText, Vector3 } from '@minecraft/server';
import type { Server } from '../server';
import type { PlayerList, PlayerDetail, PlayerListDetail, BlockInfo } from '../types';
import type { BasePacket, Connection } from '../network';
import type { CommandResult, IHeader } from '../types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { InvalidConnectionError, CommandTimeoutError, CommandError } from '../errors';


export class World {
  private static index = 0;
  
  public readonly server: Server;

  public readonly connection: Connection;
  
  public readonly scoreboard: Scoreboard;

  public readonly players: Map<string, Player> = new Map();

  public localPlayer: Player | null = null;
  
  public maxPlayers: number = -1;
  
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
   * 
   * @throws This function can throw errors.
   * {@link InvalidConnectionError}
   * {@link CommandTimeoutError}
   * {@link CommandError}
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
  public async sendMessage(message: string | RawText, target: string | Player = '@a') {
    let commandTarget: string;
    //TODO - implement EntityQueryOptions
    if (typeof target === 'string') {
      if (!target.match(/@s|@p|@a|@r|@e/)) commandTarget = `"${target}"`;
    } else {
      commandTarget = `"${target.rawName}"`;
    }
    
    const rawtext: RawText = (typeof message === 'object')
      ? message
      : { rawtext: [{ text: String(message) }] }
    
    await this.runCommand(`tellraw ${commandTarget} ${JSON.stringify(rawtext)}`);
  }
  
  /**
   * Returns information about players in the world.
   */
  public async getPlayerList(): Promise<PlayerList> {
    const data = await this.runCommand('list');
    const status = data.statusCode == 0;
    const players: string[] = status ? data.players.split(', ') : [];
    const formattedPlayers = players.map(name => this.formatPlayerName(name));
    return {
      current: status ? data.currentPlayerCount : 0,
      max: status ? data.maxPlayerCount : 0,
      players: formattedPlayers
    }
  }
  
  /**
   * Returns an array of player names in the world.
   */
  public async getPlayers(): Promise<Player[]> {
    await this.updatePlayerList();
    return [...this.players.values()];
  }
  
  /**
   * Returns the name of local player (client)
   */
  public async getLocalPlayer(): Promise<Player> {
    if (this.localPlayer) return this.localPlayer;

    const res = await this.runCommand('getlocalplayername');
    const localPlayerName: string = res.localplayername;
    return this.resolvePlayer(localPlayerName);
  }
  
  /**
   * Returns information about players with more details in the world.
   */
  public async getPlayerDetail(): Promise<PlayerListDetail> {
    const res = await this.runCommand('listd stats');
    const status = res.statusCode === 0;
    const details: PlayerDetail[] = JSON.parse(res.details.match(/\{.*\}/g)[0]).result;
    const players: string[] = status ? res.players.split(', ') : [];
    const formattedPlayers = players.map(name => this.formatPlayerName(name));
    
    return {
      details,
      current: status ? res.currentPlayerCount : 0,
      max: status ? res.maxPlayerCount : 0,
      players: formattedPlayers
    }
  }

  /**
   * Returns the top solid block at a particular position.
   * @param position If not specified, the position of the local player is used.
   */
  public async getTopSolidBlock(position?: Vector3): Promise<BlockInfo> {
    const positionArg = position ? `${position.x} ${position.y} ${position.z}` : '~ ~ ~';
    const res = await this.runCommand<BlockInfo>(`gettopsolidblock ${positionArg}`);
    if (res.statusCode !== 0) throw new Error(res.statusMessage);

    const block: BlockInfo = { blockName: res.blockName, position: res.position };
    return block;
  }

  /**
   * Disconnects this world.
   */
  public async disconnect() {
    await this.runCommand('closewebsocket');
  }
  
  private async updatePlayerList(isFirst = false) {
    try {
      const { players: newPlayers, max } = await this.getPlayerList();
      const joins = newPlayers.filter(rawName => !this.players.has(rawName))
      const leaves = [...this.players.keys()].filter(rawName => !newPlayers.includes(rawName));
      
      this.maxPlayers = max;

      if (isFirst) return;

      for (const join of joins) {
        const player = this.resolvePlayer(join);
        if (!isFirst) new PlayerJoinSignal(this, player).emit();
      }

      for (const leave of leaves) {
        const player = this.resolvePlayer(leave);
        if (!isFirst) new PlayerLeaveSignal(this, player).emit();
        this.players.delete(leave);
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

  public onConnect() {
    this.getLocalPlayer().then(player => {
      this.localPlayer = player;

      new WorldInitializeSignal(this).emit();
    }).catch(() => console.error('Failed to get local player'));
  }

  public onDisconnect() {
    this.stopInterval();
  }

  public resolvePlayer(rawName: string): Player {
    let player = this.players.get(rawName);
    player ??= new Player(this, rawName);
    this.players.set(rawName, player);
    return player;
  }

  public formatPlayerName(playerName: string) {
    return this.server.options.formatter.playerName?.(playerName) ?? playerName;
  }
}
