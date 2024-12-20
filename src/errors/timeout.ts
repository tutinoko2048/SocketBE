/**
 * Thrown when the command takes too long to respond.
 */
export class CommandTimeoutError extends Error {
  constructor(
    public readonly command: string
  ) {
    super('Response timeout');
    this.name = this.constructor.name;
  }
}
