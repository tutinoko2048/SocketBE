import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldKiller, WorldPlayer } from '../types';

/**
 * Fired when a player dies.
 *
 * @remarks
 * {@link killer} is always filled in, so its presence does not mean something killed the
 * player - see {@link WorldKiller}. Its `type` is a number, not an identifier string; if
 * you need to know what a mob is by name, {@link MobKilledSignal} is the event that
 * carries one.
 */
export class PlayerDiedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerDied;

  public static readonly packets: Packet[] = [Packet.PlayerDied];

  /** Compare against {@link DamageCause}, which lists the 33 measured values. */
  public readonly cause: number;

  public readonly inRaid: boolean;

  public readonly killer: WorldKiller;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    cause: number,
    inRaid: boolean,
    killer: WorldKiller,
    player: Player,
    rawPlayer: WorldPlayer,
  ) {
    super(world);

    this.cause = cause;
    this.inRaid = inRaid;
    this.killer = killer;
    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
