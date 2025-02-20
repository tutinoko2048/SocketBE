import { ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';

export class EnableEncryptionSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.EnableEncryption;
}