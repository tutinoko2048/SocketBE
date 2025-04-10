import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldBlockType, WorldItemStack, WorldPlayer } from '../../types';

@PacketClass(Packet.BlockBroken, MessagePurpose.Event)
export class BlockBrokenPacket extends BasePacket {  
  public block: WorldBlockType;

  public count: number;

  public destructionMethod: number;

  public player: WorldPlayer;

  public tool: WorldItemStack;

  public variant: number;

  public static deserialize(data: Record<string, any>): BlockBrokenPacket {
    const packet = new BlockBrokenPacket();
    packet.block = data.block;
    packet.count = data.count;
    packet.destructionMethod = data.destructionMethod;
    packet.player = data.player;
    packet.tool = data.tool;
    packet.variant = data.variant;
    
    return packet;
  }
}