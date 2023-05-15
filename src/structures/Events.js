const { EventEmitter } = require('events');

/** @typedef {import('../../typings/types').ServerEvents} ServerEvents */

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
   * @template {keyof ServerEvents} K
   * @param {K} eventName
   * @param {(arg: ServerEvents[K]) => void} fn
   */
  on(eventName, fn) {
    this._subscribed.add(eventName);
    this._events.on(eventName, fn);
    return fn;
  }
  
  /**
   * @template {keyof ServerEvents} K
   * @param {K} eventName
   * @param {(arg: ServerEvents[K]) => void} fn
   */
  off(eventName, fn) {
    this._subscribed.delete(eventName);
    this._events.off(eventName, fn);
  }
  
  /**
   * @param {keyof ServerEvents} eventName
   * @param {any} eventData
   */
  emit(eventName, eventData) {
    return this._events.emit(eventName, eventData);
  }
}

module.exports = Events;