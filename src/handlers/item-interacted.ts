import { Packet } from '../enums';
import { ItemInteractedSignal } from '../events';
import { ItemStack } from '../item';
import {
  NetworkHandler,
  type Connection,
  type ItemInteractedPacket,
} from '../network';

export class ItemInteractedHandler extends NetworkHandler {
  public static readonly packet = Packet.ItemInteracted;

  public handle(packet: ItemInteractedPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection);

    const { item, method, player: rawPlayer } = packet;
    const itemStack = new ItemStack(item);
    const player = world.resolvePlayer(rawPlayer.name);

    new ItemInteractedSignal(
      world,
      itemStack,
      method,
      player,
      rawPlayer
    ).emit();
  }
}
