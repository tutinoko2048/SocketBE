import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldBlock, WorldItemStack, WorldPlayer } from '../../types';

@PacketClass(Packet.BlockPlaced, MessagePurpose.Event)
export class BlockPlacedPacket extends BasePacket {  
  public block: WorldBlock;

  public count: number;

  public placedUnderWater: boolean;
  
  public placementMethod: number;

  public player: WorldPlayer;

  public tool: WorldItemStack;

  public static deserialize(data: Record<string, any>): BlockPlacedPacket {
    const packet = new BlockPlacedPacket();
    packet.block = data.block;
    packet.count = data.count;
    packet.placedUnderWater = data.placedUnderWater;
    packet.placementMethod = data.placementMethod;
    packet.player = data.player;
    packet.tool = data.tool;
    
    return packet;
  }
}