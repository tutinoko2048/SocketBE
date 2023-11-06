import { type World } from './World';
import { CommandResult, PlayerInfo, QueryResult, RawText, Vector3 } from '../types';

export class Player {
  public readonly world: World;
  public readonly rawName: string;
  public readonly name: string;

  constructor(world: World, rawName: string) {
    this.world = world;
    this.rawName = rawName;
    this.name = this.world.server.options.formatter.playerName?.(rawName) ?? rawName;
  }
  
  public async runCommand(command: string): Promise<CommandResult> {
    return await this.world.runCommand(`execute as "${this.rawName}" at @s ${command}`);
  }

  public async sendMessage(message: string | RawText): Promise<void> {
    await this.world.sendMessage(message, this.rawName);
  }

  public async kill(): Promise<void> {
    await this.runCommand('kill @s');
  }

  /**
   * Returns all tags that a player has.
   */
  public async getTags(): Promise<string[]> {
    const res = await this.world.runCommand(`tag "${this.rawName}" list`);
    return res.statusMessage.match(/§a.*?§r/g).map((str) => str.replace(/§a|§r/g, ''));
  }

  /**
   * Tests whether an player has a particular tag.
   */
  public async hasTag(tag: string): Promise<boolean> {
    const tags = await this.getTags();
    return tags.includes(tag);
  }

  public async kick(reason?: string): Promise<boolean> {
    const res = await this.world.runCommand(`kick "${this.rawName}" ${reason ?? ''}`);
    return res.statusCode === 0;
  }

  public async getPing(): Promise<number | undefined> {
    const playerInfo = await this.getDetail();
    return playerInfo?.ping;
  }

  public async getDetail(): Promise<PlayerInfo | undefined> {
    const { details } = await this.world.getPlayerDetail();
    const playerInfo = details.find(d => d.name === this.rawName);
    return playerInfo;
  }

  public async getLocation(): Promise<Vector3 | undefined> {
    const res = await this.query();
    return res?.position;
  }

  public async getDimension(): Promise<number | undefined> {
    const res = await this.query();
    return res?.dimension;
  }

  public async getId(): Promise<number | undefined> {
    const playerInfo = await this.getDetail();
    return playerInfo?.id;
  }

  public async query(): Promise<QueryResult | undefined> {
    const res = await this.runCommand(`querytarget "${this.rawName}"`);
    if (!res.details) return;
    try {
      return JSON.parse(res.details)[0] as QueryResult;
    } catch {
      return;
    }
  }

  public isValid(): boolean {
    return this.world.players.has(this);
  }
}