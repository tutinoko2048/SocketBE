import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldBlock, WorldPlayer } from '../types';

export class PlayerBouncedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerBounced;

  public static readonly packets: Packet[] = [Packet.PlayerBounced];

  public readonly block: WorldBlock;

  public readonly bounceHeight: number;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    block: WorldBlock,
    bounceHeight: number,
    player: Player,
    rawPlayer: WorldPlayer,
  ) {
    super(world);

    this.block = block;
    this.bounceHeight = bounceHeight;
    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
