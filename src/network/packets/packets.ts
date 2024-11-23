import { Packet } from '../../enums';
import { CommandRequestPacket } from './command-request';
import { CommandResponsePacket } from './command-response';
import { PlayerMessagePacket } from './player-message';


export const Packets = {
  [Packet.CommandRequest]: CommandRequestPacket,
  [Packet.CommandResponse]: CommandResponsePacket,
  [Packet.PlayerMessage]: PlayerMessagePacket, 
}
