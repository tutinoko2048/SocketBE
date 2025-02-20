import type { MessagePurpose, Packet } from '../../enums';

export type IHeader = EventHeader | CommandHeader | ErrorHeader | EncryptHeader;

interface EventHeader extends BaseHeader {
  messagePurpose: MessagePurpose.Subscribe | MessagePurpose.Unsubscribe | MessagePurpose.Event;
  eventName: Packet;
}

interface CommandHeader extends BaseHeader {
  messagePurpose: MessagePurpose.CommandRequest | MessagePurpose.CommandResponse;
}

interface ErrorHeader extends BaseHeader {
  messagePurpose: MessagePurpose.Error;
}

interface EncryptHeader extends BaseHeader {
  messagePurpose: MessagePurpose.Encrypt;
}

interface BaseHeader {
  version: number;
  requestId: string;
  messagePurpose: MessagePurpose;
  messageType?: string;
}

export interface IPacket<T = Record<string, unknown>> {
  header: IHeader;
  body: T;
}
