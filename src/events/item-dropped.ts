import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldItemType, WorldPlayer } from '../types';

/**
 * Fired when a player drops an item.
 *
 * @remarks
 * Carries only the item's type, without enchantments or stack sizes, the same shape
 * {@link ItemUsedSignal} uses.
 */
export class ItemDroppedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.ItemDropped;

  public static readonly packets: Packet[] = [Packet.ItemDropped];

  public readonly item: WorldItemType;

  public readonly count: number;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    item: WorldItemType,
    count: number,
    player: Player,
    rawPlayer: WorldPlayer,
  ) {
    super(world);

    this.item = item;
    this.count = count;
    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
