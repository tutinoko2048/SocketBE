import type { MessagePurpose, Packet } from '../../enums';

export class BasePacket {
  public static id: Packet;

  public static purpose: MessagePurpose;

  public serialize(): string {
    throw Error('BasePacket.serialize() is not implemented');
  }

  public static deserialize(_data: Record<string, any>): BasePacket {
    throw Error('BasePacket.deserialize() is not implemented');
  }
  
  public as<T extends typeof BasePacket>(type: T): T['prototype'] {
    return type.deserialize(this);
  }

  public getId(): Packet {
    throw Error('BasePacket.getId() is not implemented');
  }

  public getPurpose(): MessagePurpose {
    throw Error('BasePacket.getPurpose() is not implemented ');
  }
}