import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import { MessagePurpose, Packet } from '../../enums';

@PacketClass(Packet.EventSubscribe, MessagePurpose.Subscribe)
export class EventSubscribePacket extends BasePacket {
  public eventName: Packet;
  
  public serialize(): string {
    return JSON.stringify({
      eventName: this.eventName
    });
  }
}
