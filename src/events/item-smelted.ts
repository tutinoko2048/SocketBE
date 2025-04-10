import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldPlayer } from '../types';
import type { ItemType } from '../item';

export class ItemSmeltedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.ItemSmelted;

  public static readonly packets: Packet[] = [Packet.ItemSmelted];

  public readonly fueledItemType: ItemType;

  /** The result of furnace */
  public readonly smeltedItemType: ItemType;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    fueledItemType: ItemType,
    smeltedItemType: ItemType,
    player: Player,
    rawPlayer: WorldPlayer,
  ) {
    super(world);

    this.fueledItemType = fueledItemType;
    this.smeltedItemType = smeltedItemType;
    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
