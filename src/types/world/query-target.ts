import type { Vector3 } from '@minecraft/server';

export interface QueryTargetResult {
  dimension: number;
  id: number;
  position: Vector3;
  uniqueId: string;
  yRot: number;
}
