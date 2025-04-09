/**
 * Reference: enums/MinecraftEventing::InteractionType
 * {@link https://mojang.github.io/bedrock-protocol-docs/}
 */
export enum MobInteractionType {
  Breeding = 1,
  Taming = 2,
  Curing = 3,
  Crafted = 4,
  Shearing = 5,
  Milking = 6,
  Trading = 7,
  Feeding = 8,
  Igniting = 9,
  Coloring = 10,
  Naming = 11,
  Leashing = 12,
  Unleashing = 13,
  PetSleep = 14,
  Trusting = 15,
  /** pet */
  Commanding = 16,
}
