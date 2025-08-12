import { MessagePurpose, Packet, type ItemInteractMethod } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldItemStack, WorldPlayer } from '../../types';

@PacketClass(Packet.ItemInteracted, MessagePurpose.Event)
export class ItemInteractedPacket extends BasePacket {
  public count!: number;

  public item!: WorldItemStack;

  public method!: ItemInteractMethod;

  public player!: WorldPlayer;

  public static deserialize(data: Record<string, any>): ItemInteractedPacket {
    const packet = new ItemInteractedPacket();
    packet.count = data.count;
    packet.item = data.item;
    packet.method = data.method;
    packet.player = data.player;
    
    return packet;
  }
}