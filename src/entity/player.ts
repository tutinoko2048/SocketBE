import { PlayerLoadSignal } from '../events';
import { CommandStatusCode, GameMode, type AbilityType } from '../enums';
import { EntityQueryUtil } from './query';
import type { RawMessage, Vector3 } from '@minecraft/server';
import type { World } from '../world';
import type { EntityQueryOptions, GiveItemOptions, PlayerDetail, QueryTargetResult } from '../types';

export class Player {
  public readonly world: World;

  public readonly name: string;

  public readonly rawName: string;

  private _uniqueId: number = 0;

  private _uuid: string = '';

  private _deviceId: string = '';

  private _xuid?: string;

  private _isLoaded = false;

  public constructor(world: World, rawName: string) {
    this.world = world;
    this.rawName = rawName;

    this.name = this.world.formatPlayerName(rawName);
  }

  public get isValid() {
    return this.world.isValid && this.world.players.has(this.rawName);
  }
  
  public get isLoaded() {
    return this._isLoaded;
  }

  public get uniqueId() {
    return this._uniqueId;
  }

  public get uuid() {
    return this._uuid;
  }

  public get deviceId() {
    return this._deviceId;
  }

  /** Only defined on bedrock server */
  public get xuid() {
    return this._xuid;
  }

  public async sendMessage(message: string | RawMessage | (string | RawMessage)[]): Promise<void> {
    await this.world.sendMessage(message, this);
  }

  /**
   * Returns all tags that a player has.
   */
  public async getTags(): Promise<string[]> {
    const res = await this.world.runCommand(`tag "${this.rawName}" list`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);

    const tags = res.statusMessage.match(/§a.*?§r/g)
      .map(str => str.replace(/§a|§r/g, ''));
    return tags;
  }

  /**
   * Tests whether an player has a particular tag.
   */
  public async hasTag(tag: string): Promise<boolean> {
    const tags = await this.getTags();
    return tags.includes(tag);
  }

  public async getLocation(): Promise<Vector3> {
    const res = await this.query();
    return res.position;
  }

  public async query(): Promise<QueryTargetResult> {
    const res = await this.world.runCommand<{ details: string }>(`querytarget "${this.rawName}"`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);

    const detail: QueryTargetResult = JSON.parse(res.details)[0];
    return detail;
  }

  public async getPing(): Promise<number> {
    const detail = await this.getDetails();
    return detail.avgping;
  }

  public async getDetails(): Promise<PlayerDetail> {
    const { details } = await this.world.getPlayerDetail();
    const detail = details.find(d => d.name === this.rawName);
    if (!detail) throw new Error('Failed to get player detail');

    return detail;
  }

  public async getAbilities(): Promise<Record<AbilityType, boolean>> {
    const res = await this.world.runCommand<{ details: string }>(`ability "${this.rawName}"`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);

    const abilities: Record<AbilityType, boolean> = JSON.parse(res.details);
    return abilities;
  }

  public async updateAbility(ability: AbilityType, value: boolean): Promise<void> {
    const res = await this.world.runCommand(`ability "${this.rawName}" ${ability} ${value}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async getLevel(): Promise<number> {
    const res = await this.world.runCommand<{ level: number }>(`xp 0 "${this.rawName}"`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);

    return res.level;
  }

  public async addLevel(level: number): Promise<void> {
    const res = await this.world.runCommand(`xp ${level}L "${this.rawName}"`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async setGameMode(mode: GameMode): Promise<void> {
    const res = await this.world.runCommand(`gamemode ${mode} "${this.rawName}"`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async getGameMode(): Promise<GameMode> {
    const modes: GameMode[] = [
      GameMode.adventure,
      GameMode.survival,
      GameMode.creative,
      GameMode.spectator
    ];

    const promises = modes.map(gameMode =>
      new Promise<GameMode>((resolve, reject) => {
        this.matches({ gameMode })
          .then(match => (match ? resolve(gameMode) : reject()))
          .catch(reject);
      })
    );

    try {
      return await Promise.any(promises);
    } catch {
      throw new Error('Failed to get game mode');
    }
  }

  public async matches(options: EntityQueryOptions): Promise<boolean> {
    const selector = EntityQueryUtil.buildSelector('@a', {
      name: this.rawName,
      ...options
    });
    const res = await this.world.runCommand(`testfor ${selector}`);
    return res.statusCode === CommandStatusCode.Success;
  }

  public async giveItem(itemId: string, amount: number = 1, options?: GiveItemOptions) {
    const components: Record<string, any> = {};

    if (options?.canDestroy) {
      components['minecraft:can_destroy'] = { blocks: options.canDestroy };
    }

    if (options?.canPlaceOn) {
      components['minecraft:can_place_on'] = { blocks: options.canPlaceOn };
    }

    if (options?.lockMode) {
      components['minecraft:item_lock'] = { mode: options.lockMode };
    }

    if (options?.keepOnDeath) {
      components['minecraft:keep_on_death'] = {};
    }

    let commandString = `give "${this.rawName}" ${itemId} ${amount} ${options?.data ?? 0}`;
    if (Object.keys(components).length) commandString += ` ${JSON.stringify(components)}`;

    const res = await this.world.runCommand(commandString);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async load(): Promise<void> {
    const detail = await this.getDetails();

    this._uuid = detail.uuid;
    this._deviceId = detail.deviceSessionId;
    this._uniqueId = detail.id;
    this._xuid = detail.xuid;
    
    this._isLoaded = true;
    
    new PlayerLoadSignal(this.world, this).emit();
  }
}
