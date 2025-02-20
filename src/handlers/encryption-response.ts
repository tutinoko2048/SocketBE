import { Packet } from '../enums';
import { NetworkHandler, type EncryptionResponsePacket, type Connection } from '../network';

export class EncryptionResponseHandler extends NetworkHandler {
  public static readonly packet = Packet.EncryptionResponse;
  
  public handle(packet: EncryptionResponsePacket, connection: Connection): void {
    connection.onEncryptionResponse(packet);
  }
}
