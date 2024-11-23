import type { NetworkEvent } from './packet-event';
import type { Packet } from '../../enums';
import type {
  BasePacket,
  CommandRequestPacket,
  CommandResponsePacket,
  PlayerMessagePacket
} from '../../network';


//TODO - Add network events here
export interface NetworkEvents {
  all: [NetworkEvent<BasePacket>];
  [Packet.CommandRequest]: [NetworkEvent<CommandRequestPacket>];
  [Packet.CommandResponse]: [NetworkEvent<CommandResponsePacket>];
  [Packet.PlayerMessage]: [NetworkEvent<PlayerMessagePacket>];
}
