import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import { Packet } from '../../enums';

@PacketClass(Packet.DataRequest)
export class DataRequestPacket extends BasePacket {
  public serialize() {
    return {};
  }
}