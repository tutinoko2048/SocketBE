import { MessagePurpose, Packet, type ItemAcquisitionMethod } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldItemType, WorldPlayer } from '../../types';

@PacketClass(Packet.ItemAcquired, MessagePurpose.Event)
export class ItemAcquiredPacket extends BasePacket {  
  public acquisitionMethodId: ItemAcquisitionMethod;

  public count: number;

  public item: WorldItemType;

  public player: WorldPlayer;

  public static deserialize(data: Record<string, any>): ItemAcquiredPacket {
    const packet = new ItemAcquiredPacket();
    packet.acquisitionMethodId = data.acquisitionMethodId;
    packet.count = data.count;
    packet.item = data.item;
    packet.player = data.player;
    
    return packet;
  }
}