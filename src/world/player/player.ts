import type { RawText } from '@minecraft/server';
import type { World } from '../world';

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
}
