import type { RawText, Vector3 } from '@minecraft/server';
import type { World } from '../world';
import type { QueryTargetResult } from '../../types';

export class Player {
  public readonly world: World;

  public readonly name: string;

  public readonly rawName: string;

  public constructor(world: World, rawName: string) {
    this.world = world;
    this.rawName = rawName;

    this.name = this.world.formatPlayerName(rawName);
  }

  public async sendMessage(message: string | RawText): Promise<void> {
    await this.world.sendMessage(message, this);
  }

  /**
   * Returns all tags that a player has.
   */
  public async getTags(): Promise<string[]> {
    const res = await this.world.runCommand(`tag "${this.rawName}" list`);
    if (res.statusCode !== 0) throw new Error(res.statusMessage);

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
    if (res.statusCode !== 0) throw new Error(res.statusMessage);

    const detail: QueryTargetResult = JSON.parse(res.details)[0];
    return detail;
  }
}
