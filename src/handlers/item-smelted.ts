import { Packet } from '../enums';
import { ItemSmeltedSignal } from '../events';
import { ItemType } from '../item';
import {
  NetworkHandler,
  type Connection,
  type ItemSmeltedPacket,
} from '../network';

export class ItemSmeltedHandler extends NetworkHandler {
  public static readonly packet = Packet.ItemSmelted;

  public handle(packet: ItemSmeltedPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection);

    const { fuelSource, item, player: rawPlayer } = packet;
    const fuelItemType = new ItemType(fuelSource);
    const itemType = new ItemType(item);
    const player = world.resolvePlayer(rawPlayer.name);

    new ItemSmeltedSignal(
      world,
      fuelItemType,
      itemType,
      player,
      rawPlayer
    ).emit();
  }
}
