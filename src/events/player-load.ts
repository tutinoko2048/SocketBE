import { PlayerJoinSignal } from './player-join';
import { ServerEvent } from '../enums';
import type { World } from '../world';
import type { Player } from '../entity';

/**
 * @deprecated Disabled due to a known Minecraft crash bug.
 */
export class PlayerLoadSignal extends PlayerJoinSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerLoad;

  constructor(world: World, player: Player) {
    super(world, player);
  }
}
