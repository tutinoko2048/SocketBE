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

export type VersionResolvable = string | number | number[];

export interface ServerOption extends WebSocket.ServerOptions {
  debug?: boolean;
  timezone?: string;
  packetTimeout?: number;
  listUpdateInterval?: number;
  /**
   * The version used for requesting commands. More info in Bedrock OSS(link)
   * @example "1.19.70" or [ 1, 19, 70 ] or 31 (internal value)
   * @link https://discord.com/channels/494194063730278411/1075339534797119548/1076028491616768062
   */
  commandVersion?: VersionResolvable;
}

export interface LoggerOption {
  debug?: boolean;
  timezone?: string;
}

export interface ServerEvents {
  [Events.PlayerJoin]:  PlayerJoinEvent;
  [Events.PlayerLeave]: PlayerLeaveEvent;
  [Events.ServerOpen]: void,
  [Events.ServerClose]: void,
  [Events.WorldAdd]: WorldAddEvent;
  [Events.WorldRemove]: WorldRemoveEvent;
  [Events.PacketSend]: PacketSendEvent;
  [Events.PacketReceive]: PacketReceiveEvent;
  [Events.Error]: Error;
  [Events.PlayerChat]: PlayerChatEvent;
  [Events.PlayerTitle]: PlayerTitleEvent;
  [Events.Tick]: void
}

export interface WorldEvent {
  world: World;
}

export interface PlayerJoinEvent extends WorldEvent {
  players: string[];
}

export interface PlayerLeaveEvent extends WorldEvent {
  players: string[];
}

export interface WorldAddEvent extends WorldEvent {}

export interface WorldRemoveEvent extends WorldEvent {}

export interface PacketSendEvent extends WorldEvent {
  packet: any;
}

export interface PacketReceiveEvent extends WorldEvent {
  packet: any;
}

export interface PlayerChatEvent extends WorldEvent {
  'type': 'chat' | 'say' | 'me' | 'tell';
  message: string;
  sender: string;
  receiver: string;
}

export interface PlayerTitleEvent extends Omit<PlayerChatEvent, 'type'> {
  'type': 'title';
}

import World = require('./structures/World');
import Events = require('./util/Events');
import WebSocket from 'ws';