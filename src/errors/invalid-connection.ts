export class InvalidConnectionError extends Error {
  constructor(
    public readonly connectionId: string
  ) {
    super('Invalid connection');
    this.name = this.constructor.name;
  }
}
