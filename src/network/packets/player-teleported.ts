import { MessagePurpose, Packet, type TeleportationCause } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldPlayer } from '../../types';

@PacketClass(Packet.PlayerTeleported, MessagePurpose.Event)
export class PlayerTeleportedPacket extends BasePacket {
  public cause: TeleportationCause;

  public itemType: number;

  public metersTravelled: number;

  public player: WorldPlayer;

  public static deserialize(data: Record<string, any>): PlayerTeleportedPacket {
    const packet = new PlayerTeleportedPacket();
    packet.cause = data.cause;
    packet.itemType = data.itemType;
    packet.metersTravelled = data.metersTravelled;
    packet.player = data.player;
    
    return packet;
  }
}