import * as _minecraftserver from '@minecraft/server';

/**
 * Describes how an an item can be moved within a container.
 * 
 * Reference: {@link _minecraftserver.ItemLockMode}
 */
export enum ItemLockMode {
  /**
   * @remarks
   * The item cannot be dropped or crafted with.
   *
   */
  inventory = 'lock_in_inventory',
  /**
   * @remarks
   * The item cannot be moved from its slot, dropped or crafted
   * with.
   *
   */
  slot = 'lock_in_slot',
}