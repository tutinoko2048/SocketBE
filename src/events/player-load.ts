import { PlayerJoinSignal } from './player-join';
import { ServerEvent } from '../enums';
import type { Player, World } from '../world';


export class PlayerLoadSignal extends PlayerJoinSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerLoad;

  constructor(world: World, player: Player) {
    super(world, player);
  }
}
