import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldPlayer } from '../../types';

@PacketClass(Packet.PlayerTransform, MessagePurpose.Event)
export class PlayerTransformPacket extends BasePacket {

  public player!: WorldPlayer;

  public static deserialize(data: Record<string, any>): PlayerTransformPacket {
    const packet = new PlayerTransformPacket();
    packet.player = data.player;

    return packet;
  }
}