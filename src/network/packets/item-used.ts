import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldItemType, WorldPlayer } from '../../types';

@PacketClass(Packet.ItemUsed, MessagePurpose.Event)
export class ItemUsedPacket extends BasePacket {
  public count!: number;

  /**
   * The item that was used.
   *
   * @remarks
   * Only {@link WorldItemType}, not a full stack: unlike `ItemInteracted`, this event
   * carries no enchantments or stack sizes.
   */
  public item!: WorldItemType;

  public player!: WorldPlayer;

  /**
   * How the item was used.
   *
   * @remarks
   * The raw packet value. {@link ItemUsedSignal.useMethod} exposes it as an
   * {@link ItemUseMethod}. This is a different field from `ItemInteractedPacket.method`;
   * one action can produce both events.
   */
  public useMethod!: number;

  public static deserialize(data: Record<string, any>): ItemUsedPacket {
    const packet = new ItemUsedPacket();
    packet.count = data.count;
    packet.item = data.item;
    packet.player = data.player;
    packet.useMethod = data.useMethod;

    return packet;
  }
}
