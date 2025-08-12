import { Packet } from '../enums';
import { ItemAcquiredSignal } from '../events';
import { ItemType } from '../item';
import { NetworkHandler, type Connection, type ItemAcquiredPacket } from '../network';

export class ItemAcquiredHandler extends NetworkHandler {
  public static readonly packet = Packet.ItemAcquired;

  public handle(packet: ItemAcquiredPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;

    const { acquisitionMethodId, count, item, player: rawPlayer } = packet;
    const player = world.resolvePlayer(rawPlayer.name);
    const itemType = new ItemType(item);

    new ItemAcquiredSignal(
      world,
      acquisitionMethodId,
      count,
      itemType,
      player,
      rawPlayer
    ).emit();
  }
}
