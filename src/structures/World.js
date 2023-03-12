const WebSocket = require('ws');
const Util = require('../util/Util');
const Events = require('../util/Events');
const Logger = require('../util/Logger');
const ScoreboardManager = require('../managers/ScoreboardManager');

  /**
   * @typedef {Object} ServerPacket
   * @property {Object} header
   * @property {number} header.requestId
   * @property {string} header.messagePurpose
   * @property {number} header.version
   * @property {string} header.messageType
   * @property {Object} body
   * @property {string} body.eventName
   */
   
  /**
   * @typedef {Object} PlayerList
   * @property {number} current
   * @property {number} max
   * @property {string[]} players
   */

class World {
  /** @type {number[]} */
  #responseTimes;
  
  /** @type {?number} */
  #countInterval;
  
  /** @type {Map<string, (string, ServerPacket) => void>} */
  #awaitingResponses;
  
  /**
   * 
   * @param {import('../Server')} server 
   * @param {WebSocket.WebSocket} ws 
   * @param {number} number
   */
  constructor(server, ws, number) {

    /** @type {WebSocket.WebSocket} */
    this.ws = ws;

    /** @type {import('../Server')} */
    this.server = server;
    
    /** @type {number} */
    this.number = number;
    
    /** @type {Logger} */
    this.logger = new Logger(`World #${this.number}`);

    /** @type {string[]} */
    this.lastPlayers = [];
    
    /** @type {number} */
    this.maxPlayers = 0;

    /** @type {ScoreboardManager} */
    this.scoreboards = new ScoreboardManager(this);
    
    this.#countInterval;
    this.#awaitingResponses = new Map();
    this.#responseTimes = [];
  }
  
  /** @type {string} */
  get id() { return this.ws.id }
  
  /** @type {number} */
  get ping() { return Util.median(this.#responseTimes) }
  
  /**
   *
   * @param {string} command
   * @returns {Promise<Object>}
   */
  async runCommand(command) {
    const packet = Util.commandBuilder(command);
    this.ws.send(JSON.stringify(packet));
    if (command.startsWith('tellraw')) return {}; // no packet returns on tellraw command
    return await this.#getResponse(packet.header.requestId);
  }
  
  /**
   *
   * @param {string|Object} message
   * @param {string} [target]
   */
  async sendMessage(message, target = '@a') {
    if (!target.match(/@s|@p|@a|@r|@e/)) target = `"${target}"`;
    
    const rawtext = (typeof message === 'string')
      ? { rawtext: [{ text: String(message) }] }
      : message
    
    await this.runCommand(`tellraw ${target} ${JSON.stringify(rawtext)}`);
  }
  
  /**
   *
   * @returns {Promise<PlayerList>}
   */
  async getPlayers() {
    let data = await this.runCommand('list');
    let status = data.statusCode == 0;
    return {
      current: status ? data.currentPlayerCount : 0,
      max: status ? data.maxPlayerCount : 0,
      players: status ? data.players.split(', ') : []
    }
  }
  
  /**
   *
   * @private
   */
  async #playerCounter() {
    const { players, max } = await this.getPlayers();
    const join = players.filter(i => this.lastPlayers.indexOf(i) === -1);
    const leave = this.lastPlayers.filter(i => players.indexOf(i) === -1);
    
    this.lastPlayers = players;
    this.maxPlayers = max;
    
    if (join.length > 0) this.server.events.emit(Events.PlayerJoin, { world: this, players: join });
    if (leave.length > 0) this.server.events.emit(Events.PlayerLeave, { world: this, players: leave });
  }
  
  /**
   *
   * @param {string} player
   * @returns {Promise<string[]>}
   */
  async getTags(player) {
    const res = await this.runCommand(`tag "${player}" list`);
    return res.statusMessage.match(/§a.*?§r/g).map(str => str.replace(/§a|§r/g, ''));
  }
  
  /**
   *
   * @param {string} player
   * @param {string} tag
   * @returns {Promise<boolean>}
   */
  async hasTag(player, tag) {
    const tags = await this.getTags(player);
    return tags.includes(tag);
  }

  /**
   * 
   * @param {ServerPacket} packet 
   */
  sendPacket(packet) {
    this.ws.send(JSON.stringify(packet));
  }
  
  /**
   * 
   * @param {ServerPacket} packet 
   * @returns {void}
   */
  _handlePacket(packet) {
    const { header, body } = packet;
    this.server.events.emit(header.eventName, { ...body, world: this }); // minecraft ws events
    
    if (header.eventName === 'PlayerMessage') {
      if (body.type === 'title') {
        this.server.events.emit(Events.PlayerTitle, { ...body, world: this });
      } else {
        this.server.events.emit(Events.PlayerChat, { ...body, world: this });
      }
    }
    
    if (['commandResponse','error'].includes(header.messagePurpose)) {
      if (!this.#awaitingResponses.has(packet.header.requestId)) return;
      this.#awaitingResponses.get(packet.header.requestId)(packet.body);
      this.#awaitingResponses.delete(packet.header.requestId);
    }
  }
  
  /**
   *
   * @param {string} id
   * @returns {Promise<Object>}
   */
  #getResponse(id) {
    const sendTime = Date.now();
    return new Promise((res, rej) => {
      if (this.ws.readyState !== WebSocket.OPEN) return rej(new Error('client is offline'));
        
      const timeout = setTimeout(() => {
        rej(new Error('response timeout'));
      }, this.server.options.packetTimeout);
      
      this.#awaitingResponses.set(id, packet => {
        clearTimeout(timeout);
        if (this.#responseTimes.length > 20) this.#responseTimes.shift();
        this.#responseTimes.push(Date.now() - sendTime);
        res(packet);
      });
    });
  }
  
  /** @ignore */
  _startInterval() {
    if (!this.#countInterval) this.#countInterval = setInterval(this.#playerCounter.bind(this), 1000);
  }
  
  /** @ignore */
  _stopInterval() {
    if (this.#countInterval) {
      clearInterval(this.#countInterval);
      this.#countInterval = null;
    }
  }
  
  /**
   *
   * @param {string} eventName
   */
  subscribeEvent(eventName) {
    this.sendPacket(Util.eventBuilder(eventName, 'subscribe'));
  }
  
  /**
   *
   * @param {string} eventName
   */
  unsubscribeEvent(eventName) {
    this.sendPacket(Util.eventBuilder(eventName, 'unsubscribe'));
  }
  
  close() {
    this.ws.close();
  }
}

module.exports = World;