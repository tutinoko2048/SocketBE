import { Packet } from '../enums';
import { EntitySpawnedSignal } from '../events';
import {
  NetworkHandler,
  type Connection,
  type EntitySpawnedPacket,
} from '../network';

export class EntitySpawnedHandler extends NetworkHandler {
  public static readonly packet = Packet.EntitySpawned;

  public handle(packet: EntitySpawnedPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;

    const { mob, player: rawPlayer, spawnType } = packet;
    const player = world.resolvePlayer(rawPlayer.name);

    new EntitySpawnedSignal(world, mob, spawnType, player, rawPlayer).emit();
  }
}
