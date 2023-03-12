const WebSocket = require('ws');
const Util = require('../util/Util');
const ServerEvents = require('../util/Events');
const Logger = require('../util/Logger');
const ScoreboardManager = require('../managers/ScoreboardManager');

  /** @typedef {import('../../typings/index').ServerPacket} ServerPacket */
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
  
  /**
   * An identifier of the world.
   * @type {string}
   */
  get id() { return this.ws.id }
  
  /** @type {number} */
  get ping() { return Util.median(this.#responseTimes) }
  
  /**
   * Runs a particular command from the world.
   * @param {string} command Command to run.
   * @returns {Promise<Object>} A JSON structure with command response values.
   */
  async runCommand(command) {
    const packet = Util.commandBuilder(command);
    this.ws.send(JSON.stringify(packet));
    if (command.startsWith('tellraw')) return {}; // no packet returns on tellraw command
    return await this.#getResponse(packet.header.requestId);
  }
  
  /**
   * Sends a messsage to the player.
   * @param {string|Object} message The message to be displayed.
   * @param {string} [target] Player name or target selector.
   */
  async sendMessage(message, target = '@a') {
    if (!target.match(/@s|@p|@a|@r|@e/)) target = `"${target}"`;
    
    const rawtext = (typeof message === 'string')
      ? { rawtext: [{ text: String(message) }] }
      : message
    
    await this.runCommand(`tellraw ${target} ${JSON.stringify(rawtext)}`);
  }
  
  
  /**
   * Returns an information about players in the world.
   * @returns {Promise<PlayerList>}
   */
  async getPlayerList() {
    const data = await this.runCommand('list');
    const status = data.statusCode == 0;
    return {
      current: status ? data.currentPlayerCount : 0,
      max: status ? data.maxPlayerCount : 0,
      players: status ? data.players.split(', ') : []
    }
  }
  
  /**
   * Returns an array of player names in the world.
   * @returns {Promise<string[]>}
   */
  async getPlayers() {
    const { players } = await this.getPlayerList();
    return players;
  }
  
  async #playerCounter() {
    const { players, max } = await this.getPlayerList();
    const join = players.filter(i => this.lastPlayers.indexOf(i) === -1);
    const leave = this.lastPlayers.filter(i => players.indexOf(i) === -1);
    
    this.lastPlayers = players;
    this.maxPlayers = max;
    
    if (join.length > 0) this.server.events.emit(ServerEvents.PlayerJoin, { world: this, players: join });
    if (leave.length > 0) this.server.events.emit(ServerEvents.PlayerLeave, { world: this, players: leave });
  }
  
  /**
   * Returns all tags that a player has.
   * @param {string} player
   * @returns {Promise<string[]>}
   */
  async getTags(player) {
    const res = await this.runCommand(`tag "${player}" list`);
    return res.statusMessage.match(/§a.*?§r/g).map(str => str.replace(/§a|§r/g, ''));
  }
  
  /**
   * Tests whether an player has a particular tag.
   * @param {string} player
   * @param {string} tag
   * @returns {Promise<boolean>}
   */
  async hasTag(player, tag) {
    const tags = await this.getTags(player);
    return tags.includes(tag);
  }

  /**
   * Sends a packet to the world.
   * @param {ServerPacket} packet 
   */
  sendPacket(packet) {
    this.ws.send(JSON.stringify(packet));
  }
  
  /**
   * 
   * @param {ServerPacket} packet 
   * @returns {void}
   * @ignore
   */
  _handlePacket(packet) {
    const { header, body } = packet;
    this.server.events.emit(header.eventName, { ...body, world: this }); // minecraft ws events
    
    if (header.eventName === 'PlayerMessage') {
      if (body.type === 'title') {
        this.server.events.emit(ServerEvents.PlayerTitle, { ...body, world: this });
      } else {
        this.server.events.emit(ServerEvents.PlayerChat, { ...body, world: this });
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
      }, Util.getConfig().packetTimeout);
      
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
   * Sends an event subscribe packet.
   * @param {string} eventName A name of the event.
   */
  subscribeEvent(eventName) {
    this.sendPacket(Util.eventBuilder(eventName, 'subscribe'));
  }
  
  /**
   * Sends an event unsubscribe packet.
   * @param {string} eventName A name of the event.
   */
  unsubscribeEvent(eventName) {
    this.sendPacket(Util.eventBuilder(eventName, 'unsubscribe'));
  }
  
  /**
   * Closes a connection.
   */
  close() {
    this.ws.close();
  }
}

module.exports = World;