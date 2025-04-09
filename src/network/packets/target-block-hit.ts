import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldPlayer } from '../../types';

@PacketClass(Packet.TargetBlockHit, MessagePurpose.Event)
export class TargetBlockHitPacket extends BasePacket {
  public player: WorldPlayer;

  public redstoneLevel: number;

  public static deserialize(data: Record<string, any>): TargetBlockHitPacket {
    const packet = new TargetBlockHitPacket();
    packet.player = data.player;
    packet.redstoneLevel = data.redstoneLevel;
    
    return packet;
  }
}