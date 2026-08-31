/**
 * How an item was used, as reported by {@link ItemUsedSignal.useMethod}.
 *
 * @remarks
 * The member names and values are based on Endstone's `ItemUseMethod` implementation:
 * https://github.com/EndstoneMC/endstone/blob/56065defb20f0f96303325e3e9108c4e6c104043/src/bedrock/world/item/item_helper.h#L19
 *
 * Note that this is a different field from `ItemInteractedPacket.method`, which uses
 * {@link ItemInteractMethod}. Using one item can produce both events at once: a lava
 * bucket poured out gave `ItemInteracted` with `method: 1` and `ItemUsed` with
 * `useMethod: 9` in the same moment.
 */
export enum ItemUseMethod {
  Unknown = -1,
  EquipArmor = 0,
  /** Recorded from eating bread. */
  Eat = 1,
  Attack = 2,
  Consume = 3,
  Throw = 4,
  /** Recorded from firing a bow: the bow and the arrow each produced a frame. */
  Shoot = 5,
  Place = 6,
  FillBottle = 7,
  FillBucket = 8,
  /** Recorded from emptying a lava bucket. */
  PourBucket = 9,
  /** Recorded from a fishing rod and from a shovel. */
  UseTool = 10,
  Interact = 11,
  Retrieved = 12,
  Dyed = 13,
  Traded = 14,
  BrushingCompleted = 15,
  OpenedVault = 16,
}
