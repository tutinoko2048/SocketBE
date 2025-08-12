import { Packet } from '../enums';
import { MobInteractedSignal } from '../events';
import {
  NetworkHandler,
  type Connection,
  type MobInteractedPacket,
} from '../network';

export class MobInteractedHandler extends NetworkHandler {
  public static readonly packet = Packet.MobInteracted;

  public handle(packet: MobInteractedPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;

    const { interactionType, mob, player: rawPlayer } = packet;
    const player = world.resolvePlayer(rawPlayer.name);

    new MobInteractedSignal(
      world,
      interactionType,
      mob,
      player,
      rawPlayer
    ).emit();
  }
}
