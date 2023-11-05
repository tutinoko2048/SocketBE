import { type World } from './World';
import { CommandResult, RawText } from '../types';

export class Player {
  public readonly world: World;
  public readonly nameTag: string;

  constructor(world: World, nameTag: string) {
    this.world = world;
    this.nameTag = nameTag;
  }
  
  public async runCommand(command: string): Promise<CommandResult> {
    return await this.world.runCommand(`execute as "${this.nameTag}" at @s ${command}`);
  }

  public async sendMessage(message: string | RawText): Promise<void> {
    await this.world.sendMessage(message, this.nameTag);
  }

  public async kill(): Promise<void> {
    await this.runCommand('kill @s');
  }

  public async getTags() {}
  public async hasTag() {}
  public async getPing() {}
  public async getDetail() {}
  public async getLocation() {}
  public async getDimension() {}
  public async getId() {}
  public async query() {}
}