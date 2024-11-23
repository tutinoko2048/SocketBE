import type { Packet } from '../enums';
import type { Server } from '../server';
import type { IHeader } from '../types';
import type { Connection } from './connection';
import type { Network } from './network';
import type { BasePacket } from './packets';

export class NetworkHandler {
  public static readonly packet: Packet;

  public readonly server: Server;
  
  public readonly network: Network;

  public handle(_packet: BasePacket, _connection: Connection, _header: IHeader): void {
    throw Error('NetworkHandler.handle() is not implemented');
  };

  constructor(server: Server) {
    this.server = server;
    this.network = server.network;
  }
}
