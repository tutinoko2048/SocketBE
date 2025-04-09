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
  type: number;
  variant: number;
}

export interface MobQueryResult {
  name: string;
  id: string;
}