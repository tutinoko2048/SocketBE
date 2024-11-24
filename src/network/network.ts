import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import { Connection } from './connection';
import { NetworkEmitter } from './emitter';
import { MessagePurpose, Packet, PacketBound, ServerEvent } from '../enums';
import type { ServerOptions, WebSocket } from 'ws';
import type { Server } from '../server';
import { EventSubscribePacket, Packets, type BasePacket } from './packets';
import type { IHeader, IPacket, NetworkEvent, NetworkEvents } from '../types';
import type { NetworkHandler } from './handler';
import { World } from '../world';


export class Network extends NetworkEmitter {
  public readonly server: Server;
  
  public readonly wss: WebSocketServer;

  public readonly options: ServerOptions;

  public readonly connections: Set<Connection> = new Set();

  public readonly handlers: Set<typeof NetworkHandler> = new Set();

  constructor(server: Server, handlers?: typeof NetworkHandler[]) {
    super();
    this.server = server;
    this.wss = new WebSocketServer({ ...server.options.webSocketOptions, port: server.options.port });
    this.wss.on('listening', this.onListening.bind(this));
    this.wss.on('connection', this.onConnection.bind(this));
    this.wss.on('close', this.onClose.bind(this));

    for (const handler of handlers ?? []) {
      this.registerHandler(handler);
    }
  }

  public stop() {
    this.wss.close();
  }

  public send(connection: Connection, packet: BasePacket): IHeader {
    const header = {
      version: 1,
      requestId: randomUUID(),
      messagePurpose: packet.getPurpose(),
    } as IHeader;

    const event: NetworkEvent<BasePacket> = {
      connection,
      packet,
      bound: PacketBound.Client,
      header,
    }

    const network = this.emit(packet.getId() as (keyof NetworkEvents), event);
    const all = this.emit('all', event);

    // cancel the packet if send event is cancelled
    if (!network || !all) return;

    const payload = JSON.stringify({
      header,
      body: packet.serialize()
    });
    connection.send(payload);
    
    return header;
  }

  public onListening() {
    this.server.emit(ServerEvent.Open);
  }

  public onConnection(ws: WebSocket) {
    const connection = new Connection(this, ws);
    this.connections.add(connection);

    ws.on('open', this.onConnectionOpen.bind(this, connection));
    ws.on('message', this.onConnectionMessage.bind(this, connection));
    ws.on('close', this.onConnectionClose.bind(this, connection));

    console.log('New connection', connection.identifier);
  }  

  public onConnectionOpen(connection: Connection) {
    console.log('Connection opened', connection.identifier);

    const world = new World(this.server, connection);
    this.server.worlds.set(connection, world);

    for (const registered of this.getRegisteredEvents()) {
      const packet = new EventSubscribePacket();
      packet.eventName = registered as Packet;

      this.send(connection, packet);
    }
  }
  
  public onConnectionMessage(connection: Connection, data: string) {
    let rawPacket: IPacket;
    try {
      rawPacket = JSON.parse(data);
      console.log('onConnectionMessage', rawPacket);
    } catch {
      console.error('[Network] Failed to parse packet from', connection.identifier);
      return;
    }

    if (!rawPacket?.header?.messagePurpose) return console.error('[Network] Received invalid packet from', connection.identifier);

    switch (rawPacket.header.messagePurpose) {
      case MessagePurpose.CommandResponse:
      case MessagePurpose.Event: {
        const packetId = rawPacket.header.messagePurpose === MessagePurpose.Event
          ? rawPacket.header.eventName
          : Packet.CommandResponse;
        const PacketType = Packets[packetId];
        if (!PacketType) {
          console.error('[Network] Unknown packet for packetId', packetId);
          return;
        }

        try {
          const packet = PacketType.deserialize(rawPacket.body);
          
          const event: NetworkEvent<BasePacket> = {
            connection,
            packet,
            bound: PacketBound.Server,
            header: rawPacket.header,
          }

          const network = this.emit(packetId as keyof NetworkEvents, event);
          const all = this.emit('all', event);

          // cancel the packet if receive event is cancelled
          if (!network || !all) return;

          let handled = false;
          for (const handler of this.handlers) {
            if (handler.packet !== packetId) continue;
            try {
              const instance = new handler(this.server);
              instance.handle(packet, connection, rawPacket.header);
              handled = true;
            } catch (error) {
              console.error(`[Network] Error while handling packet ${Packet[packetId]}`, error);
            }
          }
          if (!handled) {
            console.error(`[Network] No handler found for packet ${Packet[packetId]}`);
          }
        } catch (error) {
          console.error('[Network] Failed to deserialize packet', error);
        }
        break;
      }
      case MessagePurpose.Error: {
        console.error('[Network] Error packet received', rawPacket.body);
        break;
      }
      default:
        console.error('[Network] Invalid message purpose', rawPacket.header.messagePurpose);
    }
  }

  public onConnectionClose(connection: Connection, code: number) {
    console.log('Connection closed with code', code, connection.identifier);
    this.server.worlds.delete(connection);
    this.connections.delete(connection);
  }
    
  public onClose() {
    this.connections.clear();
    console.log('Server closed');
  }

  public registerHandler(handler: typeof NetworkHandler) {
    this.handlers.add(handler);
  }

  public unregisterHandler(handler: typeof NetworkHandler) {
    this.handlers.delete(handler);
  }
}
