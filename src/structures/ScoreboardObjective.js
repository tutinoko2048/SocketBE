// @ts-check

class ScoreboardObjective {
  /**
   * @type {import('./World')}
   */
  #world;

  /**
   * @type {string} #id
   */
  #id;
  
  /**
   * @type {string|undefined} #displayName
   */
  #displayName;
  
  /**
   *
   * @param {import('./World')} world
   * @param {string} objectiveId
   * @param {string} [displayName='']
   */
  constructor(world, objectiveId, displayName = '') {
    this.#world = world;
    this.#id = objectiveId;
    this.#displayName = displayName;
  }
  
  /**
   * World instance that this objective belongs to.
   * @type {import('./World')}
   */
  get world() {
    return this.#world;
  }
  
  /**
   * Identifier of the scoreboard objective.
   * @type {string}
   */
  get id() {
    return this.#id;
  }
  
  /**
   * Returns the player-visible name of this scoreboard objective.
   * @type {string|undefined}
   */
  get displayName() {
    return this.#displayName;
  }
  
  /**
   * Returns a specific score for a player.
   * @param {string} player Name of the player to retrieve a score for.
   * @returns {Promise<?number>}
   */
  async getScore(player) {
    return await this.world.scoreboards.getScore(player, this.id);
  }
  
  /**
   * Sets a score for a player.
   * @param {string} player Name of the player.
   * @param {number} score New value of the score.
   * @returns {Promise<?number>} New value of the score, returns null if failed to set the score.
   */
  async setScore(player, score) {
    return await this.world.scoreboards.setScore(player, this.id, score);
  }

  /**
   * Adds a score for a player.
   * @param {string} player Name of the player.
   * @param {number} score Amount of score to add.
   * @returns {Promise<?number>} New value of the score, returns null if failed to add the score.
   */
  async addScore(player, score) {
    return await this.world.scoreboards.addScore(player, this.id, score);
  }
  
  /**
   * Removes a score for a player.
   * @param {string} player Name of the player.
   * @param {number} score Amount of score to remove.
   * @returns {Promise<?number>} New value of the score, returns null if failed to remove the score.
   */
  async removeScore(player, score) {
    return await this.world.scoreboards.removeScore(player, this.id, score);
  }
  
  /**
   * Removes a player from this scoreboard objective.
   * @param {string} player Name of the player.
   * @returns {Promise<boolean>} Whether successful to reset score of player.
   */
  async resetScore(player) {
    return await this.world.scoreboards.resetScore(player, this.id);
  }
  
  toJSON() {
    return { id: this.id, displayName: this.displayName }
  }
}

module.exports = ScoreboardObjective;