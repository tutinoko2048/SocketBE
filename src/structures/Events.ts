import { EventEmitter } from 'node:events';
import type { Server } from '../Server';

export class Events<EventMap extends Record<string, any>> {
  public readonly server: Server;
  public readonly _subscriptionCache: Set<string>;
  private events: EventEmitter;

  constructor(server: Server) {
    this.server = server;
    this.events = new EventEmitter();
    this._subscriptionCache = new Set();
    
    this.server.logger.debug('ServerEvent: Initialized');
  }
  
  public on<K extends keyof EventMap>(eventName: K, fn: (arg: EventMap[K]) => void): (arg: EventMap[K]) => void {
    if (typeof eventName !== 'string') throw TypeError('invalid event name');
    this._subscriptionCache.add(eventName);
    this.events.on(eventName, fn);
    return fn;
  }
  
  public off<K extends keyof EventMap>(eventName: K, fn: (arg: EventMap[K]) => void): void {
    if (typeof eventName !== 'string') throw TypeError('invalid event name');
    this._subscriptionCache.delete(eventName);
    this.events.off(eventName, fn);
  }
  
  public emit<K extends keyof EventMap>(eventName: K, eventData: EventMap[K]) {
    if (typeof eventName !== 'string') throw TypeError('invalid event name');
    return this.events.emit(eventName, eventData);
  }
}
