import type { NetworkEvent, RawNetworkEvent } from './packet-event';
import type { Packet } from '../../enums';
import type {
  BasePacket,
  CommandErrorPacket,
  CommandRequestPacket,
  CommandResponsePacket,
  DataRequestPacket,
  DataResponsePacket,
  EncryptionRequestPacket,
  EncryptionResponsePacket,
  EventSubscribePacket,
  EventUnsubscribePacket,
  PlayerMessagePacket
} from '../../network';

export interface NetworkEvents {
  all: [NetworkEvent<BasePacket>];
  /**
   * Fired for any sevrer-bound packet.
   */
  raw: [RawNetworkEvent];
  
  [Packet.CommandRequest]: [NetworkEvent<CommandRequestPacket>];
  [Packet.CommandResponse]: [NetworkEvent<CommandResponsePacket>];
  [Packet.CommandError]: [NetworkEvent<CommandErrorPacket>];
  [Packet.PlayerMessage]: [NetworkEvent<PlayerMessagePacket>];
  [Packet.EventSubscribe]: [NetworkEvent<EventSubscribePacket>];
  [Packet.EventUnsubscribe]: [NetworkEvent<EventUnsubscribePacket>];
  [Packet.EncryptionRequest]: [NetworkEvent<EncryptionRequestPacket>];
  [Packet.EncryptionResponse]: [NetworkEvent<EncryptionResponsePacket>];
  [Packet.DataRequest]: [NetworkEvent<DataRequestPacket>];
  [Packet.DataResponse]: [NetworkEvent<DataResponsePacket>];
}
