import { BasePacket } from './base';
import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import type { VersionResolvable } from '../../types';

@PacketClass(Packet.CommandRequest, MessagePurpose.CommandRequest)
export class CommandRequestPacket extends BasePacket {
  public commandLine: string;

  public version: VersionResolvable;

  public serialize() {
    return {
      commandLine: this.commandLine,
      version: this.version,
    };
  }

  public static deserialize(data: Record<string, any>): CommandRequestPacket {
    const packet = new CommandRequestPacket();
    packet.commandLine = data.commandLine;
    packet.version = data.version;

    return packet;
  }
}