import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import { DataResponseType, MessagePurpose, Packet } from '../../enums';
import type { BlockQueryResult, ItemQueryResult, MobQueryResult } from '../../types';

@PacketClass(Packet.DataResponse, MessagePurpose.DataResponse)
export class DataResponsePacket extends BasePacket {
  public dataType!: 'block' | 'item' | 'mob';

  /**
   * The same thing {@link dataType} says, as a number.
   *
   * @remarks
   * Was untyped until the pairing was measured: `block` is 0, `item` is 1, `mob` is 2.
   */
  public type!: DataResponseType;

  public data!: BlockQueryResult[] | ItemQueryResult[] | MobQueryResult[];

  public static deserialize(data: any, header: Record<string, any>): DataResponsePacket {
    const packet = new DataResponsePacket();
    packet.dataType = header.dataType;
    packet.type = header.type;
    packet.data = data;
    return packet;
  }
}
