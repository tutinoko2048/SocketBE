import { Packet } from '../enums';
import { ItemUsedSignal } from '../events';
import {
  NetworkHandler,
  type Connection,
  type ItemUsedPacket,
} from '../network';

export class ItemUsedHandler extends NetworkHandler {
  public static readonly packet = Packet.ItemUsed;

  public handle(packet: ItemUsedPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;

    const { count, item, player: rawPlayer, useMethod } = packet;
    const player = world.resolvePlayer(rawPlayer.name);

    new ItemUsedSignal(
      world,
      item,
      useMethod,
      count,
      player,
      rawPlayer
    ).emit();
  }
}
