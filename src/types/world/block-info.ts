import type { Vector3 } from '@minecraft/server';

export interface BlockInfo {
  /**
   * Identifier of the block without the namespace.
   */
  blockName: string;
  position: Vector3;
}