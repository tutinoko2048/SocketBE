// @ts-check

class ScoreboardObjective {
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
   * @param {string} objectiveId
   * @param {string} [displayName='']
   */
  constructor(objectiveId, displayName = '') {
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
  
  getScore(player) {}
  
  setScore(player, value) {}
  
  addScore(player, value) {}
  
  removeScore(player, value) {}
  
  resetScore(player) {}
}

module.exports = ScoreboardObjective;