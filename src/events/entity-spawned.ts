import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldMobType, WorldPlayer } from '../types';

/**
 * Fired when an entity is spawned.
 *
 * @remarks
 * {@link mob} is only a numeric type - there is no position and no runtime id, so this
 * says what appeared but not where. Run `querytarget` if you need to find it.
 *
 * A `summon` command raises this and still attributes it to a player, which is the
 * opposite of {@link BlockPlacedSignal}, where a command-driven placement arrives with no
 * player at all.
 */
export class EntitySpawnedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.EntitySpawned;

  public static readonly packets: Packet[] = [Packet.EntitySpawned];

  public readonly mob: WorldMobType;

  /** A plain number: only `2`, from a `summon` command, has been confirmed. */
  public readonly spawnType: number;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    mob: WorldMobType,
    spawnType: number,
    player: Player,
    rawPlayer: WorldPlayer,
  ) {
    super(world);

    this.mob = mob;
    this.spawnType = spawnType;
    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
