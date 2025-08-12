import { Packet } from '../enums';
import { ItemTradedSignal } from '../events';
import { ItemStack, ItemType } from '../item';
import {
  NetworkHandler,
  type Connection,
  type ItemTradedPacket,
} from '../network';

export class ItemTradedHandler extends NetworkHandler {
  public static readonly packet = Packet.ItemTraded;

  public handle(packet: ItemTradedPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;
    const {
      itemA,
      itemB,
      player: rawPlayer,
      playerEmeraldCount,
      result,
      trader,
      traderEmeraldCount,
    } = packet;
    const player = world.resolvePlayer(rawPlayer.name);
    const resultItemStack = new ItemStack(result);
    const itemTypeA = new ItemType(itemA);
    const itemTypeB = new ItemType(itemB);

    new ItemTradedSignal(
      world,
      player,
      rawPlayer,
      playerEmeraldCount,
      trader,
      traderEmeraldCount,
      resultItemStack,
      itemTypeA,
      itemTypeB.isAir ? undefined : itemTypeB,
    ).emit();
  }
}
