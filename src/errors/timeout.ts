export class CommandTimeoutError extends Error {
  constructor(
    public readonly command: string
  ) {
    super('Command response timed out');
    this.name = this.constructor.name;
  }
}
