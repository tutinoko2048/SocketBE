import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { ItemStack } from '../item';
import type { WorldBlock, WorldPlayer } from '../types';

export class BlockBrokenSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.BlockBroken;

  public static readonly packets: Packet[] = [Packet.BlockBroken];

  public readonly block: WorldBlock;

  public readonly count: number;

  public readonly destructionMethod: number;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public readonly tool?: ItemStack;

  public constructor(
    world: World,
    block: WorldBlock,
    count: number,
    destructionMethod: number,
    player: Player,
    rawPlayer: WorldPlayer,
    tool?: ItemStack,
  ) {
    super(world);

    this.block = block;
    this.count = count;
    this.destructionMethod = destructionMethod;
    this.player = player;
    this.rawPlayer = rawPlayer;
    this.tool = tool;
  }
}
