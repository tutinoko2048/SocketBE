// @ts-check
const ScoreboardObjective = require('../structures/ScoreboardObjective');

class ScoreboardManager {
  /**
   *
   * @param {import('../structures/World')} world
   */
  constructor(world) {
    this.world = world;
    
    this.world.logger.debug('ScoreboardManager: Initialized');
  }
  
  /**
   *
   * @returns {Promise<ScoreboardObjective[]>}
   */
  async getObjectives() {
    const res = await this.world.runCommand('scoreboard objectives list');
    const objectives = res;
    // process something
    return objectives;
  }
  
  /**
   *
   * @param {string} objectiveId
   * @returns {Promise<ScoreboardObjective|undefined>}
   */
  async getObjective(objectiveId) {
    const res = await this.getObjectives();
    return res.find(objective => objective.id === objectiveId); 
  }
  
  /**
   *
   * @param {string} objectiveId
   * @param {string} [displayName]
   * @returns {Promise<?ScoreboardObjective>}
   */
  async addObjective(objectiveId, displayName = '') {
    if (await this.getObjective(objectiveId)) return null;
    const res = await this.world.runCommand(`scoreboard objectives add "${objectiveId}" dummy "${displayName}"`);
    if (res.statusCode !== 0) return null;
    return new ScoreboardObjective(objectiveId, displayName);
  }
  
  /**
   *
   * @param {string|ScoreboardObjective} objectiveId
   * @returns {Promise<boolean>}
   */
  async removeObjective(objectiveId) {
    const objective = ScoreboardManager.resolveObjective(objectiveId);
    if (!(await this.getObjective(objective))) return false;
    const res = await this.world.runCommand(`scoreboard objectives remove ${objective}`);
    return res.statusCode === 0;
  }

  /**
   *
   * @param {string} player
   * @returns {Promise<Object<string, ?number>>}
   */
  async getScores(player) {
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
   *
   * @param {string} player
   * @param {string|ScoreboardObjective} objectiveId
   * @returns {Promise<?number>}
   */
  async getScore(player, objectiveId) {
    const objective = ScoreboardManager.resolveObjective(objectiveId);
    const res = await this.getScores(player);
    return res[objective];
  }
  
  /**
   *
   * @param {string} player
   * @param {string|ScoreboardObjective} objectiveId
   * @param {number} value
   * @returns {Promise<?number>}
   */
  async setScore(player, objectiveId, value) {
    const objective = ScoreboardManager.resolveObjective(objectiveId);
    const res = await this.world.runCommand(`scoreboard players set "${player}" "${objective}" ${value}`);
    return res.statusCode === 0 ? value : null;
  }
  
  /**
   *
   * @param {string} player
   * @param {string|ScoreboardObjective} objectiveId
   * @param {number} value
   * @returns {Promise<?number>}
   */
  async addScore(player, objectiveId, value) {
    let res = await this.getScore(player, objectiveId);
    if (isNaN(res)) return null;
    const score = res += value;
    return await this.setScore(player, objectiveId, score);
  }
  
  /**
   *
   * @param {string} player
   * @param {string|ScoreboardObjective} objectiveId
   * @param {number} value
   * @returns {Promise<?number>}
   */
  async removeScore(player, objectiveId, value) {
    let res = await this.getScore(player, objectiveId);
    if (isNaN(res)) return null;
    const score = res -= value;
    return await this.setScore(player, objectiveId, score);
  }
  
  /**
   *
   * @param {string} player
   * @param {string|ScoreboardObjective} [objectiveId]
   * @returns {Promise<boolean>}
   */
  async resetScore(player, objectiveId = '') {
    const objective = ScoreboardManager.resolveObjective(objectiveId);
    const res = await this.world.runCommand(`scoreboard players reset "${player}" "${objective}"`);
    return res.statusCode === 0;
  }
  
  /**
   * 
   * @param {string|ScoreboardObjective} objective
   * @returns {string} objectiveId
   */
  static resolveObjective(objective) {
    return typeof objective === 'string' ? objective : objective.id;
  }
}

module.exports = ScoreboardManager;