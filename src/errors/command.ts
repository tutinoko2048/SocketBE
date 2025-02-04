/**
 * Thrown when minecraft returns an error. Usually command queue is full.
 */
export class CommandError extends Error {
  constructor(
    name: string,
    public readonly statusMessage: string,
    public readonly statusCode?: number
  ) {
    super(`[${name}] ${statusMessage}`);
    this.name = this.constructor.name;
  }
}
