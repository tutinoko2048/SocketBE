import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import { MessagePurpose, Packet } from '../../enums';
import type { BlockQueryResult, ItemQueryResult, MobQueryResult } from '../../types';

@PacketClass(Packet.DataResponse, MessagePurpose.DataResponse)
export class DataResponsePacket extends BasePacket {
  public dataType!: 'block' | 'item' | 'mob';

  public type!: number;

  public data!: BlockQueryResult[] | ItemQueryResult[] | MobQueryResult[];

  public static deserialize(data: any, header: Record<string, any>): DataResponsePacket {
    const packet = new DataResponsePacket();
    packet.dataType = header.dataType;
    packet.type = header.type;
    packet.data = data;
    return packet;
  }
}