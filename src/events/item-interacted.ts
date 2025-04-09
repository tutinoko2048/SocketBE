import { Packet, ServerEvent, type ItemInteractMethod } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { ItemStack } from '../item';
import type { WorldPlayer } from '../types';

export class ItemInteractedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.ItemInteracted;

  public static readonly packets: Packet[] = [Packet.ItemInteracted];

  public readonly item: ItemStack;

  public readonly method: ItemInteractMethod;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    item: ItemStack,
    method: ItemInteractMethod,
    player: Player,
    rawPlayer: WorldPlayer,
  ) {
    super(world);

    this.item = item;
    this.method = method;
    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
