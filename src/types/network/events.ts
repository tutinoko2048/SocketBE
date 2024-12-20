import type { NetworkEvent, RawNetworkEvent } from './packet-event';
import type { Packet } from '../../enums';
import type {
  BasePacket,
  CommandRequestPacket,
  CommandResponsePacket,
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
  [Packet.PlayerMessage]: [NetworkEvent<PlayerMessagePacket>];
  [Packet.EventSubscribe]: [NetworkEvent<EventSubscribePacket>];
  [Packet.EventUnsubscribe]: [NetworkEvent<EventUnsubscribePacket>];
}
