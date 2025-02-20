import { randomUUID } from 'crypto';
import { Encryption } from './encryption';
import { CommandError, RequestTimeoutError, InvalidConnectionError } from '../errors';
import { CommandStatusCode } from '../enums';
import { CommandErrorPacket, type EncryptionResponsePacket, type CommandRequestPacket, type CommandResponsePacket } from './packets';
import type { WebSocket } from 'ws';
import type { Network } from './network';
import type { PendingResponseData } from '../types';


export class Connection {
  public readonly network: Network;
  
  public readonly ws: WebSocket;

  public readonly encryption: Encryption = new Encryption();

  public readonly identifier: string = randomUUID();

  public readonly pendingCommandResponses = new Map<
    string,
    PendingResponseData<CommandResponsePacket, CommandError>
  >();

  public pendingEncryptionResponse: PendingResponseData<EncryptionResponsePacket, Error>;
  
  public readonly responseTimes: number[] = [];

  public readonly establishedAt: number = Date.now();

  constructor(network: Network, ws: WebSocket) {
    this.network = network;
    this.ws = ws;
  }

  public get isOpen() {
    return this.ws.readyState === this.ws.OPEN;
  }

  public send(payload: string | Buffer) {
    let data = payload;
    if (this.encryption.enabled) {
      data = this.encryption.encrypt(
        typeof payload === 'string' ? payload : payload.toString('utf-8')
      )
    }
    this.ws.send(data);
  }

  public onCommandResponse(requestId: string, packet: CommandResponsePacket | CommandErrorPacket): void {
    const data = this.pendingCommandResponses.get(requestId);
    if (!data) return; //console.error('[Network] Received invalid command response', packet.data);

    this.pendingCommandResponses.delete(requestId);
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
        reject(new RequestTimeoutError(packet.commandLine));
      }, timeoutDuration);

      this.pendingCommandResponses.set(requestId, { resolve, reject, timeout, sentAt });
    });
  }

  public onEncryptionResponse(packet: EncryptionResponsePacket): void {
    const data = this.pendingEncryptionResponse;
    if (!data) return console.error('[Network] Received unexpected encryption response', packet);

    clearTimeout(data.timeout);

    data.resolve(packet);

    this.pendingEncryptionResponse = undefined;
  }

  public awaitEncryptionResponse(timeoutDuration = 5_000): Promise<EncryptionResponsePacket> {
    const sentAt = Date.now();
    
    return new Promise((resolve, reject) => {
      if (!this.isOpen) return reject(new InvalidConnectionError(this.identifier));

      const timeout = setTimeout(() => {
        reject(new RequestTimeoutError());
      }, timeoutDuration);

      this.pendingEncryptionResponse = { resolve, reject, timeout, sentAt };
    });
  }

  public clearPendingResponses() {
    for (const { timeout, reject } of this.pendingCommandResponses.values()) {
      clearTimeout(timeout);
      reject(
        new CommandError('Aborted', 'Connection closed before response was received.')
      );
    }

    if (this.pendingEncryptionResponse) {
      clearTimeout(this.pendingEncryptionResponse.timeout);
      this.pendingEncryptionResponse.reject(
        new Error(`[Aborted] Connection closed before response was received.`)
      );
    }
  }
}