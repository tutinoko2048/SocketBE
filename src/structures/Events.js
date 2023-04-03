const { EventEmitter } = require('events');

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
  
  on(eventName, fn) {
    this._subscribed.add(eventName);
    this._events.on(eventName, fn);
    return fn;
  }

  off(eventName, fn) {
    this._subscribed.delete(eventName);
    this._events.off(eventName, fn);
  }
  
  emit(eventName, ...args) {
    this._events.emit(eventName, ...args);
  }
}

module.exports = Events;