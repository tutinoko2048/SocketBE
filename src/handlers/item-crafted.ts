import { Packet } from '../enums';
import { ItemCraftedSignal } from '../events';
import { ItemStack } from '../item';
import {
  NetworkHandler,
  type Connection,
  type ItemCraftedPacket,
} from '../network';

export class ItemCraftedHandler extends NetworkHandler {
  public static readonly packet = Packet.ItemCrafted;

  public handle(packet: ItemCraftedPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;

    const {
      craftedAutomatically,
      endingTabId,
      hasCraftableFilterOn,
      item,
      numberOfTabsChanged,
      player: rawPlayer,
      recipeBookShown,
      startingTabId,
      usedCraftingTable,
      usedSearchBar,
    } = packet;
    const itemStack = new ItemStack(item);
    const player = world.resolvePlayer(rawPlayer.name);

    new ItemCraftedSignal(
      world,
      craftedAutomatically,
      endingTabId,
      hasCraftableFilterOn,
      itemStack,
      numberOfTabsChanged,
      player,
      rawPlayer,
      recipeBookShown,
      startingTabId,
      usedCraftingTable,
      usedSearchBar,
    ).emit();
  }
}
