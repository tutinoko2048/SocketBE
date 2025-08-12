import type { Packet } from '../enums';
import type { MessagePurpose } from '../enums';
import type { BasePacket } from './packets';

/**
 * 
 * @param packetId ID of the packet
 * @param purpose Message purpose of the packet. If not provided, you need to overide it in Network::send
 */
export function PacketClass(packetId: Packet, purpose?: MessagePurpose) {
  return (packet: typeof BasePacket) => {
    packet.id = packetId;
    packet.purpose = purpose!;

    packet.prototype.getId = function () {
      return packet.id;
    }
    packet.prototype.getPurpose = function () {
      return packet.purpose;
    }
  }
}