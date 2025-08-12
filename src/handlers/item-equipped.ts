import { Packet } from '../enums';
import { ItemEquippedSignal } from '../events';
import { ItemStack } from '../item';
import {
  NetworkHandler,
  type Connection,
  type ItemEquippedPacket,
} from '../network';

export class ItemEquippedHandler extends NetworkHandler {
  public static readonly packet = Packet.ItemEquipped;

  public handle(packet: ItemEquippedPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;

    const { item, player: rawPlayer, slot } = packet;
    const itemStack = new ItemStack(item);
    const player = world.resolvePlayer(rawPlayer.name);

    new ItemEquippedSignal(
      world,
      itemStack,
      player,
      rawPlayer,
      slot,
    ).emit();
  }
}
