import { MessagePurpose, Packet, type PlayerMessageType } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';

@PacketClass(Packet.PlayerMessage, MessagePurpose.Event)
export class PlayerMessagePacket extends BasePacket {  
  public type: PlayerMessageType;

  public message: string;
  
  public sender: string;

  public receiver: string;

  public static deserialize(data: Record<string, any>): PlayerMessagePacket {
    const packet = new PlayerMessagePacket();
    packet.type = data.type;
    packet.message = data.message;
    packet.sender = data.sender;
    packet.receiver = data.receiver;

    return packet;
  }
}