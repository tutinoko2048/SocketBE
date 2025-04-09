/**
 * Reference: {@link https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/world/item/ItemAcquisitionMethod.h}
 */
export enum ItemAcquisitionMethod {
  Pickedup = 1,
  Crafted = 2,
  TakenFromChest = 3,
  TakenFromEnderChest = 4,
  Bought = 5,
  Anvil = 6,
  Smelted = 7,
  Brewed = 8,
  /** buckets */
  Filled = 9,
  Trading = 10,
  Fishing = 11,
  Container = 13,
  Feeding = 14,
}