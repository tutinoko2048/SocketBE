import { Packet } from '../enums';
import {
  NetworkHandler,
  type CommandErrorPacket,
  type Connection,
} from '../network';
import type { IHeader } from '../types';

export class CommandErrorHandler extends NetworkHandler {
  public static readonly packet = Packet.CommandError;

  public handle(
    packet: CommandErrorPacket,
    connection: Connection,
    header: IHeader
  ): void {
    connection.onCommandResponse(header.requestId, packet);
  }
}
