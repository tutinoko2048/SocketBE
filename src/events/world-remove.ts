import { ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';


export class WorldRemoveSignal extends WorldEventSignal {
  public static identifier: ServerEvent = ServerEvent.WorldRemove;

  public readonly code: number;

  public constructor(world: World, code: number) {
    super(world);
    this.code = code;
  }
}
