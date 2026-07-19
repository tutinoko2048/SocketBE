import { ServerEvent } from '../enums';
import { EventSignal } from './event-signal';

export class ServerOpenSignal extends EventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.Open;
}
