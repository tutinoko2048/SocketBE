import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldKiller, WorldPlayer } from '../../types';

@PacketClass(Packet.PlayerDied, MessagePurpose.Event)
export class PlayerDiedPacket extends BasePacket {
  /**
   * What killed the player.
   *
   * @remarks
   * A plain number, since only a few values have been confirmed. Compare against
   * {@link PlayerDeathCause} for those.
   */
  public cause!: number;

  public inRaid!: boolean;

  /**
   * The entity that killed the player.
   *
   * @remarks
   * Always present, even for an environmental death - see {@link WorldKiller}.
   */
  public killer!: WorldKiller;

  public player!: WorldPlayer;

  public static deserialize(data: Record<string, any>): PlayerDiedPacket {
    const packet = new PlayerDiedPacket();
    packet.cause = data.cause;
    packet.inRaid = data.inRaid;
    packet.killer = data.killer;
    packet.player = data.player;

    return packet;
  }
}
