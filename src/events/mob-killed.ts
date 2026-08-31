import { DamageCause, Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { ItemStack } from '../item';
import type { WorldPlayer, WorldVictim } from '../types';

/** The killer's armour at the moment of the kill. A slot with nothing in it is `undefined`. */
export interface MobKilledArmor {
  head?: ItemStack;
  torso?: ItemStack;
  legs?: ItemStack;
  feet?: ItemStack;
  body?: ItemStack;
}

/**
 * Fired when a player kills a mob.
 *
 * @remarks
 * {@link victim} carries an identifier string such as `minecraft:zombie`, which makes this
 * the practical event for "what did they kill". Contrast {@link PlayerDiedSignal}, whose
 * killer is identified only by a number.
 */
export class MobKilledSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.MobKilled;

  public static readonly packets: Packet[] = [Packet.MobKilled];

  public readonly victim: WorldVictim;

  /** `undefined` when the player was empty-handed. */
  public readonly weapon?: ItemStack;

  /**
   * The five armour slots, regrouped from the flat `armorHead` .. `armorBody` fields on
   * the wire. Empty slots are dropped rather than surfaced as empty stacks.
   */
  public readonly armor: MobKilledArmor;

  /** `false` for a passive mob such as a sheep. */
  public readonly isMonster: boolean;

  /** Shares the numbering of `PlayerDied.cause`. Compare against {@link DamageCause}. */
  public readonly killMethodType: DamageCause;

  public readonly playerIsHiddenFrom: boolean;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    victim: WorldVictim,
    armor: MobKilledArmor,
    isMonster: boolean,
    killMethodType: DamageCause,
    playerIsHiddenFrom: boolean,
    player: Player,
    rawPlayer: WorldPlayer,
    weapon?: ItemStack,
  ) {
    super(world);

    this.victim = victim;
    this.weapon = weapon;
    this.armor = armor;
    this.isMonster = isMonster;
    this.killMethodType = killMethodType;
    this.playerIsHiddenFrom = playerIsHiddenFrom;
    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
