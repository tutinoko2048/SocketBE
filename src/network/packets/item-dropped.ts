import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldItemType, WorldPlayer } from '../../types';

@PacketClass(Packet.ItemDropped, MessagePurpose.Event)
export class ItemDroppedPacket extends BasePacket {
  public count!: number;

  /**
   * The item that was dropped.
   *
   * @remarks
   * Only {@link WorldItemType}, as with `ItemUsed`: no enchantments, no stack sizes.
   */
  public item!: WorldItemType;

  public player!: WorldPlayer;

  public static deserialize(data: Record<string, any>): ItemDroppedPacket {
    const packet = new ItemDroppedPacket();
    packet.count = data.count;
    packet.item = data.item;
    packet.player = data.player;

    return packet;
  }
}
