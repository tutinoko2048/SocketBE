import type { World } from '../structures/World';

export class ScoreboardObjective {
  /** World instance that this objective belongs to. */
  public readonly world: World;

  /** Identifier of the scoreboard objective. */
  public readonly id: string;

  /** Returns the player-visible name of this scoreboard objective. */
  public readonly displayName: string;
    
  constructor(world: World, objectiveId: string, displayName: string = '') {
    this.world = world;
    this.id = objectiveId;
    this.displayName = displayName;
  }
    
  /**
   * Returns a specific score for a player.
   * @param player Name of the player to retrieve a score for.
   */
  async getScore(player: string): Promise<number | undefined> {
    return await this.world.scoreboards.getScore(player, this.id);
  }
  
  /**
   * Sets a score for a player.
   * @param player Name of the player.
   * @param score New value of the score.
   * @returns {Promise<?number>} New value of the score, returns null if failed to set the score.
   */
  async setScore(player: string, score: number): Promise<number |undefined> {
    return await this.world.scoreboards.setScore(player, this.id, score);
  }

  /**
   * Adds a score for a player.
   * @param player Name of the player.
   * @param score Amount of score to add.
   * @returns New value of the score, returns null if failed to add the score.
   */
  async addScore(player: string, score: number): Promise<number | undefined> {
    return await this.world.scoreboards.addScore(player, this.id, score);
  }
    
  /**
   * Removes a player from this scoreboard objective.
   * @param player Name of the player.
   * @returns Whether successful to reset score of player.
   */
  async resetScore(player: string): Promise<boolean> {
    return await this.world.scoreboards.resetScore(player, this.id);
  }
  
  toJSON() {
    return { id: this.id, displayName: this.displayName }
  }
}
