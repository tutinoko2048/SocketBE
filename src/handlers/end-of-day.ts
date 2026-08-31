import { Packet } from '../enums';
import { EndOfDaySignal } from '../events';
import {
  NetworkHandler,
  type Connection,
  type EndOfDayPacket,
} from '../network';

export class EndOfDayHandler extends NetworkHandler {
  public static readonly packet = Packet.EndOfDay;

  public handle(packet: EndOfDayPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;

    const { player: rawPlayer } = packet;
    const player = world.resolvePlayer(rawPlayer.name);

    new EndOfDaySignal(world, player, rawPlayer).emit();
  }
}
