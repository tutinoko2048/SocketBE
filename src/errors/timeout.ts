/**
 * Thrown when the request takes too long to respond.
 */
export class RequestTimeoutError extends Error {
  constructor() {
    super('Response timeout');
    this.name = this.constructor.name;
  }
}
