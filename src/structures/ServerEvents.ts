import { PlayerMessageType } from '../types';
import { Events } from './Events';
import type { World } from './World';

export interface ServerEventTypeMap {
  playerJoin: PlayerJoinEvent;
  playerLeave: PlayerLeaveEvent;
  serverOpen: void;
  serverClose: void;
  worldAdd: WorldAddEvent;
  worldRemove: WorldRemoveEvent;
  packetSend: PacketSendEvent;
  packetReceive: PacketReceiveEvent;
  error: Error;
  playerChat: PlayerChatEvent;
  playerTitle: PlayerTitleEvent;
  tick: void;
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
  'type': Omit<PlayerMessageType, 'Title'>;
  message: string;
  sender: string;
  receiver: string;
}

export interface PlayerTitleEvent extends PlayerChatEvent {
  'type': PlayerMessageType.Title;
}

export class ServerEvents extends Events<ServerEventTypeMap> {}