import { Packet } from '../enums';
import { MobKilledSignal } from '../events';
import { ItemStack } from '../item';
import {
  NetworkHandler,
  type Connection,
  type MobKilledPacket,
} from '../network';
import type { WorldItemStack } from '../types';

/**
 * An empty equipment slot arrives as a stack with no id and `stackSize: 0` rather than
 * being left out, so drop those instead of handing callers a stack of nothing.
 */
function toItemStack(raw: WorldItemStack): ItemStack | undefined {
  const itemStack = new ItemStack(raw);
  return itemStack.isAir ? undefined : itemStack;
}

export class MobKilledHandler extends NetworkHandler {
  public static readonly packet = Packet.MobKilled;

  public handle(packet: MobKilledPacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection)!;

    const {
      armorBody,
      armorFeet,
      armorHead,
      armorLegs,
      armorTorso,
      isMonster,
      killMethodType,
      player: rawPlayer,
      playerIsHiddenFrom,
      victim,
      weapon,
    } = packet;
    const player = world.resolvePlayer(rawPlayer.name);

    new MobKilledSignal(
      world,
      victim,
      toItemStack(weapon),
      {
        head: toItemStack(armorHead),
        torso: toItemStack(armorTorso),
        legs: toItemStack(armorLegs),
        feet: toItemStack(armorFeet),
        body: toItemStack(armorBody),
      },
      isMonster,
      killMethodType,
      playerIsHiddenFrom,
      player,
      rawPlayer
    ).emit();
  }
}
