import { UUID } from 'node:crypto';
import { VersionResolvable } from './types';

export type PacketPurpose = 'subscribe' | 'unsubscribe' | 'event' | 'commandRequest' | 'commandResponse' | 'error';

export interface ServerPacket {
  header: ServerPacketHeader;
  body: ServerPacketBody;
}

export interface ServerPacketHeader {
  requestId: UUID;
  messagePurpose: PacketPurpose;
  version: number;
  messageType?: string;
  eventName?: string;
}

export interface ServerPacketBody {
  eventName?: string;
  [key: string]: any;
}

export interface CommandRequestPacket extends ServerPacket {
  body: CommandRequestPacketBody;
}

export interface CommandRequestPacketBody {
  commandLine: string;
  version: VersionResolvable;
}

export interface CommandResponsePacket extends ServerPacket {
  body: CommandResponsePacketBody;
}

export interface CommandResponsePacketBody {
  statusCode: number;
  statusMessage: string;
  [key: string]: any;
}