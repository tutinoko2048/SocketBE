import type { Player } from '../player';
import type { Scoreboard } from './scoreboard';

export class ScoreboardObjective {
  public readonly scoreboard: Scoreboard;

  /**
   * Identifier of the scoreboard objective.
   */
  public readonly id: string;

  /**
   * Returns the player-visible name of this scoreboard objective.
   */
  public readonly displayName: string;
  
  constructor(scoreboard: Scoreboard, objectiveId: string, displayName: string) {
    this.scoreboard = scoreboard;
    this.id = objectiveId;
    this.displayName = displayName;
  }
  
  /**
   * Returns a specific score for a player.
   */
  public async getScore(player: Player | string): Promise<number> {
    return await this.scoreboard.getScore(player, this);
  }
  
  /**
   * Sets a score for a player.
   */
  public async setScore(player: Player | string, score: number): Promise<number> {
    return await this.scoreboard.setScore(player, this, score);
  }

  /**
   * Adds a score for a player.
   */
  public async addScore(player: Player | string, score: number): Promise<number> {
    return await this.scoreboard.addScore(player, this, score);
  }
  
  /**
   * Removes a score for a player.
   */
  public async removeScore(player: Player | string, score: number): Promise<number> {
    return await this.scoreboard.removeScore(player, this, score);
  }
  
  /**
   * Removes a player from this scoreboard objective.
   */
  public async resetScore(player: Player | string): Promise<void> {
    await this.scoreboard.resetScore(player, this);
  }
  
  public toJSON() {
    return { id: this.id, displayName: this.displayName }
  }
}
