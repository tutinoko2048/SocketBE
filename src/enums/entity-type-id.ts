/**
 * Numeric entity types, as reported by `PlayerDied.killer.type` and
 * `EntitySpawned.mob.type`.
 *
 * @remarks
 * Bedrock reports an entity by number in some events and by identifier string in others.
 * `MobKilled.victim.type` gives `"minecraft:zombie"`, while the two fields above give
 * `32`. This enum covers the numbers.
 *
 * Each member was measured: the entity was summoned by name and the number read off the
 * resulting `EntitySpawned` frame. Two of them cross-check against deaths that happened
 * on their own - a zombie killing the player reported `killer.type` 32, and a creeper
 * reported 33, matching what `summon zombie` and `summon creeper` produce.
 *
 * This is a small sample of a large enum, so both fields stay plain `number`s. Note also
 * that `EntitySpawned` only fires for mobs: summoning an arrow, a snowball, TNT, a boat or
 * a minecart succeeded without raising it, so those have no number here.
 */
export enum EntityTypeId {
  /**
   * Not an entity. `PlayerDied.killer` is filled in even for an environmental death, and
   * carries `{ color: 0, id: 1, type: 1, variant: -1 }` when nothing did the killing.
   */
  NoKiller = 1,
  Chicken = 10,
  Cow = 11,
  Pig = 12,
  Sheep = 13,
  Wolf = 14,
  Squid = 17,
  Bat = 19,
  Zombie = 32,
  Creeper = 33,
  Skeleton = 34,
  ArmorStand = 61,
  Cat = 75,
  Villager = 115,
}
