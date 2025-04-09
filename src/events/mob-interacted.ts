import { Packet, ServerEvent, type MobInteractionType } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldMob, WorldPlayer } from '../types';

export class MobInteractedSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.MobInteracted;

  public static readonly packets: Packet[] = [Packet.MobInteracted];

  public readonly interactionType: MobInteractionType;

  public readonly mob: WorldMob;

  public readonly player: Player;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    interactionType: MobInteractionType,
    mob: WorldMob,
    player: Player,
    rawPlayer: WorldPlayer,
  ) {
    super(world);

    this.interactionType = interactionType;
    this.mob = mob;
    this.player = player;
    this.rawPlayer = rawPlayer;
  }
}
