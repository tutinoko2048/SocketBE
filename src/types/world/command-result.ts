export type CommandResult<T extends Record<string, unknown>> = {
  statusCode: number;
  statusMessage: string;
} & T;
