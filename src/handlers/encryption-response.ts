import { Packet } from '../enums';
import {
  NetworkHandler,
  type EncryptionResponsePacket,
  type Connection,
} from '../network';
import type { IHeader } from '../types';

export class EncryptionResponseHandler extends NetworkHandler {
  public static readonly packet = Packet.EncryptionResponse;

  public handle(
    packet: EncryptionResponsePacket,
    connection: Connection,
    header: IHeader
  ): void {
    connection.onEncryptionResponse(header.requestId, packet);
  }
}
