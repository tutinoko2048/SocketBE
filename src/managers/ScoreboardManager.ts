import { ScoreboardObjective } from '../structures/ScoreboardObjective';
import type { World } from '../structures/World';

export enum ObjectiveSortOrder {
  Ascending = 'ascending',
  Descending = 'descending'
}

export enum DisplaySlotId {
  BelowName = 'belowname',
  List = 'list',
  Sidebar = 'sidebar'
}

export class ScoreboardManager {
  /** World instance that this manager belongs to. */
  public readonly world: World;

  constructor(world: World) {
    this.world = world;
    
    this.world.logger.debug('ScoreboardManager: Initialized');
  }
    
  /**
   * Returns all defined objectives.
   */
  async getObjectives(): Promise<ScoreboardObjective[]> {
    const res = await this.world.runCommand('scoreboard objectives list');
    const objectives = (res.statusMessage as string).split('\n').slice(1).map(entry => {
      const [ id, displayName ] = [...entry.matchAll(/- (.*):.*?'(.*?)'.*/g)][0].slice(1,3);
      return new ScoreboardObjective(this.world, id, displayName);
    });
    
    return objectives;
  }
  
  /**
   * Returns a specific objective (by id).
   */
  async getObjective(objectiveId: string): Promise<ScoreboardObjective | undefined> {
    const res = await this.getObjectives();
    return res.find(objective => objective.id === objectiveId); 
  }
  
  /**
   * Adds a new objective to the scoreboard.
   */
  async addObjective(objectiveId: string, displayName: string = ''): Promise<ScoreboardObjective | undefined> {
    if (await this.getObjective(objectiveId)) return null;
    const res = await this.world.runCommand(`scoreboard objectives add "${objectiveId}" dummy "${displayName}"`);
    if (res.statusCode !== 0) return null;
    return new ScoreboardObjective(this.world, objectiveId, displayName);
  }
  
  /**
   * Removes an objective from the scoreboard.
   * @param objectiveId Objective to remove from scoreboard.
   * @returns Whether successful to remove objective.
   */
  async removeObjective(objectiveId: string | ScoreboardObjective): Promise<boolean> {
    const objective = ScoreboardManager.resolveObjective(objectiveId);
    if (!(await this.getObjective(objective))) return false;
    const res = await this.world.runCommand(`scoreboard objectives remove ${objective}`);
    return res.statusCode === 0;
  }

  /**
   * Returns all of scores that player has.
   * @param player Player to retrieve the score for.
   * @returns Score values.
   */
  async getScores(player: string): Promise<Record<string, number | undefined>> {
    const res = await this.world.runCommand(`scoreboard players list "${player}"`);
    try {
      return Object.fromEntries(
        [...res.statusMessage.matchAll(/: (\d*) \((.*?)\)/g)]
          .map(data => [data[2], Number(data[1])])
      )
    } catch {
      return {};
    }
  }
  
  /**
   * Returns a score given a player and objective.
   * @param player Name of the player to retrieve the score for.
   * @param objectiveId Objective to retrieve the score for.
   * @returns Score value.
   */
  async getScore(player: string, objectiveId: string | ScoreboardObjective): Promise<number | undefined> {
    const objective = ScoreboardManager.resolveObjective(objectiveId);
    const res = await this.getScores(player);
    return res[objective];
  }
  
  /**
   * Sets the score given a player and objective.
   * @param player Name of the player.
   * @param objectiveId Objective to apply the score to.
   * @param score New value of the score.
   * @returns New value of the score, returns null if failed to set the score.
   */
  async setScore(player: string, objectiveId: string | ScoreboardObjective, score: number): Promise<number | undefined> {
    const objective = ScoreboardManager.resolveObjective(objectiveId);
    const res = await this.world.runCommand(`scoreboard players set "${player}" "${objective}" ${score}`);
    return res.statusCode === 0 ? score : null;
  }
  
  /**
   * Adds the score given a player and objective.
   * @param player Name of the player.
   * @param objectiveId Objective to apply the score to.
   * @param score The amount of score to add.
   * @returns New value of the score, returns null if failed to add the score.
   */
  async addScore(player: string, objectiveId: string | ScoreboardObjective, score: number): Promise<number | undefined> {
    let res = await this.getScore(player, objectiveId);
    if (isNaN(res)) return null;
    const value = res += score;
    return await this.setScore(player, objectiveId, value);
  }
  
  /**
   * Removes a player from an objective.
   * @param player Name of the player.
   * @param objectiveId Objective that player is removed from.
   * @returns Whether successful to reset score of player.
   */
  async resetScore(player: string, objectiveId: ScoreboardObjective | string = ''): Promise<boolean> {
    const objective = ScoreboardManager.resolveObjective(objectiveId);
    const res = await this.world.runCommand(`scoreboard players reset "${player}" "${objective}"`);
    return res.statusCode === 0;
  }
  
  /**
   * Sets an objective into a display slot with specified additional display settings.
   */
  async setDisplay(displaySlotId: DisplaySlotId, objectiveId?: string | ScoreboardObjective, sortOrder?: ObjectiveSortOrder) {
    let commandString = `scoreboard objectives setdisplay ${displaySlotId}`;
    if (objectiveId) commandString += ` "${ScoreboardManager.resolveObjective(objectiveId)}"`;
    if (sortOrder) commandString += ` ${sortOrder}`;
    const res = await this.world.runCommand(commandString);
    return res.statusCode === 0;
  }
  
  /**
   * Returns an objective id.
   * @param objective Objective or its id to resolve.
   * @returns objectiveId The id of the objective.
   */
  static resolveObjective(objective: string | ScoreboardObjective): string {
    return typeof objective === 'string' ? objective : objective.id;
  }
}