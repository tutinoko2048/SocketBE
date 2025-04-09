import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { ItemStack } from '../item';
import type { WorldBlock, WorldPlayer } from '../types';

export class BlockPlacedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.BlockPlaced;

  public static readonly packets: Packet[] = [Packet.BlockPlaced];

  public readonly block: WorldBlock;

  public readonly count: number;

  public readonly placedUnderwater: boolean;

  public readonly placementMethod: number;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public readonly tool?: ItemStack;

  public constructor(
    world: World,
    block: WorldBlock,
    count: number,
    placedUnderwater: boolean,
    placementMethod: number,
    player: Player,
    rawPlayer: WorldPlayer,
    tool?: ItemStack,
  ) {
    super(world);

    this.block = block;
    this.count = count;
    this.placedUnderwater = placedUnderwater;
    this.placementMethod = placementMethod;
    this.player = player;
    this.rawPlayer = rawPlayer;
    this.tool = tool;
  }
}
