import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldPlayer } from '../types';
import type { ItemStack } from '../item';

export class ItemCraftedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.ItemCrafted;

  public static readonly packets: Packet[] = [Packet.ItemCrafted];

  /** Whether the item was crafted with crafting tab */
  public readonly craftedAutomatically: boolean;

  /** Current crafting tab index */
  public readonly endingTabId: number;

  public readonly hasCraftableFilterOn: boolean;

  public readonly item: ItemStack;

  public readonly numberOfTabsChanged: number;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public readonly recipeBookShown: boolean;

  /** Previous crafting tab index */
  public readonly startingTabId: number;

  public readonly usedCraftingTable: boolean;

  public readonly usedSearchBar: boolean;

  public constructor(
    world: World,
    craftedAutomatically: boolean,
    endingTabId: number,
    hasCraftableFilterOn: boolean,
    item: ItemStack,
    numberOfTabsChanged: number,
    player: Player,
    rawPlayer: WorldPlayer,
    recipeBookShown: boolean,
    startingTabId: number,
    usedCraftingTable: boolean,
    usedSearchBar: boolean,
  ) {
    super(world);

    this.craftedAutomatically = craftedAutomatically;
    this.endingTabId = endingTabId;
    this.hasCraftableFilterOn = hasCraftableFilterOn;
    this.item = item;
    this.numberOfTabsChanged = numberOfTabsChanged;
    this.player = player;
    this.rawPlayer = rawPlayer;
    this.recipeBookShown = recipeBookShown;
    this.startingTabId = startingTabId;
    this.usedCraftingTable = usedCraftingTable;
    this.usedSearchBar = usedSearchBar;
  }
}
