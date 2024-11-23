import { Packet, type PlayerMessageType } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { RawMessage } from '@minecraft/server';

@PacketClass(Packet.PlayerMessage)
export class PlayerMessagePacket extends BasePacket {  
  public message: string;
  
  public sender: string;

  public receiver: string;
  
  public type: PlayerMessageType;

  public getRawMessage(): RawMessage | undefined {
    try {
      return JSON.parse(this.message) as RawMessage;
    } catch {
      return undefined;
    }
  }

  public static deserialize(data: Record<string, any>): PlayerMessagePacket {
    const packet = new PlayerMessagePacket();
    packet.message = data.message;
    packet.sender = data.sender;

    return packet;
  }
}