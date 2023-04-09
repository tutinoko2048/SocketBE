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
  playerJoin:  { players: string[], world: World },
  playerLeave: { players: string[], world: World }
  serverOpen: void,
  serverClose: void,
  worldAdd: { world: World },
  worldRemove: { world: World },
  packetReceive: { packet: any, world: World },
  error: Error,
  playerChat: {
    'type': 'chat' | 'say' | 'me' | 'tell',
    message: string,
    sender: string,
    receiver: string,
    world: World
  },
  playerTitle: {
    'type': 'title',
    message: string,
    sender: string,
    receiver: string,
    world: World
  },
  tick: void
}

import World = require("./structures/World");
import WebSocket from 'ws';