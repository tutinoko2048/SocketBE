import type { Vector3 } from '@minecraft/server';
import type { FillBlocksMode, SetBlockMode } from '../../enums';

export interface IBlock {
  type: string;
  states?: Record<string, string | number | boolean>;
}

export interface BlockInfo {
  /**
   * Identifier of the block without the namespace.
   */
  blockName: string;
  position: Vector3;
}

export interface SetBlockOptions {
  states?: Record<string, string | number | boolean>;
  mode?: SetBlockMode;
}

export type FillBlocksOptions = FillBlocksOptionsDefault | FillBlocksOptionsWithReplace;

export interface FillBlocksOptionsDefault {
  states?: Record<string, string | number | boolean>;
  mode?: FillBlocksMode;
}

export interface FillBlocksOptionsWithReplace extends FillBlocksOptionsDefault {
  mode: FillBlocksMode.Replace;
  replaceBlock: IBlock;
}

export interface IBlockVolume {
  from: Vector3;
  to: Vector3;
}

export interface BlockData {
  aux: number;
  id: string;
  name: string;
}