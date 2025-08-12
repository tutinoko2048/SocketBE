import { Packet } from '../enums';
import { PlayerTeleportedSignal } from '../events';
import {
  NetworkHandler,
  type Connection,
  type PlayerTeleportedPacket,
} from '../network';

export class PlayerTeleportedHandler extends NetworkHandler {
  public static readonly packet = Packet.PlayerTeleported;

  public handle(packet: PlayerTeleportedPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;

    const { cause, itemType, metersTravelled, player: rawPlayer } = packet;
    const player = world.resolvePlayer(rawPlayer.name);

    new PlayerTeleportedSignal(
      world,
      cause,
      itemType,
      metersTravelled,
      player,
      rawPlayer
    ).emit();
  }
}
