// @ts-check

const WebSocket = require('ws');
const Util = require('../util/Util');
const ServerEvents = require('../util/Events');
const Logger = require('../util/Logger');
const ScoreboardManager = require('../managers/ScoreboardManager');


class World {
  /** @type {number[]} */
  #responseTimes;
  
  /** @type {?NodeJS.Timer} */
  #countInterval;
  
  /** @type {Map<string, (arg0: ServerPacket) => void>} */
  #awaitingResponses;
  
  /**
   * 
   * @param {import('../Server')} server 
   * @param {WebSocket.WebSocket} ws 
   * @param {string} name
   */
  constructor(server, ws, name) {

    /** @type {WebSocket.WebSocket} */
    this.ws = ws;

    /** @type {import('../Server')} */
    this.server = server;
    
    /** @type {string} */
    this.name = name;
    
    /** @type {Logger} */
    this.logger = new Logger(this.server, this.name);

    /** @type {string[]} */
    this.lastPlayers = [];
    
    /** @type {number} */
    this.maxPlayers = 0;

    /** @type {ScoreboardManager} */
    this.scoreboards = new ScoreboardManager(this);
    
    /** @type {number} */
    this.connectedAt = Date.now();
    
    this.#countInterval;
    this.#awaitingResponses = new Map();
    this.#responseTimes = [];
  }
  
  /**
   * An identifier of the world.
   * @type {string}
   */
  get id() {
    return this.ws.id;
  }
  
  /**
   * The latency between server and minecraft
   * @type {number}
   */
  get ping() {
    return Util.median(this.#responseTimes);
  }
  
  /**
   * Runs a particular command from the world.
   * @param {string} command Command to run.
   * @returns {Promise<Object>} A JSON structure with command response values.
   */
  async runCommand(command) {
    const packet = Util.commandBuilder(command);
    this.ws.send(JSON.stringify(packet));
    if (command.startsWith('tellraw')) return {}; // no packet returns on tellraw command
    return await this.#getResponse(packet);
  }
  
  /**
   * Sends a messsage to the player.
   * @param {string|Object} message The message to be displayed.
   * @param {string} [target] Player name or target selector.
   */
  async sendMessage(message, target = '@a') {
    if (!target.match(/@s|@p|@a|@r|@e/)) target = `"${target}"`;
    
    const rawtext = (typeof message === 'object')
      ? message
      : { rawtext: [{ text: String(message) }] }
    
    await this.runCommand(`tellraw ${target} ${JSON.stringify(rawtext)}`);
  }
  
  
  /**
   * Returns information about players in the world.
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
  
  /**
   * Returns the name of local player (client)
   * @returns {Promise<string>}
   */
  async getLocalPlayer() {
    const res = await this.runCommand('getlocalplayername');
    return res.localplayername;
  }
  
  /**
   * Returns all tags that a player has.
   * @param {string} player
   * @returns {Promise<string[]>}
   */
  async getTags(player) {
    const res = await this.runCommand(`tag "${player}" list`);
    return res.statusMessage.match(/§a.*?§r/g).map((str) => str.replace(/§a|§r/g, ''));
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
   * Returns information about players with more details in the world.
   * @returns {Promise<PlayerDetail>}
   */
  async getPlayerDetail() {
    const res = await this.runCommand('listd');
    const status = res.statusCode === 0;
    /** @type {PlayerInfo[]} */
    const details = JSON.parse(res.details.match(/\{.*\}/g)[0]).result;
    
    return {
      details,
      current: status ? res.currentPlayerCount : 0,
      max: status ? res.maxPlayerCount : 0,
      players: status ? res.players.split(', ') : []
    }
  }

  /**
   * Sends a packet to the world.
   * @param {ServerPacket} packet 
   */
  sendPacket(packet) {
    this.ws.send(JSON.stringify(packet));
  }
  
  /**
   * Handles incoming packets
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
   * @param {ServerPacket} packet
   * @returns {Promise<Object>}
   */
  #getResponse(packet) {
    const packetId = packet.header.requestId;
    const sendTime = Date.now();
    
    return new Promise((res, rej) => {
      if (this.ws.readyState !== WebSocket.OPEN) return rej(new Error(`client is offline\npacket: ${JSON.stringify(packet, null, 2)}`));
        
      const timeout = setTimeout(() => {
        rej(new Error(`response timeout\npacket: ${JSON.stringify(packet, null, 2)}`));
      }, this.server.option.packetTimeout);
      
      this.#awaitingResponses.set(packetId, (response) => {
        clearTimeout(timeout);
        if (this.#responseTimes.length > 20) this.#responseTimes.shift();
        this.#responseTimes.push(Date.now() - sendTime);
        res(response);
      });
    });
  }
  
  async #updatePlayers() {
    try {
      const { players, max } = await this.getPlayerList();
      const join = players.filter(i => this.lastPlayers.indexOf(i) === -1);
      const leave = this.lastPlayers.filter(i => players.indexOf(i) === -1);
      
      this.lastPlayers = players;
      this.maxPlayers = max;
      
      if (join.length > 0) this.server.events.emit(ServerEvents.PlayerJoin, { world: this, players: join });
      if (leave.length > 0) this.server.events.emit(ServerEvents.PlayerLeave, { world: this, players: leave });
    } catch (e) {}
  }
  
  /** @ignore */
  _startInterval() {
    if (!this.#countInterval) {
      this.#updatePlayers();
      this.#countInterval = setInterval(this.#updatePlayers.bind(this), this.server.option.listUpdateInterval);
    }
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