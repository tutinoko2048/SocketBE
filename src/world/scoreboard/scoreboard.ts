import { Player } from '../entity';
import { ScoreboardObjective } from './objective';
import { CommandStatusCode, type DisplaySlotId, type ObjectiveSortOrder } from '../../enums';
import type { World } from '../world';

export class Scoreboard {
  public readonly world: World;

  public readonly objectives = new Map<string, ScoreboardObjective>();

  constructor(world: World) {
    this.world = world;
  }
  
  /**
   * Returns all defined objectives.
   */
  public async getObjectives(): Promise<ScoreboardObjective[]> {
    const res = await this.world.runCommand('scoreboard objectives list');
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);

    const objectives = res.statusMessage.split('\n').slice(1).map(entry => {
      const [ id, displayName ] = [...entry.matchAll(/- (.*):.*?'(.*?)'.*/g)][0].slice(1,3);
      let objective = this.objectives.get(id);
      if (objective) {
        // @ts-expect-error overwrite displayName internally
        objective.displayName = displayName;
      } else {
        objective = new ScoreboardObjective(this, id, displayName);
      }
      this.objectives.set(id, objective);
      return objective;
    });
    
    return objectives;
  }
  
  /**
   * Returns a specific objective (by id).
   */
  public async getObjective(objectiveId: string): Promise<ScoreboardObjective | undefined> {
    const res = await this.getObjectives();
    return res.find(objective => objective.id === objectiveId);
  }
  
  /**
   * Adds a new objective to the scoreboard.
   */
  public async addObjective(objectiveId: string, displayName?: string): Promise<ScoreboardObjective | null> {
    let commandString = `scoreboard objectives add "${objectiveId}" dummy`;
    if (displayName) commandString += ` "${displayName}"`;

    const res = await this.world.runCommand(commandString);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);

    const objective = new ScoreboardObjective(this, objectiveId, displayName ?? objectiveId);
    this.objectives.set(objectiveId, objective);

    return objective;
  }
  
  /**
   * Removes an objective from the scoreboard.
   */
  public async removeObjective(objective: ScoreboardObjective | string): Promise<boolean> {
    const objectiveId = objective instanceof ScoreboardObjective ? objective.id : objective;

    const res = await this.world.runCommand(`scoreboard objectives remove "${objectiveId}"`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);

    this.objectives.delete(objectiveId);

    return true;
  }

  /**
   * Returns all of scores that player has.
   * @returns Score values.
   */
  public async getScores(player: Player | string): Promise<Record<string, number | null>> {
    const playerName = player instanceof Player ? player.rawName : player;
    
    const res = await this.world.runCommand(`scoreboard players list "${playerName}"`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);

    try {
      return Object.fromEntries(
        [...res.statusMessage.matchAll(/: (-*\d*) \((.*?)\)/g)]
          .map(data => [data[2], data ? Number(data[1]) : null])
      );
    } catch {
      return {};
    }
  }
  
  /**
   * Returns a score given a player and objective.
   */
  public async getScore(player: Player | string, objective: ScoreboardObjective | string): Promise<number | null> {
    const scores = await this.getScores(player);
    const objectiveId = objective instanceof ScoreboardObjective ? objective.id : objective;
    return scores[objectiveId];
  }
  
  /**
   * Sets the score given a player and objective.
   * @returns New value of the score.
   */
  public async setScore(player: Player | string, objective: ScoreboardObjective | string, score: number): Promise<number> {
    const playerName = player instanceof Player ? player.rawName : player;
    const objectiveId = objective instanceof ScoreboardObjective ? objective.id : objective;

    const res = await this.world.runCommand(`scoreboard players set "${playerName}" "${objectiveId}" ${score}`);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
    
    return score;
  }
  
  /**
   * Adds the score given a player and objective.
   * @returns New value of the score.
   */
  public async addScore(player: Player | string, objective: ScoreboardObjective | string, score: number): Promise<number> {
    const current = await this.getScore(player, objective) ?? 0;
    return await this.setScore(player, objective, current + score);
  }
  
  /**
   * Removes the score given a player and objective.
   * @returns New value of the score.
   */
  public async removeScore(player: Player | string, objective: ScoreboardObjective | string, score: number): Promise<number> {
    const current = await this.getScore(player, objective) ?? 0;
    return await this.setScore(player, objective, current - score);
  }
  
  /**
   * Removes a player from an objective.
   */
  public async resetScore(player: Player | string, objective: ScoreboardObjective | string = ''): Promise<void> {
    const playerName = player instanceof Player ? player.rawName : player;
    const objectiveId = objective instanceof ScoreboardObjective ? objective.id : objective;

    let commandString = `scoreboard players reset "${playerName}"`;
    if (objectiveId) commandString += ` "${objectiveId}"`;
    
    const res = await this.world.runCommand(commandString);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }
  
  /**
   * Sets an objective into a display slot with specified additional display settings.
   */
  public async setDisplay(
    displaySlotId: DisplaySlotId,
    objective?: ScoreboardObjective | string,
    sortOrder?: ObjectiveSortOrder
  ): Promise<void> {
    let commandString = `scoreboard objectives setdisplay ${displaySlotId}`;
    if (objective) commandString += ` "${objective instanceof ScoreboardObjective ? objective.id : objective}"`;
    if (sortOrder) commandString += ` ${sortOrder}`;

    const res = await this.world.runCommand(commandString);
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }
}
