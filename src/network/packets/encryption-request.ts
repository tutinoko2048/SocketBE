import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import { MessagePurpose, Packet, type EncryptionMode } from '../../enums';

@PacketClass(Packet.EncryptionRequest, MessagePurpose.Encrypt)
export class EncryptionRequestPacket extends BasePacket {
  public mode!: EncryptionMode;

  public publicKey!: string;

  public salt!: string;
  
  public serialize() {
    return {
      mode: this.mode,
      publicKey: this.publicKey,
      salt: this.salt,
    };
  }
}
