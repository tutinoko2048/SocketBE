import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldBlockType, WorldPlayer } from '../../types';

@PacketClass(Packet.PlayerBounced, MessagePurpose.Event)
export class PlayerBouncedPacket extends BasePacket {
  public block!: WorldBlockType;

  public bounceHeight!: number;

  public player!: WorldPlayer;

  public static deserialize(data: Record<string, any>): PlayerBouncedPacket {
    const packet = new PlayerBouncedPacket();
    packet.block = data.block;
    packet.bounceHeight = data.bounceHeight;
    packet.player = data.player;
    
    return packet;
  }
}