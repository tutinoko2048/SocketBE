/**
 * Values of `ItemUsedPacket.useMethod` that have been confirmed against a live client.
 *
 * @remarks
 * This enum is deliberately incomplete: only the four below were actually produced and
 * recorded, so the packet field stays a `number` and this enum is offered for comparison.
 * The names are inferred from the item each value arrived with, not from a published
 * mapping - treat them as labels for the observations rather than as authoritative.
 *
 * Note that this is a different field from `ItemInteractedPacket.method`, which uses
 * {@link ItemInteractMethod}. Using one item can produce both events at once: a lava
 * bucket poured out gave `ItemInteracted` with `method: 1` and `ItemUsed` with
 * `useMethod: 9` in the same moment.
 */
export enum ItemUseMethod {
  /** Recorded from eating bread. */
  Eat = 1,
  /** Recorded from firing a bow: the bow and the arrow each produced a frame. */
  Shoot = 5,
  /** Recorded from emptying a lava bucket. */
  PourBucket = 9,
  /** Recorded from a fishing rod and from a shovel. */
  UseTool = 10,
}
