import { Packet } from '../enums';
import { BlockPlacedSignal } from '../events';
import { ItemStack } from '../item';
import {
  NetworkHandler,
  type Connection,
  type BlockPlacedPacket,
} from '../network';

export class BlockPlacedHandler extends NetworkHandler {
  public static readonly packet = Packet.BlockPlaced;

  public handle(packet: BlockPlacedPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection);

    const {
      block,
      count,
      placedUnderWater,
      placementMethod,
      player: rawPlayer,
      tool,
    } = packet;
    const player = world.resolvePlayer(rawPlayer.name);
    const itemStack = new ItemStack(tool);

    new BlockPlacedSignal(
      world,
      block,
      count,
      placedUnderWater,
      placementMethod,
      player,
      rawPlayer,
      itemStack.isAir ? undefined : itemStack
    ).emit();
  }
}
