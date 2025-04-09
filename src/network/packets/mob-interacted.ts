import { MessagePurpose, Packet, type MobInteractionType } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldMob, WorldPlayer } from '../../types';

@PacketClass(Packet.MobInteracted, MessagePurpose.Event)
export class MobInteractedPacket extends BasePacket {
  public interactionType: MobInteractionType;

  public mob: WorldMob;

  public player: WorldPlayer;

  public static deserialize(data: Record<string, any>): MobInteractedPacket {
    const packet = new MobInteractedPacket();
    packet.interactionType = data.interactionType;
    packet.mob = data.mob;
    packet.player = data.player;
    
    return packet;
  }
}