/**
 * How damage was dealt, as reported by `PlayerDied.cause` and `MobKilled.killMethodType`.
 *
 * @remarks
 * Every member below was measured, not read off a table. Each was produced with
 * `/damage <target> 200 <keyword>` against a live 1.21 client and the resulting number
 * read back off the event, so the names here are the Bedrock keywords that actually
 * produce them.
 *
 * The two events share this numbering. `PlayerDied.cause` and
 * `MobKilled.killMethodType` were driven through the same set of keywords and returned
 * the same numbers for each - `entity_attack` gave 2 on both, `projectile` gave 3 on both,
 * and so on through the ten that were cross-checked.
 *
 * Two keywords Bedrock accepts are missing because they could not be made lethal by
 * command: `suffocation`, which the client refused outright (its response reported
 * `unhurtActors`), and `soot_campfire`, which the parser rejected. The event fields stay
 * plain `number`s for that reason - compare against this enum rather than assuming it
 * covers every value a client can send.
 */
export enum DamageCause {
  /** `none` - reported as -1. */
  None = -1,
  /** `override` */
  Override = 0,
  /** `contact` - touching something harmful, such as a cactus. */
  Contact = 1,
  /** `entity_attack` - a mob or player. The frame names that entity. */
  EntityAttack = 2,
  /** `projectile` */
  Projectile = 3,
  /** `fall` */
  Fall = 5,
  /** `fire` - standing in fire. */
  Fire = 6,
  /** `fire_tick` - burning over time. */
  FireTick = 7,
  /** `lava` */
  Lava = 8,
  /** `drowning` */
  Drowning = 9,
  /** `block_explosion` - TNT and the like. */
  BlockExplosion = 10,
  /** `entity_explosion` - a creeper, for instance. */
  EntityExplosion = 11,
  /** `void` - falling out of the world. */
  Void = 12,
  /** `self_destruct` */
  SelfDestruct = 13,
  /** `magic` - instant damage and similar effects. */
  Magic = 14,
  /** `wither` - the wither effect. */
  Wither = 15,
  /** `starve` */
  Starve = 16,
  /** `anvil` - a falling anvil. */
  Anvil = 17,
  /** `thorns` */
  Thorns = 18,
  /** `falling_block` - gravel, sand, and so on. */
  FallingBlock = 19,
  /** `piston` */
  Piston = 20,
  /** `fly_into_wall` - elytra kinetic damage. */
  FlyIntoWall = 21,
  /** `magma` - a magma block. */
  Magma = 22,
  /** `fireworks` */
  Fireworks = 23,
  /** `lightning` */
  Lightning = 24,
  /** `charging` */
  Charging = 25,
  /** `temperature` - powder snow's freezing damage source. */
  Temperature = 26,
  /** `freezing` */
  Freezing = 27,
  /** `stalactite` - a falling pointed dripstone. */
  Stalactite = 28,
  /** `stalagmite` - landing on pointed dripstone. */
  Stalagmite = 29,
  /** `ram_attack` - a goat. */
  RamAttack = 30,
  /** `sonic_boom` - a warden. */
  SonicBoom = 31,
  /** `campfire` */
  Campfire = 32,
}
