const { EventEmitter } = require('events');

/** @type {import('../../typings/index').Events} */
class Events {
  /**
   * 
   * @param {import('../Server')} server 
   */
  constructor(server) {
    this.server = server;
    this._events = new EventEmitter();
    
    /** @type {Set<string>} */
    this._subscribed = new Set();
    
    this.server.logger.debug('ServerEvent: Initialized');
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
  
  emit(...args) {
    this._events.emit(...args);
  }
}

module.exports = Events;