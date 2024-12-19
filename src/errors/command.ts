export class CommandError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly statusMessage: string
  ) {
    super(`[CommandError] ${statusMessage} (${statusCode})`);
    this.name = this.constructor.name;
  }
}
