import { BasePacket } from './base';
import { MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';

@PacketClass(Packet.CommandRequest, MessagePurpose.CommandRequest)
export class CommandRequestPacket extends BasePacket {
  public commandLine: string;

  public version: number;

  public serialize(): string {
    return JSON.stringify({
      commandLine: this.commandLine,
      version: this.version,
    });
  }

  public static deserialize(data: Record<string, any>): CommandRequestPacket {
    const packet = new CommandRequestPacket();
    packet.commandLine = data.commandLine;
    packet.version = data.version;

    return packet;
  }
}