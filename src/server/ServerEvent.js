const { EventEmitter } = require('events');

class ServerEvent extends EventEmitter {
  /**
   * 
   * @param {import('./Server')} server 
   */
  constructor(server) {
    super();
    this.server = server;
  }
  
  /**
   * 
   * @param {string} eventName 
   * @param {(...any) => void} fn 
   * @returns 
   */
  on(eventName, fn) {
    this.server.subscribedEvents.add(eventName);
    super.on(eventName, fn);
    return fn;
  }

  /**
   * 
   * @param {string} eventName 
   */
  off(eventName) {
    this.server.subscribedEvents.remove(eventName);
    super.off(eventName);
  }
}

module.exports = ServerEvent;