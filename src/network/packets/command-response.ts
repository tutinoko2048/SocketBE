import { BasePacket } from './base';
import { CommandStatusCode, MessagePurpose, Packet } from '../../enums';
import { PacketClass } from '../decorator';
import type { CommandResult } from '../../types';

@PacketClass(Packet.CommandResponse, MessagePurpose.CommandResponse)
export class CommandResponsePacket extends BasePacket {
  public data: Record<string, any>;

  public get statusCode(): CommandStatusCode {
    return this.data.statusCode as CommandStatusCode;
  }

  public get statusMessage(): string {
    return this.data.statusMessage as string;
  }

  public toCommandResult<T extends Record<string, any>>(): CommandResult<T> {
    return this.data as CommandResult<T>;
  }

  public static createEmptyResult<T extends Record<string, any>>(): CommandResult<T> {
    return {
      statusCode: CommandStatusCode.Success,
      statusMessage: '',
    } as CommandResult<T>;
  }

  public static deserialize(data: Record<string, any>): CommandResponsePacket {
    const packet = new CommandResponsePacket();
    packet.data = data;

    return packet;
  }
}