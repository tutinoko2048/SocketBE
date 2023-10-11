import { EventEmitter } from 'node:events';
import type { Server } from '../Server';

interface BaseEventMap {
  [key: string]: any;
}

export class Events<EventMap extends BaseEventMap> {
  public server: Server;
  public _subscribed: Set<string>;
  private events: EventEmitter;

  constructor(server: Server) {
    this.server = server;
    this.events = new EventEmitter();
    this._subscribed = new Set();
    
    this.server.logger.debug('ServerEvent: Initialized');
  }
  
  on<K extends keyof EventMap>(eventName: K, fn: (arg: EventMap[K]) => void): (arg: EventMap[K]) => void {
    if (typeof eventName !== 'string') throw TypeError('invalid event name');
    this._subscribed.add(eventName);
    this.events.on(eventName, fn);
    return fn;
  }
  
  off<K extends keyof EventMap>(eventName: K, fn: (arg: EventMap[K]) => void): void {
    if (typeof eventName !== 'string') throw TypeError('invalid event name');
    this._subscribed.delete(eventName);
    this.events.off(eventName, fn);
  }
  
  emit<K extends keyof EventMap>(eventName: K, eventData: EventMap[K]) {
    if (typeof eventName !== 'string') throw TypeError('invalid event name');
    return this.events.emit(eventName, eventData);
  }
}
