// @ts-check

class ScoreboardObjective {
  /**
   * @property {import('./World')}
   */
  #world;

  /**
   * @property {string} #id
   */
  #id;
  
  /**
   * @property {string|undefined} #displayName
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
   * 
   * @type {string}
   */
  get id() {
    return this.#id;
  }
  
  /**
   *
   * @type {string|undefined}
   */
  get displayName() {
    return this.#displayName;
  }
  
  /**
   * 
   * @param {string} player 
   * @returns {Promise<?number>}
   */
  async getScore(player) {
    return await this.#world.scoreboards.getScore(player, this.id)
  }
  
  /**
   * 
   * @param {string} player 
   * @param {number} score
   * @returns {Promise<?number>}
   */
  async setScore(player, score) {
    return await this.#world.scoreboards.setScore(player, this.id, score);
  }

  /**
   * 
   * @param {string} player 
   * @param {number} score
   * @returns {Promise<?number>}
   */
  async addScore(player, score) {
    return await this.#world.scoreboards.addScore(player, this.id, score);
  }
  
  /**
   * 
   * @param {string} player 
   * @param {number} score
   * @returns {Promise<?number>}
   */
  async removeScore(player, score) {
    return await this.#world.scoreboards.removeScore(player, this.id, score);
  }
  
  /**
   * 
   * @param {string} player 
   * @returns {Promise<boolean>}
   */
  async resetScore(player) {
    return await this.#world.scoreboards.resetScore(player, this.id);
  }
}

module.exports = ScoreboardObjective;