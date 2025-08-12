import { Packet } from '../enums';
import { PlayerTravelledSignal } from '../events';
import {
  NetworkHandler,
  type PlayerTravelledPacket,
  type Connection,
} from '../network';

export class PlayerTravelledHandler extends NetworkHandler {
  public static readonly packet = Packet.PlayerTravelled;

  public handle(packet: PlayerTravelledPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;
    const {
      player: rawPlayer,
      metersTravelled,
      isUnderwater,
      newBiome,
      travelMethod,
    } = packet;
    const player = world.resolvePlayer(rawPlayer.name);

    new PlayerTravelledSignal(
      world,
      isUnderwater,
      metersTravelled,
      newBiome,
      player,
      travelMethod,
      rawPlayer
    ).emit();
  }
}
