import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { ItemStack, ItemType } from '../item';
import type { WorldPlayer, WorldVillager } from '../types';

export class ItemTradedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.ItemTraded;

  public static readonly packets: Packet[] = [Packet.ItemTraded];

  public readonly itemA: ItemType;
  
  public readonly itemB?: ItemType;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public readonly playerEmeraldCount: number;

  public readonly result: ItemStack;

  public readonly trader: WorldVillager;

  public readonly traderEmeraldCount: number;

  public constructor(
    world: World,
    player: Player,
    rawPlayer: WorldPlayer,
    playerEmeraldCount: number,
    trader: WorldVillager,
    traderEmeraldCount: number,
    result: ItemStack,
    itemA: ItemType,
    itemB?: ItemType,
  ) {
    super(world);

    this.player = player;
    this.rawPlayer = rawPlayer;
    this.playerEmeraldCount = playerEmeraldCount;
    this.trader = trader;
    this.traderEmeraldCount = traderEmeraldCount;
    this.result = result;
    this.itemA = itemA;
    this.itemB = itemB;
  }
}
