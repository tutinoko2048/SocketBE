import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldPlayer } from '../types';

export class TargetBlockHitSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.TargetBlockHit;

  public static readonly packets: Packet[] = [Packet.TargetBlockHit];

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public readonly redstoneLevel: number;

  public constructor(
    world: World,
    player: Player,
    rawPlayer: WorldPlayer,
    redstoneLevel: number,
  ) {
    super(world);

    this.player = player;
    this.rawPlayer = rawPlayer;
    this.redstoneLevel = redstoneLevel;
  }
}
