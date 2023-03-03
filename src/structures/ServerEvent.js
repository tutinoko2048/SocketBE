const { EventEmitter } = require('events');
const Events = require('../util/Events');

class ServerEvent {
  /**
   * 
   * @param {import('./Server')} server 
   */
  constructor(server) {
    this.server = server;
    
    /** @private */
    this._events = new EventEmitter();
    
    this._subscribed = new Set();
  }
  
  /**
   * 
   * @param {string} eventName 
   * @param {(...any) => void} fn 
   * @returns 
   */
  on(eventName, fn) {
    this._subscribed.add(eventName);
    this._events.on(eventName, fn);
    return fn;
  }

  /**
   * 
   * @param {string} eventName 
   */
  off(eventName) {
    this._subscribed.remove(eventName);
    this._events.off(eventName);
  }
}

module.exports = ServerEvent;