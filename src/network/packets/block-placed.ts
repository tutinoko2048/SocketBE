import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldBlockType, WorldItemStack, WorldPlayer } from '../../types';

@PacketClass(Packet.BlockPlaced, MessagePurpose.Event)
export class BlockPlacedPacket extends BasePacket {  
  public block!: WorldBlockType;

  public count!: number;

  /** Absent on a command-driven placement, along with {@link player}. */
  public placedUnderWater?: boolean;

  public placementMethod!: number;

  /**
   * The player who placed the block, or `undefined` when no player was involved.
   *
   * @remarks
   * `setblock` fires this event with only `block`, `count`, `placementMethod` and `tool`.
   * The field is not `null` in that case, it is missing from the frame entirely.
   */
  public player?: WorldPlayer;

  public tool!: WorldItemStack;

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