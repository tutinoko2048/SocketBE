import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { ItemStack, ItemType } from '../item';
import type { WorldPlayer, WorldVillager } from '../types';

export class ItemTradedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.ItemTraded;

  public static readonly packets: Packet[] = [Packet.ItemTraded];

  public readonly itemTypeA: ItemType;
  
  public readonly itemTypeB?: ItemType;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public readonly playerEmeraldCount: number;

  public readonly receivedItemStack: ItemStack;

  public readonly trader: WorldVillager;

  public readonly traderEmeraldCount: number;

  public constructor(
    world: World,
    player: Player,
    rawPlayer: WorldPlayer,
    playerEmeraldCount: number,
    trader: WorldVillager,
    traderEmeraldCount: number,
    receivedItemStack: ItemStack,
    itemTypeA: ItemType,
    itemTypeB?: ItemType,
  ) {
    super(world);

    this.player = player;
    this.rawPlayer = rawPlayer;
    this.playerEmeraldCount = playerEmeraldCount;
    this.trader = trader;
    this.traderEmeraldCount = traderEmeraldCount;
    this.receivedItemStack = receivedItemStack;
    this.itemTypeA = itemTypeA;
    this.itemTypeB = itemTypeB;
  }
}
