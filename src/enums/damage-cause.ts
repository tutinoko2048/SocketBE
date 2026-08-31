/**
 * How damage was dealt, as reported by `PlayerDied.cause` and `MobKilled.killMethodType`.
 *
 * @remarks
 * The member names and values are based on Endstone's `ActorDamageCause` implementation:
 * https://github.com/EndstoneMC/endstone/blob/56065defb20f0f96303325e3e9108c4e6c104043/src/bedrock/world/actor/actor_damage_cause.h
 *
 * Values from `None` through `Campfire`, except `Suffocation`, were also verified with
 * `/damage <target> 200 <keyword>` against a live client. Ten of those causes were
 * cross-checked against both events and produced the same numbers.
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
  /** Suffocation inside a solid block. */
  Suffocation = 4,
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
  /** Soul campfire damage. */
  SoulCampfire = 33,
  /** Damage dealt by a mace smash attack. */
  MaceSmash = 34,
}
