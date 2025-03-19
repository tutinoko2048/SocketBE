import { Packet, ServerEvent } from '../enums';
 import { WorldEventSignal } from './world-event-signal';
 import type { World } from '../world';
 import type { Player } from '../entity';
 import type { WorldPlayer } from '../types';
 
 export class PlayerTransformSignal extends WorldEventSignal {
   public static readonly identifier: ServerEvent = ServerEvent.PlayerTransform;
 
   public static readonly packets: Packet[] = [Packet.PlayerTransform];

    public readonly player: Player;

    public readonly rawPlayer: WorldPlayer;

    public constructor(world: World, player: Player, rawPlayer: WorldPlayer) {
      super(world);
      this.player = player;
      this.rawPlayer = rawPlayer;
    }
 }