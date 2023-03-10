import { Events as EventNames } from '../src/index';

export interface ServerOptions {
  debug?: boolean,
  timezone?: string,
  packetTimeout?: number,
  port?: number
}

export interface ServerPacket {
  header: {
    requestId: number,
    messagePurpose: string,
    version: number,
    messageType: string
  },
  body: {
    eventName: string
  }
}

interface ServerEvents {
  PlayerJoin:  { player: string }
}

export class Events {
  on<K extends keyof ServerEvents>(eventName: K, fn: (arg: ServerEvents[K]) => void): (arg: ServerEvents[K]) => void;
}