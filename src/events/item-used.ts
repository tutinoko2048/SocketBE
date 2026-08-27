import { ItemUseMethod, Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldItemType, WorldPlayer } from '../types';

/**
 * Fired when a player uses an item: eating it, firing it, emptying a bucket, and so on.
 *
 * @remarks
 * This is not a replacement for {@link ItemInteractedSignal} - one action can raise both,
 * and they report through different fields ({@link useMethod} here against `method`
 * there). This event also carries only the item's type, without enchantments or stack
 * sizes. Firing a bow raises it twice, once for the bow and once for the arrow.
 */
export class ItemUsedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.ItemUsed;

  public static readonly packets: Packet[] = [Packet.ItemUsed];

  public readonly item: WorldItemType;

  /** How the item was used. */
  public readonly useMethod: ItemUseMethod;

  public readonly count: number;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    item: WorldItemType,
    useMethod: ItemUseMethod,
    count: number,
    player: Player,
    rawPlayer: WorldPlayer,
  ) {
    super(world);

    this.item = item;
    this.useMethod = useMethod;
    this.count = count;
    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
