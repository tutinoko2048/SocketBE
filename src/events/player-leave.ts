import { ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { Player, World } from '../world';


export class PlayerLeaveSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerLeave;

  public readonly player: Player;

  constructor(world: World, player: Player) {
    super(world);
    this.player = player;
  }
}
