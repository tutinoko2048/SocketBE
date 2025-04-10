import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { ItemStack } from '../item';
import type { WorldPlayer } from '../types';
import type { BlockType } from '../block';

export class BlockPlacedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.BlockPlaced;

  public static readonly packets: Packet[] = [Packet.BlockPlaced];

  public readonly placedBlockType: BlockType;

  public readonly placedUnderwater: boolean;

  public readonly placementMethod: number;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public readonly itemStackBeforePlace: ItemStack;

  public constructor(
    world: World,
    placedBlockType: BlockType,
    placedUnderwater: boolean,
    placementMethod: number,
    player: Player,
    rawPlayer: WorldPlayer,
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
