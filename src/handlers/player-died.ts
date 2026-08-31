import { Packet } from '../enums';
import { PlayerDiedSignal } from '../events';
import {
  NetworkHandler,
  type Connection,
  type PlayerDiedPacket,
} from '../network';

export class PlayerDiedHandler extends NetworkHandler {
  public static readonly packet = Packet.PlayerDied;

  public handle(packet: PlayerDiedPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;

    const { cause, inRaid, killer, player: rawPlayer } = packet;
    const player = world.resolvePlayer(rawPlayer.name);

    new PlayerDiedSignal(
      world,
      cause,
      inRaid,
      killer,
      player,
      rawPlayer
    ).emit();
  }
}
