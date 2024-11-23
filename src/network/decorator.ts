import type { Packet } from '../enums';
import { MessagePurpose } from '../enums';
import type { BasePacket } from './packets';

export function PacketClass(packetId: Packet, purpose: MessagePurpose = MessagePurpose.Event) {
  return (packet: typeof BasePacket) => {
    packet.id = packetId;
    packet.purpose = purpose;

    packet.prototype.getId = function () {
      return packet.id;
    }
    packet.prototype.getPurpose = function () {
      return packet.purpose;
    }
  }
}