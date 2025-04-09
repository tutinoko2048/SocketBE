import { Packet, ServerEvent, type TeleportationCause } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldPlayer } from '../types';

export class PlayerTeleportedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerTeleported;

  public static readonly packets: Packet[] = [Packet.PlayerTeleported];

  public readonly cause: TeleportationCause;

  public readonly itemType: number;

  public readonly metersTravelled: number;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    cause: TeleportationCause,
    itemType: number,
    metersTravelled: number,
    player: Player,
    rawPlayer: WorldPlayer,
  ) {
    super(world);

    this.cause = cause;
    this.itemType = itemType;
    this.metersTravelled = metersTravelled;
    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
