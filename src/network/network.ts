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
import type { IHeader, IPacket, NetworkEvent, NetworkEvents, NetworkSendOptions } from '../types';
import type { NetworkHandler } from './handler';
import type { IncomingMessage } from 'http';


export class Network extends ExtendedEmitter<NetworkEvents> {
  public readonly server: Server;
  
  public readonly wss: WebSocketServer;

  public readonly connections: Set<Connection> = new Set();

  public readonly handlers: Set<NetworkHandler> = new Set();

  constructor(server: Server, handlers?: typeof NetworkHandler[]) {
    super();
    this.server = server;

    server.options.webSocketOptions ??= {};
    if (server.options.port !== undefined) server.options.webSocketOptions.port = server.options.port;

    this.wss = new WebSocketServer(server.options.webSocketOptions);
    this.wss.on('listening', this.onListening.bind(this));
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.wss.on('connection', this.onConnection.bind(this));
    this.wss.on('close', this.onClose.bind(this));

    for (const handler of handlers ?? []) {
      this.registerHandler(handler);
    }
  }

  public stop() {
    this.wss.close();
  }

  public send(connection: Connection, packet: BasePacket, options?: NetworkSendOptions): IHeader | undefined {
    const header = {
      version: 1,
      requestId: randomUUID(),
      messagePurpose: options?.overrideMessagePurpose ?? packet.getPurpose(),
    } as IHeader;

    if (!header.messagePurpose) throw new Error('MessagePurpose cannot be undefined');

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
    new events.ServerOpenSignal(this.server).emit();
  }

  public async onConnection(ws: WebSocket, request: IncomingMessage) {
    const connection = new Connection(this, ws, {
      headers: request.headers,
      url: request.url,
      remoteAddress: request.socket.remoteAddress,
    });
    this.connections.add(connection);

    ws.on('message', this.onConnectionMessage.bind(this, connection));
    ws.on('close', this.onConnectionClose.bind(this, connection));

    const world = new World(this.server, connection);

    if (!new events.ConnectionOpenSignal(connection).emit()) {
      this.connections.delete(connection);
      ws.close();
      return;
    }

    if (!this.server.options.disableEncryption) {
      await world.enableEncryption(this.server.options.encryptionMode);
    }

    new events.WorldAddSignal(world).emit();

    this.server.worlds.set(connection, world);

    this.sendEventSubscriptions(connection);

    world.onConnect();
  }
  
  public onConnectionMessage(connection: Connection, data: Buffer) {
    let decryptedData: string;

    if (connection.encryption.enabled) {
      decryptedData = connection.encryption.decrypt(data);
    } else {
      decryptedData = data.toString('utf-8');
    }

    let rawPacket: IPacket;
    try {
      rawPacket = JSON.parse(decryptedData);

      if (!(
        typeof rawPacket === 'object' &&
        typeof rawPacket.header === 'object' &&
        typeof rawPacket.body === 'object'
      )) return;
      
      this.emit('raw', { ...rawPacket, connection });
    } catch {
      if (connection.encryption.enabled) {
        // If decryption failed, try to parse as plain text
        // This is a workaround for Bun where the encryption response packet is received twice
        try {
          const plainText = data.toString('utf-8');
          rawPacket = JSON.parse(plainText);
          
          // If successful, restore the decipher state because the previous decrypt() call was invalid
          connection.encryption.restoreDecipherState();
          
          // console.log('[Network] Successfully parsed packet as plain text after decryption failure. Restored decipher state.');
          
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
      } else {
        console.error('[Network] Failed to parse packet from', connection.identifier);
        return;
      }
    }

    const { messagePurpose } = rawPacket.header;

    const deserializablePurposes: MessagePurpose[] = [
      MessagePurpose.CommandResponse,
      MessagePurpose.Encrypt,
      MessagePurpose.Error,
      MessagePurpose.Event,
      MessagePurpose.DataResponse,
    ];

    if (!deserializablePurposes.includes(messagePurpose)) {
      console.error('[Network] Invalid message purpose:', messagePurpose);
      return;
    }

    let packetId: Packet;
    switch (messagePurpose) {
      case MessagePurpose.CommandResponse: packetId = Packet.CommandResponse; break;
      case MessagePurpose.Encrypt: packetId = Packet.EncryptionResponse; break;
      case MessagePurpose.Error: packetId = Packet.CommandError; break;
      case MessagePurpose.DataResponse: packetId = Packet.DataResponse; break;
      case MessagePurpose.Event: packetId = rawPacket.header.eventName; break;
      default:
        packetId = undefined!;
        break;
    }

    const PacketType = Packets[packetId];
    if (!PacketType) {
      console.error('[Network] Unknown packet for packetId', packetId);
      return;
    }

    try {
      const packet: BasePacket = PacketType.deserialize(rawPacket.body, rawPacket.header);
      
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
          handler.handle(packet, connection, rawPacket.header);
          handled = true;
        } catch (error) {
          // @ts-expect-error commandRequest should be exist
          console.error(`[Network] Error while handling packet ${Packet[packetId]}\n`, error);
        }
      }
      if (!handled) {
        // @ts-expect-error commandRequest should be exist
        console.warn(`[Network] No handler found for packet ${Packet[packetId]}`);
      }
    } catch (error) {
      console.error('[Network] Failed to deserialize packet', error);
    }
  }

  public onConnectionClose(connection: Connection, code: number) {
    const world = this.server.worlds.get(connection);
    this.connections.delete(connection);

    if (!world) {
      connection.clearPendingResponses();
      return;
    }

    world.onDisconnect();
    this.server.worlds.delete(connection);

    new events.WorldRemoveSignal(world, code).emit();
  }
    
  public onClose() {
    this.connections.clear();
    new events.ServerCloseSignal(this.server).emit();
  }

  public registerHandler(handler: typeof NetworkHandler) {
    this.handlers.add(new handler(this.server));
  }

  public unregisterHandler(handler: typeof NetworkHandler) {
    for (const h of this.handlers) {
      if (h.constructor.name === handler.name) {
        this.handlers.delete(h);
        break;
      }
    }
  }

  private getSubscribedPacketIds(): Set<Packet> {
    const subscribedPacketIds = new Set<Packet>();
    for (const registered of this.server.getRegisteredEvents()) {
      for (const packetId of Network.getPacketIdsByEvent(registered)) {
        subscribedPacketIds.add(packetId);
      }
    }

    for (const packetId of this.getRegisteredEvents()) {
      if (packetId === 'all' || packetId === 'raw') continue;
      subscribedPacketIds.add(packetId);
    }

    return subscribedPacketIds;
  }

  /**
   * Send EventSubscribePacket for all registered events to a single connection.
   */
  public sendEventSubscriptions(connection: Connection) {
    for (const packetId of this.getSubscribedPacketIds()) {
      const packet = new EventSubscribePacket();
      packet.eventName = packetId;
      this.send(connection, packet);
    }
  }

  /**
   * Send EventSubscribePacket for all registered events to all connected worlds.
   * Can be used to resubscribe when new events are registered.
   */
  public refreshEventSubscriptions() {
    for (const connection of this.connections) {
      this.sendEventSubscriptions(connection);
    }
  }

  public static getPacketIdsByEvent(event: ServerEvent) {
    const Signal = Object.values(events).find(Signal => Signal.identifier === event);
    if (!Signal) throw new Error(`No Event class found for event ${ServerEvent[event]}`);
    return Signal.packets;
  }
}
