import World from './structures/World';
import * as WebSocket from 'ws';

export interface ServerPacket {
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

export interface PlayerList {
  current: number,
  max: number,
  players: string[]
}

export interface PlayerDetail extends PlayerList {
  details: PlayerInfo[]
}

export interface PlayerInfo {
  activeSessionId: string,
  clientId: string,
  color: string,
  deviceSessionId: string,
  globalMultiplayerCorrelationId: string,
  id: number,
  name: string,
  randomId: number,
  uuid: string
}

export interface ServerOption extends WebSocket.ServerOptions {
  debug?: boolean,
  timezone?: string,
  packetTimeout?: number,
  listUpdateInterval?: number
}

export interface ServerEvents {
  playerJoin:  { players: string[], world: typeof World },
  playerLeave: { players: string[], world: typeof World }
  serverOpen: void,
  serverClose: void,
  worldAdd: { world: typeof World },
  worldRemove: { world: typeof World },
  packetReceive: { packet: any, world:typeof World },
  error: Error,
  playerChat: {
    'type': 'chat' | 'say' | 'me' | 'tell',
    message: string,
    sender: string,
    receiver: string,
    world: typeof World
  },
  playerTitle: {
    'type': 'title',
    message: string,
    sender: string,
    receiver: string,
    world: typeof World
  },
  tick: void
}