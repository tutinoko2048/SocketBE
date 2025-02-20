/**
 * Thrown when the request takes too long to respond.
 */
export class RequestTimeoutError extends Error {
  constructor(
    public readonly command?: string
  ) {
    super('Response timeout');
    this.name = this.constructor.name;
  }
}
