import type { EnchantmentType } from '../../enums';

export interface WorldItemType {
  aux: number;
  id: string;
  namespace: string;
}

export interface WorldItemStack extends WorldItemType {
  enchantments: Enchantment[];
  freeStackSize: number;
  maxStackSize: number;
  stackSize: number;
}

export interface Enchantment {
  level: number;
  name: string;
  type: EnchantmentType;
}

export interface ItemQueryResult {
  aux: number;
  id: string;
  name: string;
}
