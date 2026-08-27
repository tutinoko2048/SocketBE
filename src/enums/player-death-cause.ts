/**
 * Values of `PlayerDiedPacket.cause` confirmed against a live client.
 *
 * @remarks
 * Each of these was produced deliberately with `/damage <player> <amount> <cause>` and
 * read back off the resulting `PlayerDied` frame, so every member here is a measured
 * pairing between a Bedrock damage-cause keyword and the number the event reports.
 * {@link EntityAttack} and {@link EntityExplosion} were also seen unprompted, from a
 * zombie and a creeper.
 *
 * The list is still not exhaustive. Bedrock accepts further keywords whose damage landed
 * but did not kill during measurement - `projectile`, `self_destruct`, `piston`, `magma`,
 * `temperature`, `stalactite` and `sonic_boom` among them - and `suffocation` could not be
 * applied at all by command. The packet field is therefore left as a plain `number`:
 * compare against this enum rather than switching exhaustively on it.
 */
export enum PlayerDeathCause {
  /** `contact` - touching something harmful, such as a cactus. */
  Contact = 1,
  /** `entity_attack` - killed by a mob or player. The frame carries that entity as `killer`. */
  EntityAttack = 2,
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
  /** `fly_into_wall` - elytra kinetic damage. */
  FlyIntoWall = 21,
  /** `lightning` */
  Lightning = 24,
  /** `freezing` - powder snow. */
  Freezing = 27,
}
