/**
 * Reference: {@link https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/events/player_travelled_event/TravelMethod.h}.
 */
export enum TravelMethod {
  /** Note: this value is not used even if player is walking. Use {@link TravelMethod.Fall} instead. */
  Walk = 0,
  SwimWater = 1,
  Fall = 2,
  Climb = 3,
  SwimLava = 4,
  Fly = 5,
  Riding = 6,
  Sneak = 7,
  Sprint = 8,
  Bounce = 9,
  FrostWalk = 10,
  Teleport = 11,
}
