import { BlockType } from '../block';
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
    const world = this.server.getWorldByConnection(connection)!;

    const { block: rawBlock, bounceHeight, player: rawPlayer } = packet;
    const block = new BlockType(rawBlock);
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
