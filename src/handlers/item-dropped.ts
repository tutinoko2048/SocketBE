import { Packet } from '../enums';
import { ItemDroppedSignal } from '../events';
import {
  NetworkHandler,
  type Connection,
  type ItemDroppedPacket,
} from '../network';

export class ItemDroppedHandler extends NetworkHandler {
  public static readonly packet = Packet.ItemDropped;

  public handle(packet: ItemDroppedPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;

    const { count, item, player: rawPlayer } = packet;
    const player = world.resolvePlayer(rawPlayer.name);

    new ItemDroppedSignal(world, item, count, player, rawPlayer).emit();
  }
}
