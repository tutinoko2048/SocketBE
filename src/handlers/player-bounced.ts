import { Packet } from '../enums';
import { PlayerBouncedSignal } from '../events';
import {
  NetworkHandler,
  type Connection,
  type PlayerBouncedPacket,
} from '../network';

export class PlayerBouncedHandler extends NetworkHandler {
  public static readonly packet = Packet.PlayerBounced;

  public handle(packet: PlayerBouncedPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection);

    const { block, bounceHeight, player: rawPlayer } = packet;
    const player = world.resolvePlayer(rawPlayer.name);

    new PlayerBouncedSignal(
      world,
      block,
      bounceHeight,
      player,
      rawPlayer
    ).emit();
  }
}
