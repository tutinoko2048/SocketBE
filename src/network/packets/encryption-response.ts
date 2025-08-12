import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import { MessagePurpose, Packet } from '../../enums';

@PacketClass(Packet.EncryptionResponse, MessagePurpose.Encrypt)
export class EncryptionResponsePacket extends BasePacket {
  public publicKey!: string;
  
  public static deserialize(data: Record<string, any>): EncryptionResponsePacket {
    const packet = new EncryptionResponsePacket();
    packet.publicKey = data.publicKey;
    
    return packet;
  } 
}
