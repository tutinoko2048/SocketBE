/**
 * Values of `PlayerDiedPacket.cause` that have been confirmed against a live client.
 *
 * @remarks
 * This enum is deliberately incomplete. Minecraft has many more damage causes; only the
 * four below were actually produced and recorded, so the packet field stays a `number`
 * and this enum is offered for comparison rather than as an exhaustive mapping. The names
 * follow `ActorDamageCause`, whose ordering these four are consistent with.
 */
export enum PlayerDeathCause {
  /** Killed by a mob or player. Recorded from a zombie. */
  EntityAttack = 2,
  /** Recorded from a fall, with no killer in the frame. */
  Fall = 5,
  /** Recorded from standing in lava, with no killer in the frame. */
  Lava = 8,
  /** Recorded from a mob explosion, with the mob in the frame. */
  EntityExplosion = 11,
}
