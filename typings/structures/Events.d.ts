export = Events;
declare class Events {
    constructor(server: import('../Server'));
    server: import("../Server");
    _events: EventEmitter;
    _subscribed: Set<string>;
    on<K extends keyof ServerEvents>(eventName: K, fn: (arg: ServerEvents[K]) => void): (arg: ServerEvents[K]) => void;
    off<K extends keyof ServerEvents>(eventName: K, fn: (arg: ServerEvents[K]) => void): void;
    emit(eventName:string, ...args: any[]): any;
}
import { EventEmitter } from "events";
import { ServerEvents } from '../types';