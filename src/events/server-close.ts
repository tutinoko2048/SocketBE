import { ServerEvent } from '../enums';
import { EventSignal } from './event-signal';

export class ServerCloseSignal extends EventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.Close;
}
