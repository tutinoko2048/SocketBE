import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import { Connection } from './connection';
import { ExtendedEmitter } from '../emitter';
import { World } from '../world';
import { MessagePurpose, Packet, PacketBound, ServerEvent } from '../enums';
import { EventSubscribePacket, Packets, type BasePacket } from './packets';
import * as events from '../events';
import type { WebSocket } from 'ws';
import type { Server } from '../server';
import type { IHeader, IPacket, NetworkEvent, NetworkEvents } from '../types';
import type { NetworkHandler } from './handler';


export class Network extends ExtendedEmitter<NetworkEvents> {
  public readonly server: Server;
  
  public readonly wss: WebSocketServer;

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

    ws.on('message', this.onConnectionMessage.bind(this, connection));
    ws.on('close', this.onConnectionClose.bind(this, connection));
    
    console.log('New connection', connection.identifier);

    const world = new World(this.server, connection);

    new events.WorldAddSignal(world).emit();
    
    this.server.worlds.set(connection, world);

    // send all registered events
    const registeredEvents: Set<Packet | 'all' | 'raw'> = this.getRegisteredEvents();

    for (const registered of this.server.getRegisteredEvents()) {
      // get subscribed EventSignal class
      const Signal = Object.values(events).find(Signal => Signal.identifier === registered);
      if (!Signal) continue;
      for (const packetId of Signal.packets) {
        registeredEvents.add(packetId);
      }
    }

    for (const registered of registeredEvents) {
      if (registered === 'all' || registered === 'raw') continue;

      const packet = new EventSubscribePacket();
      packet.eventName = registered;

      this.send(connection, packet);
      console.log('subscribe', registered);
      
    }

    world.onConnect();
  }
  
  public onConnectionMessage(connection: Connection, data: string) {
    let rawPacket: IPacket;
    try {
      rawPacket = JSON.parse(data);

      if (!(
        typeof rawPacket === 'object' &&
        typeof rawPacket.header === 'object' &&
        typeof rawPacket.body === 'object'
      )) return;
      
      this.emit('raw', { ...rawPacket, connection });
    } catch {
      console.error('[Network] Failed to parse packet from', connection.identifier);
      return;
    }

    const { messagePurpose } = rawPacket.header;    
    switch (messagePurpose) {
      case MessagePurpose.CommandResponse:
      case MessagePurpose.Error:
      case MessagePurpose.Event: {
        let packetId: Packet;
        if (messagePurpose === MessagePurpose.CommandResponse) {
          packetId = Packet.CommandResponse;
        } else if (messagePurpose === MessagePurpose.Error) {
          packetId = Packet.CommandError;
        } else if (messagePurpose === MessagePurpose.Event) {
          packetId = rawPacket.header.eventName;
        }
        
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
              console.error(`[Network] Error while handling packet ${Packet[packetId]}\n`, error);
            }
          }
          if (!handled) {
            // console.warn(`[Network] No handler found for packet ${Packet[packetId]}`);
          }
        } catch (error) {
          console.error('[Network] Failed to deserialize packet', error);
        }
        break;
      }
      default:
        console.error('[Network] Invalid message purpose:', messagePurpose);
    }
  }

  public onConnectionClose(connection: Connection, code: number) {
    console.log('Connection closed with code', code, connection.identifier);
    const world = this.server.worlds.get(connection);
    world.onDisconnect();
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
