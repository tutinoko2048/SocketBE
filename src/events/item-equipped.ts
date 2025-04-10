import { Packet, ServerEvent, type PlayerEquipmentSlot } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { ItemStack } from '../item';
import type { WorldPlayer } from '../types';

export class ItemEquippedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.ItemEquipped;

  public static readonly packets: Packet[] = [Packet.ItemEquipped];

  public readonly itemStack: ItemStack;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public readonly slot: PlayerEquipmentSlot;

  public constructor(
    world: World,
    itemStack: ItemStack,
    player: Player,
    rawPlayer: WorldPlayer,
    slot: PlayerEquipmentSlot,
  ) {
    super(world);

    this.itemStack = itemStack;
    this.player = player;
    this.rawPlayer = rawPlayer;
    this.slot = slot;
  }
}
