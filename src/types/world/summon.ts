import type { Vector3 } from '@minecraft/server';

/** What `summon` reports back. */
export interface SummonResult {
  /** Namespaced identifier, e.g. `minecraft:chicken`. */
  entityType: string;
  spawnPos: Vector3;
  /** The new entity's unique id, as a string. */
  uId: string;
  wasSpawned: boolean;
}
