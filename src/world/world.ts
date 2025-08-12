import { Scoreboard } from './scoreboard';
import { CommandRequestPacket, CommandResponsePacket, DataRequestPacket, EncryptionRequestPacket, type DataResponsePacket } from '../network';
import { EnableEncryptionSignal, PlayerJoinSignal, PlayerLeaveSignal, WorldInitializeSignal } from '../events';
import { Agent, EntityQueryUtil, Player } from '../entity';
import { CommandStatusCode, EncryptionMode, FillBlocksMode, MessagePurpose, MinecraftCommandVersion, WeatherType } from '../enums';
import { jsonParseFixed, RawTextUtil } from '../world';
import { serializeStates } from '../block';
import type { RawMessage, Vector3 } from '@minecraft/server';
import type { Server } from '../server';
import type {
  PlayerList,
  PlayerDetail,
  PlayerListDetail,
  TopSolidBlockResult,
  CommandOptions,
  EntityQueryOptions,
  SetBlockOptions,
  IBlockVolume,
  FillBlocksOptions,
  NetworkSendOptions,
  BlockQueryResult,
  ItemQueryResult,
  MobQueryResult,
} from '../types';
import type { BasePacket, Connection, EncryptionResponsePacket } from '../network';
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

  private agent: Agent | null = null;
  
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

  public send(packet: BasePacket, options?: NetworkSendOptions): IHeader | undefined {
    return this.server.network.send(this.connection, packet, options);
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
    packet.version = options?.version ?? this.server.options.commandVersion!;
    packet.commandLine = command;

    const header = this.send(packet);
    if (!header) throw new Error('Packet transmission canceled');

    if (options?.noResponse) return CommandResponsePacket.createEmptyResult<R>();

    const response = await this.connection.awaitResponse<CommandResponsePacket>(header.requestId, options?.timeout);
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
    const details: PlayerDetail[] = jsonParseFixed(res.details.match(/\{.*\}/g)[0]).result;
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
  public async getTopSolidBlock(location?: Vector3): Promise<TopSolidBlockResult> {
    const locationArg = location ? `${location.x} ${location.y} ${location.z}` : '~ ~ ~';
    const res = await this.runCommand<{ blockName: string, position: Vector3 }>(`gettopsolidblock ${locationArg}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);

    return { blockName: res.blockName, location: res.position };
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
    const stateArg = options?.states ? serializeStates(options.states) : '';

    const res = await this.runCommand(
      `setblock ${locationArg} ${blockId} ${stateArg} ${options?.mode ?? ''}`,
      { version: MinecraftCommandVersion.LocateStructureOutput }
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
    arg3: FillBlocksOptions = {}
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
    const stateArg = options.states ? serializeStates(options.states) : '';
    let modeArg: string;
    if (options.mode === FillBlocksMode.Replace) {
      const { replaceBlock } = options;
      if (!replaceBlock?.type) throw new Error('replaceBlock.type is required in replace mode');
      modeArg = `replace ${replaceBlock.type} ${replaceBlock.states ? serializeStates(replaceBlock.states) : ''}`;
    } else {
      modeArg = options.mode ?? '';
    }

    const res = await this.runCommand<{ fillCount: number }>(
      `fill ${fromArg} ${toArg} ${blockId} ${stateArg} ${modeArg}`,
      { version: MinecraftCommandVersion.LocateStructureOutput }
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
    
    const exchange = this.connection.encryption.beginKeyExchange();

    const packet = new EncryptionRequestPacket();
    packet.mode = mode ?? EncryptionMode.Aes256cfb8;
    packet.publicKey = exchange.publicKey;
    packet.salt = exchange.salt;

    const header = this.send(packet);
    if (!header) throw new Error('Packet transmission canceled');

    const response = await this.connection.awaitResponse<EncryptionResponsePacket>(header.requestId);
    exchange.complete(packet.mode, response.publicKey);

    new EnableEncryptionSignal(this).emit();
  }

  public async queryData(type: 'block'): Promise<BlockQueryResult[]>;
  public async queryData(type: 'item'): Promise<ItemQueryResult[]>;
  public async queryData(type: 'mob'): Promise<MobQueryResult[]>;
  public async queryData(type: 'block' | 'item' | 'mob'): Promise<BlockQueryResult[] | ItemQueryResult[] | MobQueryResult[]> {
    const packet = new DataRequestPacket();

    let purpose: MessagePurpose;
    switch (type) {
      case 'block': purpose = MessagePurpose.BlockDataRequest; break;
      case 'item': purpose = MessagePurpose.ItemDataRequest; break;
      case 'mob': purpose = MessagePurpose.MobDataRequest; break;
      default: throw new Error('Invalid data type');
    }

    const header = this.send(packet, { overrideMessagePurpose: purpose });
    if (!header) throw new Error('Packet transmission canceled');

    const res = await this.connection.awaitResponse<DataResponsePacket>(header.requestId);
    return res.data;
  }

  public async getOrCreateAgent(): Promise<Agent> {
    if (this.agent) return this.agent;
    const res = await this.runCommand('agent create');
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
    return new Agent(this);
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
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
    return this.server.options.formatter!.playerName?.(playerName) ?? playerName;
  }
}
