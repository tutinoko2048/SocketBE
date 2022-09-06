const { EventEmitter } = require('events');
const { Util } = require('../');
const WebSocket = require('ws');

const { DEBUG } = require('../../config.json');

class World extends EventEmitter {
  constructor(server, ws) {
    super();
    this.ws = ws;
    this.server = server;
    this.countInterval;
    this.lastPlayers = [];
    this.awaitingResponses = new Map();
    this.responseTimes = [];
    
    this.on('packet', packet => {
      this.server.events.emit('packet', { world: this, packet });
      this.server.events.emit(packet.header.eventName, { ...packet.body, world: this });
      if (packet.header.messagePurpose === 'commandResponse') {
        if (packet.body.recipient === undefined)
          this.handlePacket(packet);
      }
      
      if (packet.header.messagePurpose === 'error') {
        if (packet.body.recipient === undefined)
          this.handlePacket(packet);
      }
    });
  }
  
  get id() { return this.ws.id }
  get ping() { return Util.median(this.responseTimes) }
  
  startInterval() {
    if (!this.countInterval)
      this.countInterval = setInterval(this.playerCounter.bind(this), 1000);
  }
  
  stopInterval() {
    if (this.countInterval) {
      clearInterval(this.countInterval);
      this.countInterval = null;
    }
  }
  
  async runCommand(command) {
    let packet = Util.commandBuilder(command);
    this.ws.send(JSON.stringify(packet));
    if (command.startsWith('tellraw')) return {}; // no packet returns on tellraw command
    return await this.getResponse(packet.header.requestId).catch(e => {
      if (DEBUG) console.error(`runCommand Error: ${e.message}`);
      return { error: true, statusMessage: e.message }
    });
  }
  
  handlePacket(packet) {
    if (!this.awaitingResponses.has(packet.header.requestId)) return;
    this.awaitingResponses.get(packet.header.requestId)(packet.body);
    this.awaitingResponses.delete(packet.header.requestId);
  }
  
  getResponse(id) {
    const sendTime = Date.now();
    return new Promise((res, rej) => {
      if (this.ws.readyState !== WebSocket.OPEN) return rej(new Error('client is offline'));
        
      const timeout = setTimeout(() => {
        rej(new Error('response timeout'));
      }, 10*1000);
      
      this.awaitingResponses.set(id, packet => {
        clearTimeout(timeout);
        if (this.responseTimes.length > 20) this.responseTimes.shift();
        this.responseTimes.push(Date.now() - sendTime);
        res(packet);
      });
    });
  }
  
  async sendMessage(message, target = '@a', key, ...args) {
    if (!target.match(/@s|@p|@a|@r|@e/)) target = `"${target}"`;
    let rawtext = { rawtext: [{ text: String(message || '') }] }
    if (key) rawtext.rawtext.push({
        translate: key,
        with: args
    });
    return await this.runCommand(`tellraw ${target} ${JSON.stringify(rawtext)}`);
  }
  
  async getPlayers() {
    let data = await this.runCommand('list');
    let status = (data.statusCode == 0 && !data.error);
    return {
      current: status ? data.currentPlayerCount : 0,
      max: status ? data.maxPlayerCount : 0,
      players: status ? data.players.split(', ') : []
    }
  }
  
  async playerCounter() {
    const { players, current, max } = await this.getPlayers();
    const join = players.filter(i => this.lastPlayers.indexOf(i) === -1);
    const leave = this.lastPlayers.filter(i => players.indexOf(i) === -1);
    if (join.length > 0) this.server.events.emit('PlayerJoin', { world: this, join, players, current, max });
    if (leave.length > 0) this.server.events.emit('PlayerLeave', { world: this, leave, players, current, max });
    this.lastPlayers = players;
  }
  
  async getTags(player) {
    const res = await this.runCommand(`tag "${player}" list`);
    if (res.error) return res;
    try {
      return res.statusMessage.match(/§a.*?§r/g).map(str => str.replace(/§a|§r/g, ''));
    } catch {
      return [];
    }
  }
  
  async hasTag(player, tag) {
    const tags = await this.getTags(player);
    if (tags.error) return tags;
    return tags.includes(tag);
  }
  
  async getScores(player) {
    const res = await this.runCommand(`scoreboard players list "${player}"`);
    if (res.error) return res;
    try {
      return Object.fromEntries(
        [...res.statusMessage.matchAll(/: (\d*) \((.*?)\)/g)]
          .map(data => [data[2], Number(data[1])])
      )
    } catch {
      return {};
    }
  }
  
  async getScore(player, objective) {
    const res = await this.getScores(player);
    if (res.error) return res;
    return res[objective];
  }
}

module.exports = World;