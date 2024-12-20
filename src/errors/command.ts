/**
 * Thrown when minecraft returns an error. Usually command queue is full.
 */
export class CommandError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly statusMessage: string
  ) {
    super(`[CommandError] ${statusMessage} (${statusCode})`);
    this.name = this.constructor.name;
  }
}
