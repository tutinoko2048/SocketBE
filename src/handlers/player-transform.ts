import { Packet } from '../enums';
import { PlayerTransformSignal } from '../events';
import {
  NetworkHandler,
  type PlayerTransformPacket,
  type Connection,
} from '../network';

export class PlayerTransformHandler extends NetworkHandler {
  public static readonly packet = Packet.PlayerTransform;

  public handle(packet: PlayerTransformPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;
    const { player: rawPlayer } = packet;
    const player = world.resolvePlayer(rawPlayer.name);

    new PlayerTransformSignal(world, player, rawPlayer).emit();
  }
}
