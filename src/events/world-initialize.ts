import { ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';


export class WorldInitializeSignal extends WorldEventSignal {
  public static identifier: ServerEvent = ServerEvent.WorldInitialize;

  public readonly localPlayer: string;

  public constructor(world: World) {
    super(world);
    this.localPlayer = world.localPlayer;
  }
}
