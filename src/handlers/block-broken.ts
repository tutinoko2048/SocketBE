import { Packet } from '../enums';
import { BlockBrokenSignal } from '../events';
import { ItemStack } from '../item';
import {
  NetworkHandler,
  type Connection,
  type BlockBrokenPacket,
} from '../network';

export class BlockBrokenHandler extends NetworkHandler {
  public static readonly packet = Packet.BlockBroken;

  public handle(packet: BlockBrokenPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection);

    const { block, count, destructionMethod, player: rawPlayer, tool } = packet;
    const player = world.resolvePlayer(rawPlayer.name);
    const itemStack = new ItemStack(tool);

    new BlockBrokenSignal(
      world,
      block,
      count,
      destructionMethod,
      player,
      rawPlayer,
      itemStack.isAir ? undefined : itemStack
    ).emit();
  }
}
