import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { ItemStack } from '../item';
import type { WorldPlayer } from '../types';
import type { BlockType } from '../block';

/**
 * Fired when a block is placed, whether by a player or by a command.
 *
 * @remarks
 * A command-driven placement carries no player: `setblock` produces a frame with only
 * `block`, `count`, `placementMethod` and `tool`. {@link player}, {@link rawPlayer} and
 * {@link placedUnderwater} are therefore `undefined` for those, so check `player` before
 * reading it. Note also that `setblock <pos> air` reports as a placement of `air` rather
 * than as a {@link BlockBrokenSignal}, and that `setblock <pos> air destroy` fires nothing
 * at all.
 */
export class BlockPlacedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.BlockPlaced;

  public static readonly packets: Packet[] = [Packet.BlockPlaced];

  public readonly placedBlockType: BlockType;

  /** `undefined` for a command-driven placement. */
  public readonly placedUnderwater?: boolean;

  public readonly placementMethod: number;

  /** The player who placed the block, or `undefined` for a command-driven placement. */
  public readonly player?: Player;

  /** The raw player frame, or `undefined` for a command-driven placement. */
  public readonly rawPlayer?: WorldPlayer;

  public readonly itemStackBeforePlace: ItemStack;

  public constructor(
    world: World,
    placedBlockType: BlockType,
    placedUnderwater: boolean | undefined,
    placementMethod: number,
    player: Player | undefined,
    rawPlayer: WorldPlayer | undefined,
    itemStackBeforePlace: ItemStack,
  ) {
    super(world);

    this.placedBlockType = placedBlockType;
    this.placedUnderwater = placedUnderwater;
    this.placementMethod = placementMethod;
    this.player = player;
    this.rawPlayer = rawPlayer;
    this.itemStackBeforePlace = itemStackBeforePlace;
  }
}
