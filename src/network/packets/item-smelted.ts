import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldItemType, WorldPlayer } from '../../types';

@PacketClass(Packet.ItemSmelted, MessagePurpose.Event)
export class ItemSmeltedPacket extends BasePacket {
  public fuelSource!: WorldItemType;

  public item!: WorldItemType;

  public player!: WorldPlayer;

  public static deserialize(data: Record<string, any>): ItemSmeltedPacket {
    const packet = new ItemSmeltedPacket();
    packet.fuelSource = data.fuelSource;
    packet.item = data.item;
    packet.player = data.player;
    
    return packet;
  }
}