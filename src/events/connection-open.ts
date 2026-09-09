import { ServerEvent } from '../enums';
import { EventSignal } from './event-signal';
import type { Connection } from '../network';

/**
 * Emitted after the WebSocket is accepted and before encryption starts.
 * Cancel this event to reject the connection.
 */
export class ConnectionOpenSignal extends EventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.ConnectionOpen;

  public readonly connection: Connection;

  public constructor(connection: Connection) {
    super(connection.network.server);
    this.connection = connection;
  }
}
