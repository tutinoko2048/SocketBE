import { RawMessage } from '@minecraft/server';
import WebSocket from 'ws';

export enum PlayerMessageType {
  Chat = 'chat',
  Say = 'say',
  Me = 'me',
  Tell = 'tell',
  Title = 'title'
}

export interface RawText {
  rawtext: RawMessage
}

export interface CommandResult {
  statusCode?: number;
  statusMessage?: string;
  [key: string]: any;
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
  activeSessionId: string;
  avgpacketloss: number;
  avgping: number;
  clientId: string;
  color: string;
  deviceSessionId: string;
  globalMultiplayerCorrelationId: string;
  id: number;
  maxbps: number;
  name: string;
  packetloss: number;
  ping: number;
  randomId: number;
  uuid: string;
}

export type VersionResolvable = string | number | number[];

export interface Formatter {
  /**
   * This is useful when player nameTag is changed by ScriptAPI
   * and prevents Join/Leave event from spamming bc it is based on player's nameTag.
   * This affects Chat/Title/Join/Leave events and player list
   */
  playerName?: (name: string) => string;
}

export interface ServerOptions extends WebSocket.ServerOptions {
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
  
  formatter?: Formatter;
}

export interface LoggerOptions {
  debug?: boolean;
  timezone?: string;
}

/*
export interface ServerEventTypeMap_old {
  [EventId.PlayerJoin]: PlayerJoinEvent;
  [EventId.PlayerLeave]: PlayerLeaveEvent;
  [EventId.ServerOpen]: void,
  [EventId.ServerClose]: void,
  [EventId.WorldAdd]: WorldAddEvent;
  [EventId.WorldRemove]: WorldRemoveEvent;
  [EventId.PacketSend]: PacketSendEvent;
  [EventId.PacketReceive]: PacketReceiveEvent;
  [EventId.Error]: Error;
  [EventId.PlayerChat]: PlayerChatEvent;
  [EventId.PlayerTitle]: PlayerTitleEvent;
  [EventId.Tick]: void;
}

export interface WorldEvent {
  world: World;
}

export interface PlayerJoinEvent extends WorldEvent {
  joinedPlayers: string[];
}

export interface PlayerLeaveEvent extends WorldEvent {
  leftPlayers: string[];
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
*/
