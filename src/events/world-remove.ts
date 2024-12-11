import { ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';


export class WorldRemoveSignal extends WorldEventSignal {
  public static identifier: ServerEvent = ServerEvent.WorldRemove;
}
