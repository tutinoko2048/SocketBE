import type { DisplaySlotId, ObjectiveSortOrder } from '../../enums';
import type { World } from '../world';
import { ScoreboardObjective } from './objective';

export class Scoreboard {
  /**
   * World instance that this manager belongs to.
   */
  public readonly world: World;

  constructor(world: World) {
    this.world = world;
  }
  
  /**
   * Returns all defined objectives.
   */
  public async getObjectives(): Promise<ScoreboardObjective[]> {
    const res = await this.world.runCommand('scoreboard objectives list');
    const objectives = res.statusMessage.split('\n').slice(1).map(entry => {
      const [ id, displayName ] = [...entry.matchAll(/- (.*):.*?'(.*?)'.*/g)][0].slice(1,3);
      return new ScoreboardObjective(this.world, id, displayName);
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
  public async addObjective(objectiveId: string, displayName = ''): Promise<ScoreboardObjective | null> {
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
  public async removeObjective(objectiveId: string | ScoreboardObjective): Promise<boolean> {
    const objective = Scoreboard.resolveObjective(objectiveId);
    if (!(await this.getObjective(objective))) return false;
    const res = await this.world.runCommand(`scoreboard objectives remove ${objective}`);
    return res.statusCode === 0;
  }

  /**
   * Returns all of scores that player has.
   * @param player Player to retrieve the score for.
   * @returns Score values.
   */
  public async getScores(player: string): Promise<Record<string, number | null>> {
    const res = await this.world.runCommand(`scoreboard players list "${player}"`);
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
   * @param player Name of the player to retrieve the score for.
   * @param objectiveId Objective to retrieve the score for.
   * @returns Score value.
   */
  public async getScore(player: string, objectiveId: string | ScoreboardObjective): Promise<number | null> {
    const objective = Scoreboard.resolveObjective(objectiveId);
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
  public async setScore(player: string, objectiveId: string | ScoreboardObjective, score: number): Promise<number | null> {
    const objective = Scoreboard.resolveObjective(objectiveId);
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
  public async addScore(player: string, objectiveId: string | ScoreboardObjective, score: number): Promise<number | null> {
    let res = await this.getScore(player, objectiveId);
    if (isNaN(res)) return null;
    const value = res += score;
    return await this.setScore(player, objectiveId, value);
  }
  
  /**
   * Removes the score given a player and objective.
   * @param player Name of the player.
   * @param objectiveId Objective to apply the score to.
   * @param score The amount of score to remove.
   * @returns New value of the score, returns null if failed to remove the score.
   */
  public async removeScore(player: string, objectiveId: string | ScoreboardObjective, score: number) {
    let res = await this.getScore(player, objectiveId);
    if (isNaN(res)) return null;
    const value = res -= score;
    return await this.setScore(player, objectiveId, value);
  }
  
  /**
   * Removes a player from an objective.
   * @param player Name of the player.
   * @param objectiveId Objective that player is removed from.
   * @returns Whether successful to reset score of player.
   */
  public async resetScore(player: string, objectiveId: string | ScoreboardObjective = ''): Promise<boolean> {
    const objective = Scoreboard.resolveObjective(objectiveId);
    const res = await this.world.runCommand(`scoreboard players reset "${player}" "${objective}"`);
    return res.statusCode === 0;
  }
  
  /**
   * Sets an objective into a display slot with specified additional display settings.
   */
  public async setDisplay(displaySlotId: DisplaySlotId, objectiveId?: string | ScoreboardObjective, sortOrder?: ObjectiveSortOrder): Promise<boolean> {
    let commandString = `scoreboard objectives setdisplay ${displaySlotId}`;
    if (objectiveId) commandString += ` "${Scoreboard.resolveObjective(objectiveId)}"`;
    if (sortOrder) commandString += ` ${sortOrder}`;
    const res = await this.world.runCommand(commandString);
    return res.statusCode === 0;
  }
  
  /**
   * Returns an objective id.
   * @param  objective Objective or its id to resolve.
   * @returns objectiveId The id of the objective.
   */
  public static resolveObjective(objective: string | ScoreboardObjective): string {
    return typeof objective === 'string' ? objective : objective.id;
  }
}
