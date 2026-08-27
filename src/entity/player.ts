import { PlayerLoadSignal } from '../events';
import { CommandStatusCode, GameMode, MinecraftCommandVersion, type AbilityType } from '../enums';
import { EntityQueryUtil } from './query';
import { ScreenDisplay } from './screen-display';
import type { RawMessage, Vector3 } from '@minecraft/server';
import type { World } from '../world';
import type { EntityQueryOptions, GiveItemOptions, PlayerDetail, PlayerExperience, QueryTargetResult } from '../types';

export class Player {
  public readonly world: World;

  public readonly onScreenDisplay: ScreenDisplay;

  public readonly name: string;

  public readonly rawName: string;

  private _uniqueId: number = 0;

  private _uuid: string = '';

  private _deviceId: string = '';

  private _xuid?: string;

  private _isLoaded = false;

  public constructor(world: World, rawName: string) {
    this.onScreenDisplay = new ScreenDisplay(this);
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

  public get isLocalPlayer() {
    return this.world.localPlayer === this;
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

    // When the player has no tags, the response contains no §a...§r segments and match() returns null
    const tags = (res.statusMessage.match(/§a.*?§r/g) ?? [])
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

  /**
   * @deprecated
   * ⚠️ Temporarily disabled due to a known Minecraft bug.  
   * Calling this in multiplayer may crash the world.
   *
   * Returns the average ping of the player.
   */
  public async getPing(): Promise<never> {
    return Promise.reject(
      new Error('Player.getPing is temporarily disabled because it may crash Minecraft world in multiplayer.')
    );
    // const detail = await this.getDetails();
    // return detail.avgping;
  }

  /**
   * @deprecated
   * ⚠️ Temporarily disabled due to a known Minecraft bug.  
   * Calling this in multiplayer may crash the world.
   *
   * Returns detailed information about the player.
   */
  public async getDetails(): Promise<never> {
    return Promise.reject(
      new Error('Player.getDetails is temporarily disabled because it may crash Minecraft world in multiplayer.')
    );
    // const { details } = await this.world.getPlayerDetail();
    // const detail = details.find(d => d.name === this.rawName);
    // if (!detail) throw new Error('Failed to get player detail');

    // return detail;
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
    return (await this.getExperience()).level;
  }

  /**
   * Returns the player's level together with their progress into it.
   *
   * @remarks
   * Reads through `xp 0`, which awards nothing and reports back. That response carries
   * `amount` alongside `level`, and {@link getLevel} throws the former away - progress
   * within a level is only available here.
   */
  public async getExperience(): Promise<PlayerExperience> {
    const res = await this.world.runCommand<{ level: number, amount: number }>(`xp 0 "${this.rawName}"`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);

    return { level: res.level, amount: res.amount };
  }

  /**
   * @returns The level and progress after the change, as the command reports them.
   */
  public async addLevel(level: number): Promise<PlayerExperience> {
    const res = await this.world.runCommand<{ level: number, amount: number }>(`xp ${level}L "${this.rawName}"`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);

    return { level: res.level, amount: res.amount };
  }

  /**
   * Counts how many of an item the player is carrying.
   *
   * @remarks
   * There is no dedicated query for this. `clear` with a maximum count of 0 removes
   * nothing and reports what it would have cleared, which is the closest thing Bedrock
   * offers. Carrying none of the item is not an error here: the command answers with a
   * failure status in that case, and this returns 0.
   *
   * @param itemId Item identifier, with or without the `minecraft:` namespace.
   * @param data Data value to match, or -1 for any.
   */
  public async getItemCount(itemId: string, data = 0): Promise<number> {
    const res = await this.world.runCommand<{ playerTest: string[] }>(
      `clear "${this.rawName}" ${itemId} ${data} 0`
    );
    if (res.statusCode < CommandStatusCode.Success) return 0;

    // The count is only ever reported inside a string, as `Name (12)`.
    const total = (res.playerTest ?? []).reduce((sum, entry) => {
      const match = /\((\d+)\)\s*$/.exec(entry);
      return sum + (match ? Number(match[1]) : 0);
    }, 0);
    return total;
  }

  public async setGameMode(mode?: GameMode): Promise<void> {
    const res = await this.world.runCommand(`gamemode ${mode?.toLowerCase() ?? 'default'} "${this.rawName}"`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async getGameMode(): Promise<GameMode> {
    const modes: GameMode[] = [
      GameMode.Adventure,
      GameMode.Survival,
      GameMode.Creative,
      GameMode.Spectator
    ];

    // Query all gamemodes in parallel
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

    const res = await this.world.runCommand(
      commandString,
      { version: MinecraftCommandVersion.LocateStructureOutput }
    );
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * @deprecated
   * ⚠️ Temporarily disabled due to a known Minecraft bug.  
   * Calling this in multiplayer may crash the world.
   *
   * Loads detailed information about the player.
   */
  public async load(): Promise<never> {
    return Promise.reject(
      new Error('Player.load is temporarily disabled because it may crash Minecraft world in multiplayer.')
    );
    // const detail = await this.getDetails();

    // this._uuid = detail.uuid;
    // this._deviceId = detail.deviceSessionId;
    // this._uniqueId = detail.id;
    // this._xuid = detail.xuid;
    
    // this._isLoaded = true;
    
    // new PlayerLoadSignal(this.world, this).emit();
  }
}
