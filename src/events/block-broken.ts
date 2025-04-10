import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { ItemStack } from '../item';
import type { WorldPlayer } from '../types';
import type { BlockType } from '../block';

export class BlockBrokenSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.BlockBroken;

  public static readonly packets: Packet[] = [Packet.BlockBroken];

  public readonly brokenBlockType: BlockType;

  public readonly destructionMethod: number;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public readonly itemStackBeforeBreak?: ItemStack;

  public constructor(
    world: World,
    brokenBlockType: BlockType,
    destructionMethod: number,
    player: Player,
    rawPlayer: WorldPlayer,
    itemStackBeforeBreak?: ItemStack,
  ) {
    super(world);

    this.brokenBlockType = brokenBlockType;
    this.destructionMethod = destructionMethod;
    this.player = player;
    this.rawPlayer = rawPlayer;
    this.itemStackBeforeBreak = itemStackBeforeBreak;
  }
}
