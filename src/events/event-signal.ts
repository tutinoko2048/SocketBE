import type { Packet, ServerEvent } from '../enums';
import type { Server } from '../server';


export class EventSignal {
  public static readonly identifier: ServerEvent;

  /** List of packets needed to emit this event (Used for packet subscription) */
  public static readonly packets: Packet[] = [];

  public readonly identifier = (this.constructor as typeof EventSignal).identifier;

  public readonly server: Server;
  
  public emit(): boolean {
    // @ts-expect-error - "this" should be correct type
    return this.server.emit(this.identifier, this);
  }

  public constructor(server: Server) {
    this.server = server;
  }
}