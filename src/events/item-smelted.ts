import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldPlayer } from '../types';
import type { ItemType } from '../item';

export class ItemSmeltedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.ItemSmelted;

  public static readonly packets: Packet[] = [Packet.ItemSmelted];

  public readonly fuelSource: ItemType;

  public readonly itemType: ItemType;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    fuelSource: ItemType,
    itemType: ItemType,
    player: Player,
    rawPlayer: WorldPlayer,
  ) {
    super(world);

    this.fuelSource = fuelSource;
    this.itemType = itemType;
    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
