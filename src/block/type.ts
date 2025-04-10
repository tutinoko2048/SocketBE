import type { WorldBlockType } from '../types';

export class BlockType {
  public readonly id: string;

  public readonly data: number;

  public constructor(type: WorldBlockType) {
    this.id = `${type.namespace}:${type.id}`;
    this.data = type.aux;
  }

  public get isAir() {
    return this.id === ':';
  }
}