import { Packet } from '../enums';
import {
  NetworkHandler,
  type Connection,
  type DataResponsePacket,
} from '../network';
import type { IHeader } from '../types';

export class DataResponseHandler extends NetworkHandler {
  public static readonly packet = Packet.DataResponse;

  public handle(
    packet: DataResponsePacket,
    connection: Connection,
    header: IHeader
  ): void {
    connection.onDataResponse(header.requestId, packet);
  }
}
