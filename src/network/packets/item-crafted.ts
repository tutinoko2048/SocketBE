import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldItemStack, WorldPlayer } from '../../types';

@PacketClass(Packet.ItemCrafted, MessagePurpose.Event)
export class ItemCraftedPacket extends BasePacket {
  public count: number;

  /** Whether the item was crafted with crafting tab */
  public craftedAutomatically: boolean;

  /** Current crafting tab index */
  public endingTabId: number;

  public hasCraftableFilterOn: boolean;

  public item: WorldItemStack;

  public numberOfTabsChanged: number;

  public player: WorldPlayer;

  public recipeBookShown: boolean;

  /** Previous crafting tab index */
  public startingTabId: number;

  public usedCraftingTable: boolean;

  public usedSearchBar: boolean;

  public static deserialize(data: Record<string, any>): ItemCraftedPacket {
    const packet = new ItemCraftedPacket();
    packet.count = data.count;
    packet.craftedAutomatically = data.craftedAutomatically;
    packet.endingTabId = data.endingTabId;
    packet.hasCraftableFilterOn = data.hasCraftableFilterOn;
    packet.item = data.item;
    packet.numberOfTabsChanged = data.numberOfTabsChanged;
    packet.player = data.player;
    packet.recipeBookShown = data.recipeBookShown;
    packet.startingTabId = data.startingTabId;
    packet.usedCraftingTable = data.usedCraftingTable;
    packet.usedSearchBar = data.usedSearchBar;
    
    return packet;
  }
}