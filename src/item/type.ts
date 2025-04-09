import type { WorldItemType } from '../types';

export class ItemType {
  public readonly id: string;

  /** aux value */
  public readonly data: number;

  constructor(type: WorldItemType) {
    this.id = `${type.namespace}:${type.id}`;
    this.data = type.aux;
  }

  public get isAir() {
    return this.id === ':';
  }
}