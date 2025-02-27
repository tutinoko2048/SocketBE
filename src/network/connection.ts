import { randomUUID } from 'crypto';
import { Encryption } from './encryption';
import { CommandError, RequestTimeoutError, InvalidConnectionError } from '../errors';
import { CommandStatusCode } from '../enums';
import { CommandErrorPacket, type EncryptionResponsePacket, type CommandResponsePacket, type DataResponsePacket } from './packets';
import type { WebSocket } from 'ws';
import type { Network } from './network';
import type { PendingResponse } from '../types';


export class Connection {
  public readonly network: Network;
  
  public readonly ws: WebSocket;

  public readonly encryption: Encryption = new Encryption();

  public readonly identifier: string = randomUUID();

  public readonly pendingResponses = new Map<string, PendingResponse>();
  
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
    const data = this.pendingResponses.get(requestId);
    if (!data) return; //console.error('[Network] Received invalid command response', packet.data);

    this.pendingResponses.delete(requestId);
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

  public onEncryptionResponse(requestId: string, packet: EncryptionResponsePacket): void {
    const data = this.pendingResponses.get(requestId);
    if (!data) return console.error('[Network] Received unexpected encryption response', packet);

    this.pendingResponses.delete(requestId);
    clearTimeout(data.timeout);

    data.resolve(packet);
  }

  public onDataResponse(requestId: string, packet: DataResponsePacket): void {
    const data = this.pendingResponses.get(requestId);
    if (!data) return console.error('[Network] Received unexpected data response', packet);

    this.pendingResponses.delete(requestId);
    clearTimeout(data.timeout);

    data.resolve(packet);
  }

  public awaitResponse<R>(requestId: string, timeoutDuration = 10_000): Promise<R> {
    const sentAt = Date.now();

    return new Promise<R>((resolve, reject) => {
      if (!this.isOpen) return reject(new InvalidConnectionError(this.identifier));

      const timeout = setTimeout(() => {
        reject(new RequestTimeoutError());
      }, timeoutDuration);

      this.pendingResponses.set(requestId, { resolve, reject, timeout, sentAt });
    });
  }

  public clearPendingResponses() {
    for (const { timeout, reject } of this.pendingResponses.values()) {
      clearTimeout(timeout);
      reject(
        new Error(`[Aborted] Connection closed before response was received.`)
      );
    }
  }
}