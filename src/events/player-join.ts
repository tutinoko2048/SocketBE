import { ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';


export class PlayerJoinSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerJoin;

  public readonly player: string;

  constructor(world: World, player: string) {
    super(world);
    this.player = player;
  }
}
