import { randomUUID } from 'crypto';
import type { WebSocket } from 'ws';
import type { Network } from './network';
import { CommandErrorPacket, type CommandRequestPacket, type CommandResponsePacket } from './packets';
import { CommandError, CommandTimeoutError, InvalidConnectionError } from '../errors';


export class Connection {
  public readonly network: Network;
  
  public readonly ws: WebSocket;

  public readonly identifier: string = randomUUID();

  public readonly awaitingResponses: Map<string, (arg: CommandResponsePacket | CommandErrorPacket) => void> = new Map();
  
  public readonly responseTimes: number[] = [];

  public readonly establishedAt: number = Date.now();

  constructor(network: Network, ws: WebSocket) {
    this.network = network;
    this.ws = ws;
  }

  public get isOpen() {
    return this.ws.readyState === this.ws.OPEN;
  }

  public send(payload: string) {
    this.ws.send(payload);
  }

  public onCommandResponse(requestId: string, packet: CommandResponsePacket | CommandErrorPacket) {
    const callback = this.awaitingResponses.get(requestId);
    if (!callback) return console.error('[Network] Received invalid command response', packet.data);
    callback(packet);
  }

  public awaitCommandResponse(requestId: string, packet: CommandRequestPacket): Promise<CommandResponsePacket> {  
    const sentAt = Date.now();
    return new Promise((res, rej) => {
      if (!this.isOpen) return rej(new InvalidConnectionError(this.identifier));

      const timeout = setTimeout(() => {
        rej(new CommandTimeoutError(packet.commandLine));
      }, 10 * 1000);

      this.awaitingResponses.set(requestId, (response) => {
        this.awaitingResponses.delete(requestId);
        clearTimeout(timeout);

        if (response instanceof CommandErrorPacket) {
          return rej(
            new CommandError(response.statusCode, response.statusMessage)
          );
        }

        res(response);

        if (this.responseTimes.length > 20) this.responseTimes.shift();
        this.responseTimes.push(Date.now() - sentAt);
      });
    });
  }
}