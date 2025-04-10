import { Packet, ServerEvent, type ItemAcquisitionMethod } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldPlayer } from '../types';
import type { ItemType } from '../item';

export class ItemAcquiredSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.ItemAcquired;

  public static readonly packets: Packet[] = [Packet.ItemAcquired];

  public readonly acquisitionMethod: ItemAcquisitionMethod;

  public readonly acquiredAmount: number;

  public readonly itemType: ItemType;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    acquisitionMethod: ItemAcquisitionMethod,
    acquiredAmount: number,
    itemType: ItemType,
    player: Player,
    rawPlayer: WorldPlayer,
  ) {
    super(world);

    this.acquisitionMethod = acquisitionMethod;
    this.acquiredAmount = acquiredAmount;
    this.itemType = itemType;
    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
