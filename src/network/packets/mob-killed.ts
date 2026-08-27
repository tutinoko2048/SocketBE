import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldItemStack, WorldPlayer, WorldVictim } from '../../types';

@PacketClass(Packet.MobKilled, MessagePurpose.Event)
export class MobKilledPacket extends BasePacket {
  /**
   * The armour the killer was wearing.
   *
   * @remarks
   * All five slots are always present. An empty slot arrives as an item stack with an
   * empty `id` and `namespace`, `stackSize: 0` and `freeStackSize: 255`, rather than
   * being omitted.
   */
  public armorBody!: WorldItemStack;

  public armorFeet!: WorldItemStack;

  public armorHead!: WorldItemStack;

  public armorLegs!: WorldItemStack;

  public armorTorso!: WorldItemStack;

  /** `false` for a passive mob such as a sheep. */
  public isMonster!: boolean;

  /**
   * How the mob was killed.
   *
   * @remarks
   * The same numbering as `PlayerDied.cause` - see {@link DamageCause}. Ten keywords were
   * driven through both events and matched on every one. Left as a plain number for the
   * same reason the other field is.
   */
  public killMethodType!: number;

  public player!: WorldPlayer;

  public playerIsHiddenFrom!: boolean;

  /** The mob that was killed. Its `type` is an identifier string. */
  public victim!: WorldVictim;

  public weapon!: WorldItemStack;

  public static deserialize(data: Record<string, any>): MobKilledPacket {
    const packet = new MobKilledPacket();
    packet.armorBody = data.armorBody;
    packet.armorFeet = data.armorFeet;
    packet.armorHead = data.armorHead;
    packet.armorLegs = data.armorLegs;
    packet.armorTorso = data.armorTorso;
    packet.isMonster = data.isMonster;
    packet.killMethodType = data.killMethodType;
    packet.player = data.player;
    packet.playerIsHiddenFrom = data.playerIsHiddenFrom;
    packet.victim = data.victim;
    packet.weapon = data.weapon;

    return packet;
  }
}
