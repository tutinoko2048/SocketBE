import { CommandStatusCode } from '../enums';

/**
 * Thrown when minecraft returns an error. Usually command queue is full.
 */
export class CommandError extends Error {
  constructor(
    public readonly statusCode: CommandStatusCode,
    public readonly statusMessage: string
  ) {
    super(`[${CommandStatusCode[statusCode]}] ${statusMessage}`);
    this.name = this.constructor.name;
  }
}
