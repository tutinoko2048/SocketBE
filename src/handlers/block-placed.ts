import { BlockType } from '../block';
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
    const world = this.server.getWorldByConnection(connection)!;

    const {
      block: rawBlock,
      placedUnderWater,
      placementMethod,
      player: rawPlayer,
      tool,
    } = packet;
    const block = new BlockType(rawBlock);
    // A command-driven placement carries no player, so this cannot be resolved
    // unconditionally: reading `rawPlayer.name` threw for every `setblock`, and the
    // network layer caught that and dropped the event without emitting a signal.
    const player = rawPlayer ? world.resolvePlayer(rawPlayer.name) : undefined;
    const itemStackBeforePlace = new ItemStack(tool);

    new BlockPlacedSignal(
      world,
      block,
      placementMethod,
      placedUnderWater,
      player,
      rawPlayer,
      itemStackBeforePlace.isAir ? undefined : itemStackBeforePlace
    ).emit();
  }
}
