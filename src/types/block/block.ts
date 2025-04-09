import type { Vector3 } from '@minecraft/server';
import type { FillBlocksMode, SetBlockMode } from '../../enums';

export interface WorldBlock {
  aux: number;
  id: string;
  namespace: string;
}

export interface IBlock {
  type: string;
  states?: Record<string, string | number | boolean>;
}

export interface TopSolidBlockResult {
  /**
   * Identifier of the block without the namespace.
   */
  blockName: string;
  location: Vector3;
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

export interface BlockQueryResult {
  aux: number;
  id: string;
  name: string;
}