import { ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';


export class WorldAddSignal extends WorldEventSignal {
  public static identifier: ServerEvent = ServerEvent.WorldAdd;
}
