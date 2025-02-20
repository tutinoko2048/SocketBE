import { Scoreboard } from './scoreboard';
import { CommandRequestPacket, CommandResponsePacket, EncryptionRequestPacket } from '../network';
import { EnableEncryptionSignal, PlayerJoinSignal, PlayerLeaveSignal, WorldInitializeSignal } from '../events';
import { EntityQueryUtil, Player } from '../entity';
import { CommandStatusCode, EncryptionMode, WeatherType } from '../enums';
import { RawTextUtil } from '../world';
import type { RawMessage, Vector3 } from '@minecraft/server';
import type { Server } from '../server';
import type { PlayerList, PlayerDetail, PlayerListDetail, BlockInfo, CommandOptions, EntityQueryOptions, SetBlockOptions, IBlockVolume, FillBlocksOptions } from '../types';
import type { BasePacket, Connection } from '../network';
import type { CommandResult, IHeader } from '../types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { InvalidConnectionError, RequestTimeoutError, CommandError } from '../errors';


export class World {
  private static index = 0;
  
  public readonly server: Server;

  public readonly connection: Connection;
  
  public readonly scoreboard: Scoreboard;

  public readonly players: Map<string, Player> = new Map();

  private _localPlayer: Player | null = null;
  
  private _maxPlayers: number = -1;
  
  private _isValid = true;
  
  private countInterval: NodeJS.Timeout | null = null;
  
  private readonly index = World.index++;

  constructor(server: Server, connection: Connection) {
    this.server = server;
    this.connection = connection;
    this.scoreboard = new Scoreboard(this);
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

  public get localPlayer() {
    return this._localPlayer;
  }

  public get maxPlayers() {
    return this._maxPlayers;
  }

  public get isValid() {
    return this._isValid;
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
   * - {@link InvalidConnectionError}  
   * - {@link RequestTimeoutError}  
   * - {@link CommandError}  
   */
  public async runCommand<R extends Record<string, any> = Record<string, any>>(
    command: string,
    options?: CommandOptions,
  ): Promise<CommandResult<R>> {
    const packet = new CommandRequestPacket();
    packet.version = options?.version ?? this.server.options.commandVersion;
    packet.commandLine = command;

    const header = this.send(packet);

    if (options?.noResponse) return CommandResponsePacket.createEmptyResult<R>();

    const response = await this.connection.awaitCommandResponse(header.requestId, packet, options?.timeout);
    return response.toCommandResult<R>();
  }
  
  /**
   * Sends a messsage to the player.
   * @param message The message to be displayed.
   * @param target Player name or target selector.
   */
  public async sendMessage(message: string | RawMessage | (string | RawMessage)[], target: string | Player | EntityQueryOptions = '@a') {
    let commandTarget: string;
    if (typeof target === 'string') {
      if (target.match(/^@/)) { // selector
        commandTarget = target;
      } else { // player name
        commandTarget = `"${target}"`;
      }
    } else if (target instanceof Player) {
      commandTarget = `"${target.rawName}"`;
    } else {
      commandTarget = EntityQueryUtil.buildSelector('@a', target);
    }
    
    const rawtext = RawTextUtil.createRawText(message);
    
    const res = await this.runCommand(`tellraw ${commandTarget} ${JSON.stringify(rawtext)}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }
  
  /**
   * Returns information about players in the world.
   */
  public async getPlayerList(): Promise<PlayerList> {
    const data = await this.runCommand('list');
    const status = data.statusCode >= CommandStatusCode.Success;
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
    if (this._localPlayer) return this._localPlayer;

    const res = await this.runCommand('getlocalplayername');
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);

    const localPlayerName: string = res.localplayername;
    return this.resolvePlayer(localPlayerName);
  }
  
  /**
   * Returns information about players with more details in the world.
   */
  public async getPlayerDetail(): Promise<PlayerListDetail> {
    const res = await this.runCommand('listd stats');
    const status = res.statusCode >= CommandStatusCode.Success;
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
   * Returns the top solid block at a particular location.
   * @param location If not specified, the location of the local player is used.
   */
  public async getTopSolidBlock(location?: Vector3): Promise<BlockInfo> {
    const positionArg = location ? `${location.x} ${location.y} ${location.z}` : '~ ~ ~';
    const res = await this.runCommand<BlockInfo>(`gettopsolidblock ${positionArg}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);

    const block: BlockInfo = { blockName: res.blockName, position: res.position };
    return block;
  }

  public async getCurrentTick(): Promise<number> {
    const res = await this.runCommand<{ data: number }>('time query gametime');
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
    
    return res.data;
  }

  public async getDay(): Promise<number> {
    const res = await this.runCommand<{ data: number }>('time query day');
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
    
    return res.data;
  }

  public async getTimeOfDay(): Promise<number> {
    const res = await this.runCommand<{ data: number }>('time query daytime');
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
    
    return res.data;
  }

  public async setTimeOfDay(time: number): Promise<void> {
    const res = await this.runCommand(`time set ${time}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async getWeather(): Promise<WeatherType> {
    const res = await this.runCommand<{ data: number }>('weather query');
    
    switch (res.data) {
      case 0: return WeatherType.Clear;
      case 1: return WeatherType.Rain;
      case 2: return WeatherType.Thunder;
      default: throw new Error('Unknown weather type: ' + res.data);
    }
  }

  /**
   * @param weatherType The type of weather to apply.
   * @param duration The duration of the weather (in ticks).
   */
  public async setWeather(weatherType: WeatherType, duration?: number): Promise<void> {
    const res = await this.runCommand(`weather ${weatherType} ${duration ?? ''}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async setBlock(location: Vector3, blockId: string, options?: SetBlockOptions) {
    const locationArg = `${location.x} ${location.y} ${location.z}`;
    const stateArg = options?.states
      ? '[' + Object.entries(options.states).map(([key, value]) => `"${key}"=${JSON.stringify(value)}`).join(',') + ']'
      : '[]';

    const res = await this.runCommand(
      `setblock ${locationArg} ${blockId} ${stateArg} ${options?.mode ?? ''}`,
      { version: "1.21.50" }
    );
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * @returns The number of blocks filled.
   */
  public async fillBlocks(from: Vector3, to: Vector3, blockId: string, options?: FillBlocksOptions): Promise<number>;
  public async fillBlocks(volume: IBlockVolume, blockId: string, options?: FillBlocksOptions): Promise<number>;
  public async fillBlocks(
    arg0: Vector3 | IBlockVolume,
    arg1: Vector3 | string,
    arg2?: string | FillBlocksOptions,
    arg3?: FillBlocksOptions
  ): Promise<number> {
    let from: Vector3;
    let to: Vector3;
    let blockId: string;
    let options: FillBlocksOptions;
    if ('x' in arg0) {
      from = arg0;
      to = arg1 as Vector3;
      blockId = arg2 as string;
      options = arg3;
    } else {
      from = arg0.from;
      to = arg0.to;
      blockId = arg1 as string;
      options = arg2 as FillBlocksOptions;
    }

    const fromArg = `${from.x} ${from.y} ${from.z}`;
    const toArg = `${to.x} ${to.y} ${to.z}`;
    const stateArg = options.states
      ? '[' + Object.entries(options.states).map(([key, value]) => `"${key}"=${JSON.stringify(value)}`).join(',') + ']'
      : '[]';

    const res = await this.runCommand<{ fillCount: number }>(
      `fill ${fromArg} ${toArg} ${blockId} ${stateArg} ${options.mode ?? ''}`,
      { version: "1.21.50" }
    );
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
    return res.fillCount;
  }

  /**
   * Disconnects this world.
   */
  public async disconnect() {
    await this.runCommand('closewebsocket', { noResponse: true });
  }

  public async enableEncryption(mode?: EncryptionMode) {
    if (this.connection.encryption.enabled) throw new Error('Encryption is already enabled');
    
    const exchanging = this.connection.encryption.beginKeyExchange();

    const packet = new EncryptionRequestPacket();
    packet.mode = mode ?? EncryptionMode.Aes256cfb8;
    packet.publicKey = exchanging.publicKey;
    packet.salt = exchanging.salt;

    this.send(packet);

    const response = await this.connection.awaitEncryptionResponse();

    exchanging.complete(packet.mode, response.publicKey);

    new EnableEncryptionSignal(this).emit();
  }
  
  private async updatePlayerList(isFirst = false) {
    try {
      const { players: newPlayers, max } = await this.getPlayerList();
      const joins = newPlayers.filter(rawName => !this.players.has(rawName))
      const leaves = [...this.players.keys()].filter(rawName => !newPlayers.includes(rawName));
      
      this._maxPlayers = max;

      for (const join of joins) {
        const player = this.resolvePlayer(join, true);
        if (!isFirst) new PlayerJoinSignal(this, player).emit();
      }

      for (const leave of leaves) {
        const player = this.resolvePlayer(leave); // Player should exist, no need to register
        new PlayerLeaveSignal(this, player).emit(); // isFirst always false here
        this.players.delete(leave);
      }
    } catch {}
  }

  private startInterval() {
    if (this.countInterval) return;
    void this.updatePlayerList(true);
    this.countInterval = setInterval(this.updatePlayerList.bind(this), this.server.options.listUpdateInterval);
  }
  
  private stopInterval() {
    if (this.countInterval) {
      clearInterval(this.countInterval);
      this.countInterval = null;
    }
  }

  public onConnect() {
    this.startInterval();
    this.getLocalPlayer().then(player => {
      this._localPlayer = player;

      new WorldInitializeSignal(this).emit();
    }).catch(() => console.error('Failed to get local player'));
  }

  public onDisconnect() {
    this.stopInterval();
    this.connection.clearPendingResponses();
    this._isValid = false;
  }

  /**
   * @param initialize If true, the player will be registered in the world.
   */
  public resolvePlayer(rawName: string, initialize = false): Player {
    let player = this.players.get(rawName);
    player ??= new Player(this, rawName);
    if (initialize) {
      this.players.set(rawName, player);
      player.load().catch(console.error);
    }
    return player;
  }

  public formatPlayerName(playerName: string) {
    return this.server.options.formatter.playerName?.(playerName) ?? playerName;
  }
}
