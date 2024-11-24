import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import { MessagePurpose, Packet } from '../../enums';

@PacketClass(Packet.EventSubscribe, MessagePurpose.Unsubscribe)
export class EventUnsubscribePacket extends BasePacket {
  public eventName: Packet;
  
  public serialize(): string {
    return JSON.stringify({
      eventName: this.eventName
    });
  }
}
