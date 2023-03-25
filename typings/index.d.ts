import type World from '../src/structures/World';
//import type { WebSocket } from 'ws';

declare global {
  interface ServerPacket {
    header: {
      requestId: string,
      messagePurpose: string,
      version: number,
      messageType: string,
      eventName?: string
    },
    body: {
      eventName?: string
    } | any
  }
  
  interface PlayerList {
    current: number,
    max: number,
    players: string[]
  }
  
  interface ServerOptions {
    debug?: boolean,
    timezone?: string,
    packetTimeout?: number,
    port?: number
  }
}

declare module 'ws' {
  interface WebSocket {
    id: string;
  }
}

export class Server {
  constructor(options?: ServerOptions);
  public events: Events;
}

export interface Events {
  constructor(server: import('../src/Server')): Events;
  
  on<K extends keyof ServerEvents>(eventName: K, fn: (arg: ServerEvents[K]) => void): (arg: ServerEvents[K]) => void;
  off(eventName: string): void;
  emit(...args: any[]): any;
}

export interface ServerEvents {
  playerJoin:  { players: string[], world: World },
  playerLeave: { players: string[], world: World }
  serverOpen: void,
  serverClose: void,
  worldAdd: { world: World },
  worldRemove: { world: World },
  packetReceive: { packet: any, world: World },
  error: Error,
  playerChat: {
    'type': string,
    message: string,
    sender: string,
    receiver: string,
    world: World
  },
  playerTitle: {
    'type': string,
    message: string,
    sender: string,
    receiver: string,
    world: World
  },
  tick: void
}
