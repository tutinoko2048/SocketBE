import { BlockPlacementMethod, Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { ItemStack } from '../item';
import type { WorldPlayer } from '../types';
import type { BlockType } from '../block';

/**
 * Fired when a block is placed by a player or a command.
 *
 * @remarks
 * Use {@link placementMethod} to determine which placement data is available.
 * When it is {@link BlockPlacementMethod.Command}, {@link placedUnderwater},
 * {@link player}, {@link rawPlayer}, and {@link itemStackBeforePlace} are `undefined`.
 *
 * `setblock <pos> air` is reported as a placement of `air`, rather than as a
 * {@link BlockBrokenSignal}. `setblock <pos> air destroy` does not fire either event.
 */
export class BlockPlacedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.BlockPlaced;

  public static readonly packets: Packet[] = [Packet.BlockPlaced];

  /** The type of block that was placed. */
  public readonly placedBlockType: BlockType;

  /** How the block was placed. Determines which placement data is available. */
  public readonly placementMethod: BlockPlacementMethod;

  /** Whether the block was placed underwater, or `undefined` for a command placement. */
  public readonly placedUnderwater?: boolean;

  /** The player who placed the block, or `undefined` for a command placement. */
  public readonly player?: Player;

  /** The raw player data, or `undefined` for a command placement. */
  public readonly rawPlayer?: WorldPlayer;

  /** The item held before the block was placed, or `undefined` for a command placement. */
  public readonly itemStackBeforePlace?: ItemStack;

  public constructor(
    world: World,
    placedBlockType: BlockType,
    placementMethod: BlockPlacementMethod,
    placedUnderwater?: boolean,
    player?: Player,
    rawPlayer?: WorldPlayer,
    itemStackBeforePlace?: ItemStack,
  ) {
    super(world);

    this.placedBlockType = placedBlockType;
    this.placementMethod = placementMethod;
    this.placedUnderwater = placedUnderwater;
    this.player = player;
    this.rawPlayer = rawPlayer;
    this.itemStackBeforePlace = itemStackBeforePlace;
  }
}
