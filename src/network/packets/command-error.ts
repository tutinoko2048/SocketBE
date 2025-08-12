import { BasePacket } from './base';
import { type CommandStatusCode, MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import type { CommandResult } from '../../types';

@PacketClass(Packet.CommandError, MessagePurpose.Error)
export class CommandErrorPacket extends BasePacket {
  public data!: Record<string, any>;

  public get statusCode(): CommandStatusCode {
    return this.data.statusCode as CommandStatusCode;
  }

  public get statusMessage(): string {
    return this.data.statusMessage as string;
  }

  public toCommandResult<T extends Record<string, any>>(): CommandResult<T> {
    return this.data as CommandResult<T>;
  }

  public static deserialize(data: Record<string, any>): CommandErrorPacket {
    const packet = new CommandErrorPacket();
    packet.data = data;

    return packet;
  }
}