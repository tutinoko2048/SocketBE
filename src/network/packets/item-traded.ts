import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldItemStack, WorldItemType, WorldPlayer, WorldVillager } from '../../types';

@PacketClass(Packet.ItemTraded, MessagePurpose.Event)
export class ItemTradedPacket extends BasePacket {
  public itemA: WorldItemType;

  public itemB: WorldItemType;

  public player: WorldPlayer;

  public playerEmeraldCount: number;

  public result: WorldItemStack;

  public trader: WorldVillager;

  public traderEmeraldCount: number;

  public static deserialize(data: Record<string, any>): ItemTradedPacket {
    const packet = new ItemTradedPacket();
    packet.itemA = data.itemA;
    packet.itemB = data.itemB;
    packet.player = data.player;
    packet.playerEmeraldCount = data.playerEmeraldCount;
    packet.result = data.result;
    packet.trader = data.trader;
    packet.traderEmeraldCount = data.traderEmeraldCount;
    
    return packet;
  }
}