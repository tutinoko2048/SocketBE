import type { Vector3 } from '@minecraft/server';

export interface WorldEntity {
  dimension: number;
  id: number;
  position: Vector3;
  type: string;
  variant: number;
  yRot: number;
}

export interface WorldVillager extends WorldEntity {
  trader: {
    name: string;
    tier: number;
  };
}

export interface WorldMob {
  color: number;
  /**
   * Numeric actor type. Compare this value against {@link EntityTypeId}; keep it as a
   * `number` because a server may report a type not yet represented by the enum.
   */
  type: number;
  variant: number;
}

/**
 * The entity that killed a player, as carried by `PlayerDied`.
 *
 * @remarks
 * This is not {@link WorldEntity}: `type` is a number rather than an identifier string,
 * and there is no position. An environmental death still fills the field in rather than
 * omitting it - `{ color: 0, id: 1, type: 1, variant: -1 }` was observed for both a lava
 * death and a fall, so treat that shape as "nobody killed them" rather than as an entity.
 *
 * Compare `type` against {@link EntityTypeId}.
 */
export interface WorldKiller extends WorldMob {
  /** Runtime entity id. `1` when there is no killer. */
  id: number;
}

/**
 * The mob a player killed, as carried by `MobKilled`.
 *
 * @remarks
 * Unlike {@link WorldKiller}, `type` here is an identifier string such as
 * `minecraft:zombie`, so this is the field to read when you want to know what was killed.
 * There is no `name`.
 */
export interface WorldVictim extends WorldEntity {
  color: number;
}

export interface MobQueryResult {
  name: string;
  id: string;
}

/**
 * The mob carried by `EntitySpawned`, which reports only a numeric type.
 *
 * @remarks
 * Narrower than {@link WorldMob}: no colour, no variant. Spawning a chicken by command
 * gave `{ type: 10 }` and nothing else, so there is no position or runtime id to work
 * with - run `querytarget` afterwards if you need one.
 */
export interface WorldMobType {
  /**
   * Numeric actor type. Compare this value against {@link EntityTypeId}; keep it as a
   * `number` because a server may report a type not yet represented by the enum.
   */
  type: number;
}
