import { Packet } from '../enums';
import { NetworkHandler, type CommandResponsePacket, type Connection } from '../network';
import type { IHeader } from '../types';

export class CommandResponseHandler extends NetworkHandler {
  public static readonly packet = Packet.CommandResponse;
  
  public handle(packet: CommandResponsePacket, connection: Connection, header: IHeader): void {
    connection.onCommandResponse(header.requestId, packet);
  }
}
