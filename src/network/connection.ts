import { randomUUID } from 'crypto';
import type { WebSocket } from 'ws';
import type { Network } from './network';
import { CommandErrorPacket, type CommandRequestPacket, type CommandResponsePacket } from './packets';
import { CommandError, CommandTimeoutError, InvalidConnectionError } from '../errors';
import { CommandStatusCode } from '../enums';


export class Connection {
  public readonly network: Network;
  
  public readonly ws: WebSocket;

  public readonly identifier: string = randomUUID();

  public readonly awaitingResponses = new Map<string, {
    resolve: (arg: CommandResponsePacket) => void;
    reject: (arg: CommandError) => void;
    timeout: NodeJS.Timeout;
    sentAt: number;
  }>();
  
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

  public onCommandResponse(requestId: string, packet: CommandResponsePacket | CommandErrorPacket): void {
    const data = this.awaitingResponses.get(requestId);
    if (!data) return console.error('[Network] Received invalid command response', packet.data);

    this.awaitingResponses.delete(requestId);
    clearTimeout(data.timeout);
    
    if (packet instanceof CommandErrorPacket) {
      data.reject(
        new CommandError(CommandStatusCode[packet.statusCode], packet.statusMessage, packet.statusCode)
      );
    } else {
      data.resolve(packet);
    }

    if (this.responseTimes.length > 20) this.responseTimes.shift();
    this.responseTimes.push(Date.now() - data.sentAt);
  }

  public awaitCommandResponse(requestId: string, packet: CommandRequestPacket, timeoutDuration = 10_000): Promise<CommandResponsePacket> {  
    const sentAt = Date.now();

    return new Promise((resolve, reject) => {
      if (!this.isOpen) return reject(new InvalidConnectionError(this.identifier));

      const timeout = setTimeout(() => {
        reject(new CommandTimeoutError(packet.commandLine));
      }, timeoutDuration);

      this.awaitingResponses.set(requestId, { resolve, reject, timeout, sentAt });
    });
  }

  public clearAwaitingResponses() {
    for (const { timeout, reject } of this.awaitingResponses.values()) {
      clearTimeout(timeout);
      reject(
        new CommandError('Aborted', 'Connection closed before response was received.')
      );
    }
  }
}