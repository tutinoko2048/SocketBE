import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldPlayer } from '../types';

/**
 * Fired when an in-game day ends.
 *
 * @remarks
 * The frame carries a player, so this arrives per player rather than once for the world.
 */
export class EndOfDaySignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.EndOfDay;

  public static readonly packets: Packet[] = [Packet.EndOfDay];

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(world: World, player: Player, rawPlayer: WorldPlayer) {
    super(world);

    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
