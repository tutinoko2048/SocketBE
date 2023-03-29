const ScoreboardObjective = require('../structures/ScoreboardObjective');

class ScoreboardManager {
  /** @type {import('../structures/World')} */
  #world;

  /**
   *
   * @param {import('../structures/World')} world
   */
  constructor(world) {
    this.#world = world;
    
    this.#world.logger.debug('ScoreboardManager: Initialized');
  }
  
  /**
   * World instance that this manager belongs to.
   * @type {import('../structures/World')}
   */
  get world() {
    return this.#world;
  }
  
  /**
   * Returns all defined objectives.
   * @returns {Promise<ScoreboardObjective[]>}
   */
  async getObjectives() {
    const res = await this.#world.runCommand('scoreboard objectives list');
    const objectives = res.statusMessage.split('\n').slice(1).map(entry => {
      const [ id, displayName ] = [...entry.matchAll(/- (.*):.*?'(.*?)'.*/g)][0].slice(1,3);
      return new ScoreboardObjective(this.#world, id, displayName);
    });
    
    return objectives;
  }
  
  /**
   * Returns a specific objective (by id).
   * @param {string} objectiveId
   * @returns {Promise<ScoreboardObjective|undefined>}
   */
  async getObjective(objectiveId) {
    const res = await this.getObjectives();
    return res.find(objective => objective.id === objectiveId); 
  }
  
  /**
   * Adds a new objective to the scoreboard.
   * @param {string} objectiveId
   * @param {string} [displayName]
   * @returns {Promise<?ScoreboardObjective>}
   */
  async addObjective(objectiveId, displayName = '') {
    if (await this.getObjective(objectiveId)) return null;
    const res = await this.#world.runCommand(`scoreboard objectives add "${objectiveId}" dummy "${displayName}"`);
    if (res.statusCode !== 0) return null;
    return new ScoreboardObjective(this.#world, objectiveId, displayName);
  }
  
  /**
   * Removes an objective from the scoreboard.
   * @param {string|ScoreboardObjective} objectiveId Objective to remove from scoreboard.
   * @returns {Promise<boolean>} Whether successful to remove objective.
   */
  async removeObjective(objectiveId) {
    const objective = ScoreboardManager.resolveObjective(objectiveId);
    if (!(await this.getObjective(objective))) return false;
    const res = await this.#world.runCommand(`scoreboard objectives remove ${objective}`);
    return res.statusCode === 0;
  }

  /**
   * Returns all of scores that player has.
   * @param {string} player Player to retrieve the score for.
   * @returns {Promise<{[objective: string]: ?number}>} Score values.
   */
  async getScores(player) {
    const res = await this.#world.runCommand(`scoreboard players list "${player}"`);
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
   * @param {string} player Name of the player to retrieve the score for.
   * @param {string|ScoreboardObjective} objectiveId Objective to retrieve the score for.
   * @returns {Promise<?number>} Score value.
   */
  async getScore(player, objectiveId) {
    const objective = ScoreboardManager.resolveObjective(objectiveId);
    const res = await this.getScores(player);
    return res[objective];
  }
  
  /**
   * Sets the score given a player and objective.
   * @param {string} player Name of the player.
   * @param {string|ScoreboardObjective} objectiveId Objective to apply the score to.
   * @param {number} score New value of the score.
   * @returns {Promise<?number>} New value of the score, returns null if failed to set the score.
   */
  async setScore(player, objectiveId, score) {
    const objective = ScoreboardManager.resolveObjective(objectiveId);
    const res = await this.#world.runCommand(`scoreboard players set "${player}" "${objective}" ${score}`);
    return res.statusCode === 0 ? score : null;
  }
  
  /**
   * Adds the score given a player and objective.
   * @param {string} player Name of the player.
   * @param {string|ScoreboardObjective} objectiveId Objective to apply the score to.
   * @param {number} score The amount of score to add.
   * @returns {Promise<?number>} New value of the score, returns null if failed to add the score.
   */
  async addScore(player, objectiveId, score) {
    let res = await this.getScore(player, objectiveId);
    if (isNaN(res)) return null;
    const value = res += score;
    return await this.setScore(player, objectiveId, value);
  }
  
  /**
   * Removes the score given a player and objective.
   * @param {string} player Name of the player.
   * @param {string|ScoreboardObjective} objectiveId Objective to apply the score to.
   * @param {number} score The amount of score to remove.
   * @returns {Promise<?number>} New value of the score, returns null if failed to remove the score.
   */
  async removeScore(player, objectiveId, score) {
    let res = await this.getScore(player, objectiveId);
    if (isNaN(res)) return null;
    const value = res -= score;
    return await this.setScore(player, objectiveId, value);
  }
  
  /**
   * Removes a player from an objective.
   * @param {string} player Name of the player.
   * @param {string|ScoreboardObjective} [objectiveId] Objective that player is removed from.
   * @returns {Promise<boolean>} Whether successful to reset score of player.
   */
  async resetScore(player, objectiveId = '') {
    const objective = ScoreboardManager.resolveObjective(objectiveId);
    const res = await this.#world.runCommand(`scoreboard players reset "${player}" "${objective}"`);
    return res.statusCode === 0;
  }
  
  /**
   * Sets an objective into a display slot with specified additional display settings.
   * @param {string} displaySlotId
   * @param {string|ScoreboardObjective|undefined} objectiveId
   * @param {'ascending'|'descending'|undefined} sortOrder
   * @returns {Promise<boolean>}
   */
  async setDisplay(displaySlotId, objectiveId, sortOrder) {
    let commandString = `scoreboard objectives setdisplay ${displaySlotId}`;
    if (objectiveId) commandString += ` "${ScoreboardManager.resolveObjective(objectiveId)}"`;
    if (sortOrder) commandString += ` ${sortOrder}`;
    const res = await this.#world.runCommand(commandString);
    return res.statusCode === 0;
  }
  
  /**
   * Returns an objective id.
   * @param {string|ScoreboardObjective} objective Objective or its id to resolve.
   * @returns {string} objectiveId The id of the objective.
   */
  static resolveObjective(objective) {
    return typeof objective === 'string' ? objective : objective.id;
  }
}

module.exports = ScoreboardManager;