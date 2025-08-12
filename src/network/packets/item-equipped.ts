import { MessagePurpose, Packet, type PlayerEquipmentSlot } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldItemStack, WorldPlayer } from '../../types';

@PacketClass(Packet.ItemEquipped, MessagePurpose.Event)
export class ItemEquippedPacket extends BasePacket {
  public item!: WorldItemStack;

  public player!: WorldPlayer;

  public slot!: PlayerEquipmentSlot;

  public static deserialize(data: Record<string, any>): ItemEquippedPacket {
    const packet = new ItemEquippedPacket();
    packet.item = data.item;
    packet.player = data.player;
    packet.slot = data.slot;
    
    return packet;
  }
}