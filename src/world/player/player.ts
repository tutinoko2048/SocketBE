import { PlayerLoadSignal } from '../../events';
import { CommandStatusCode, type AbilityType } from '../../enums';
import type { RawMessage, Vector3 } from '@minecraft/server';
import type { World } from '../world';
import type { PlayerDetail, QueryTargetResult } from '../../types';

export class Player {
  public readonly world: World;

  public readonly name: string;

  public readonly rawName: string;

  public readonly uniqueId: number = 0;

  public readonly uuid: string = '';

  public readonly deviceId: string = '';

  /** Only defined on bedrock server */
  public readonly xuid?: string;

  public isLoaded = false;

  public constructor(world: World, rawName: string) {
    this.world = world;
    this.rawName = rawName;

    this.name = this.world.formatPlayerName(rawName);
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

  public async load(): Promise<void> {
    const detail = await this.getDetails();
    // @ts-expect-error Assign uuid internally
    this.uuid = detail.uuid;

    // @ts-expect-error Assign deviceId internally
    this.deviceId = detail.deviceSessionId;

    // @ts-expect-error Assign uniqueId internally
    this.uniqueId = detail.id;

    // @ts-expect-error Assign xuid internally
    this.xuid = detail.xuid;

    this.isLoaded = true;
    new PlayerLoadSignal(this.world, this).emit();
  }
}
