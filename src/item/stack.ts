import type { Enchantment, WorldItemStack } from '../types';
import { ItemType } from './type';

export class ItemStack {
  public readonly type: ItemType;

  public readonly amount: number;

  public readonly maxAmount: number;

  public readonly enchantments: Enchantment[];

  public constructor(item: WorldItemStack) {
    this.type = new ItemType(item);
    this.amount = item.stackSize;
    this.maxAmount = item.maxStackSize;
    this.enchantments = item.enchantments
  }

  public get isAir() {
    return this.amount === 0;
  }

  public get typeId() {
    return this.type.id;
  }

  /** aux value */
  public get data() {
    return this.type.data;
  }

  public get [Symbol.toStringTag]() {
    return this.typeId;
  }
}