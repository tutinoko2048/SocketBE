import type { CommandStatusCode } from '../../enums';

export type CommandResult<T extends Record<string, unknown>> = {
  statusCode: CommandStatusCode;
  statusMessage: string;
} & T;
