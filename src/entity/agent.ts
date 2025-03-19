import type  { Vector3 } from '@minecraft/server';
import type { World } from '../world';
import { CommandStatusCode, type AgentDirection } from '../enums';

/**
 * Implemented all agent commands listed on the Minecraft Wiki.  
 * Note that some commands may not work in the latest version. Commands that have been confirmed to work have comments.
 * 
 * Reference: {@link https://minecraft.fandom.com/wiki/Commands/agent}
 */
export class Agent {
  public readonly world: World;

  public constructor(world: World) {
    this.world = world;
  }

  public get isValid() {
    return this.world.isValid;
  }

  /**
   * Move the agent in the specified direction
   */
  public async move(direction: AgentDirection): Promise<void> {
    const res = await this.world.runCommand(`agent move ${direction}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * Turn the agent in the specified direction
   */
  public async turn(turnDirection: AgentDirection.Left | AgentDirection.Right): Promise<void> {
    const res = await this.world.runCommand(`agent turn ${turnDirection}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * Attack towards the specified direction
   */
  public async attack(direction: AgentDirection): Promise<void> {
    const res = await this.world.runCommand(`agent attack ${direction}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }
  
  /**
   * Destroy a block in the specified direction
   */
  public async destroyBlock(direction: AgentDirection): Promise<void> {
    const res = await this.world.runCommand(`agent destroy ${direction}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * Drop an item in the specified direction
   * @param slot **one**-based index of the slot in the agent's inventory
   */
  public async dropItem(direction: AgentDirection, slot: number, amount: number = 1): Promise<void> {
    const res = await this.world.runCommand(`agent drop ${slot} ${amount} ${direction}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * Drop all items in the specified direction
   */
  public async dropAllItems(direction: AgentDirection): Promise<void> {
    const res = await this.world.runCommand(`agent dropall ${direction}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async inspect(direction: AgentDirection): Promise<void> {
    const res = await this.world.runCommand(`agent inspect ${direction}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async inspectData(direction: AgentDirection): Promise<void> {
    const res = await this.world.runCommand(`agent inspectdata ${direction}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async detect(direction: AgentDirection): Promise<void> {
    const res = await this.world.runCommand(`agent detect ${direction}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async detectRedstone(direction: AgentDirection): Promise<void> {
    const res = await this.world.runCommand(`agent detectredstone ${direction}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * Transfer items from one slot to another
   * @param fromSlot **one**-based index of the slot in the agent's inventory
   * @param toSlot **one**-based index of the slot in the agent's inventory
   */
  public async moveItem(fromSlot: number, toSlot: number, amount: number = 1): Promise<void> {
    const res = await this.world.runCommand(`agent transfer ${fromSlot} ${amount} ${toSlot}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * @param location If not provided, the agent will be teleported to the player's location
   */
  public async teleport(location?: Vector3): Promise<void> {
    const locationArg = location ? `${location.x} ${location.y} ${location.z}` : '';
    const res = await this.world.runCommand(`agent tp ${locationArg}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * Collect an specified item around the agent
   */
  public async collect(itemId: string): Promise<void> {
    const res = await this.world.runCommand(`agent collect ${itemId}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * Till the under block in the specified direction
   */
  public async till(direction: AgentDirection): Promise<void> {
    const res = await this.world.runCommand(`agent till ${direction}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * Place a block in the specified direction
   * @param slot **one**-based index of the slot in the agent's inventory
   */
  public async placeBlock(direction: AgentDirection, slot: number): Promise<void> {
    const res = await this.world.runCommand(`agent place ${slot} ${direction}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }
  
  /**
   * Set an item in the specified slot
   * @param slot **one**-based index of the slot in the agent's inventory
   */
  public async setItem(slot: number, itemId: string, amount: number = 1, data: number = 0): Promise<void> {
    const res = await this.world.runCommand(`agent setitem ${slot} ${itemId} ${amount} ${data}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async getItemCount(slot: number): Promise<void> {
    // Sadly this command does not return any data
    const res = await this.world.runCommand(`agent getitemcount ${slot}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async getItemSpace(slot: number): Promise<void> {
    // Sadly this command does not return any data
    const res = await this.world.runCommand(`agent getitemspace ${slot}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async getItemDetail(slot: number): Promise<void> {
    // Sadly this command does not return any data
    const res = await this.world.runCommand(`agent getitemdetail ${slot}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * Get the agent's current location
   */
  public async getLocation(): Promise<Vector3> {
    const res = await this.world.runCommand<{ position: Vector3 }>('agent getposition');
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
    return res.position;
  }
}