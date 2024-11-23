import type { World } from '../world';

export class ScoreboardObjective {
  public readonly world: World;

  /**
   * Identifier of the scoreboard objective.
   */
  public readonly id: string;

  /**
   * Returns the player-visible name of this scoreboard objective.
   */
  public readonly displayName?: string;
  
  constructor(world: World, objectiveId: string, displayName = '') {
    this.world = world;
    this.id = objectiveId;
    this.displayName = displayName;
  }
  
  /**
   * Returns a specific score for a player.
   * @param player Name of the player to retrieve a score for.
   */
  public async getScore(player: string): Promise<number | null> {
    return await this.world.scoreboard.getScore(player, this.id);
  }
  
  /**
   * Sets a score for a player.
   * @param player Name of the player.
   * @param score New value of the score.
   * @returns New value of the score, returns null if failed to set the score.
   */
  public async setScore(player: string, score: number): Promise<number | null> {
    return await this.world.scoreboard.setScore(player, this.id, score);
  }

  /**
   * Adds a score for a player.
   * @param player Name of the player.
   * @param score Amount of score to add.
   * @returns New value of the score, returns null if failed to add the score.
   */
  public async addScore(player: string, score: number): Promise<number | null> {
    return await this.world.scoreboard.addScore(player, this.id, score);
  }
  
  /**
   * Removes a score for a player.
   * @param player Name of the player.
   * @param score Amount of score to remove.
   * @returns New value of the score, returns null if failed to remove the score.
   */
  public async removeScore(player: string, score: number): Promise<number | null> {
    return await this.world.scoreboard.removeScore(player, this.id, score);
  }
  
  /**
   * Removes a player from this scoreboard objective.
   * @param player Name of the player.
   * @returns Whether successful to reset score of player.
   */
  public async resetScore(player: string): Promise<boolean> {
    return await this.world.scoreboard.resetScore(player, this.id);
  }
  
  public toJSON() {
    return { id: this.id, displayName: this.displayName }
  }
}
