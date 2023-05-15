export = Events;
declare class Events {
    constructor(server: import("../Server"));
    server: import("../Server");
    _events: import("node:events").EventEmitter;
    _subscribed: Set<string>;
    on<K extends keyof ServerEvents>(eventName: K, fn: (arg: ServerEvents[K]) => void): (arg: ServerEvents[K]) => void;
    off<K extends keyof ServerEvents>(eventName: K, fn: (arg: ServerEvents[K]) => void): void;
    emit<K extends keyof ServerEvents>(eventName: K, eventData: any): any;
}
import { ServerEvents } from "../types";