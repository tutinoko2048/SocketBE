import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldMobType, WorldPlayer } from '../../types';

@PacketClass(Packet.EntitySpawned, MessagePurpose.Event)
export class EntitySpawnedPacket extends BasePacket {
  /**
   * What was spawned.
   *
   * @remarks
   * Carries a numeric `type` and nothing else - no position, no runtime id. Compare it
   * against {@link EntityTypeId}; run `querytarget` after this fires if you need a
   * position. Only mobs raise this event: summoning an arrow, a snowball, TNT, a boat or
   * a minecart all succeeded without producing a frame.
   */
  public mob!: WorldMobType;

  /**
   * The player the spawn is attributed to.
   *
   * @remarks
   * Present even for a `summon` command, unlike `BlockPlaced`, which drops the player for
   * command-driven placements.
   */
  public player!: WorldPlayer;

  /** A plain number: only `2`, from a `summon` command, has been observed. */
  public spawnType!: number;

  public static deserialize(data: Record<string, any>): EntitySpawnedPacket {
    const packet = new EntitySpawnedPacket();
    packet.mob = data.mob;
    packet.player = data.player;
    packet.spawnType = data.spawnType;

    return packet;
  }
}
