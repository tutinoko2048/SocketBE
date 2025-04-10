import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldPlayer } from '../types';
import type { BlockType } from '../block';

export class PlayerBouncedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerBounced;

  public static readonly packets: Packet[] = [Packet.PlayerBounced];

  public readonly blockType: BlockType;

  public readonly bounceHeight: number;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    blockType: BlockType,
    bounceHeight: number,
    player: Player,
    rawPlayer: WorldPlayer,
  ) {
    super(world);

    this.blockType = blockType;
    this.bounceHeight = bounceHeight;
    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
