import { Packet } from '../enums';
import { TargetBlockHitSignal } from '../events';
import {
  NetworkHandler,
  type Connection,
  type TargetBlockHitPacket,
} from '../network';

export class TargetBlockHitHandler extends NetworkHandler {
  public static readonly packet = Packet.TargetBlockHit;

  public handle(packet: TargetBlockHitPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection);

    const { player: rawPlayer, redstoneLevel } = packet;
    const player = world.resolvePlayer(rawPlayer.name);

    new TargetBlockHitSignal(world, player, rawPlayer, redstoneLevel).emit();
  }
}
