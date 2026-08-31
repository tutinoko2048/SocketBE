import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldPlayer } from '../../types';

@PacketClass(Packet.EndOfDay, MessagePurpose.Event)
export class EndOfDayPacket extends BasePacket {
  public player!: WorldPlayer;

  public static deserialize(data: Record<string, any>): EndOfDayPacket {
    const packet = new EndOfDayPacket();
    packet.player = data.player;

    return packet;
  }
}
