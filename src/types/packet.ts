import { UUID } from 'node:crypto';

export interface ServerPacket {
  header: ServerPacketHeader;
  body: ServerPacketBody;
}

export interface ServerPacketHeader {
  requestId: UUID;
  messagePurpose: string;
  version: number;
  messageType: string;
  eventName?: string;
}

export interface ServerPacketBody {
  eventName?: string;
  [key: string]: any;
}