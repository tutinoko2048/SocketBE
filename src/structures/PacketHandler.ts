import { RawData } from 'ws';
import { CommandRequestPacket, CommandResponsePacket, PlayerMessageType, ServerPacket } from '../types';
import type { Server } from '../Server';
import type { World } from './World';
import { PlayerChatEvent, PlayerTitleEvent, ServerEventTypes } from './ServerEvents';

export class PacketHandler {
  public readonly world: World;
  public readonly pendingResponses: Map<string, (arg: CommandResponsePacket) => void>;
  public readonly responseTimes: number[];

  constructor(world: World) {
    this.world = world;
    this.pendingResponses = new Map();
  }

  public handle(data: RawData) {
    try {
      const packet = JSON.parse(data.toString('utf-8')) as ServerPacket;
      const { header, body } = packet;

      if (header.messagePurpose === 'event') {
        this.world.server.rawEvents.emit(header.eventName, { ...body, world: this });

        if (header.eventName === 'PlayerMessage') {
          const event = structuredClone(body);
          event.world = this.world;

          if (typeof event.sender === 'string')
            event.sender = this.world.server.options.formatter.playerName?.(event.sender) ?? event.sender;
          if (typeof event.receiver === 'string')
            event.receiver = this.world.server.options.formatter.playerName?.(event.receiver) ?? event.receiver;

          if (event.type === PlayerMessageType.Title) {
            this.world.server.events.emit(ServerEventTypes.PlayerTitle, event as PlayerTitleEvent);
          } else {
            this.world.server.events.emit(ServerEventTypes.PlayerChat, event as PlayerChatEvent);
          }
        }
      }

      if (header.messagePurpose === 'commandResponse' || header.messagePurpose === 'error') {
        if (this.pendingResponses.has(header.requestId)) {
          this.pendingResponses.get(header.requestId)?.(packet as CommandResponsePacket);
          this.pendingResponses.delete(header.requestId);
        }
      }

      this.world.server.events.emit(ServerEventTypes.PacketReceive, { packet, world: this.world });

    } catch(error) {
      this.world.logger.error(`Failed to parse inbound packet: ${error}`);
    }
  }

  /** Sends a packet to the world. */
  public send(packet: ServerPacket): void {
    this.world.ws.send(JSON.stringify(packet));
    this.world.server.events.emit(ServerEventTypes.PacketSend, { packet, world: this.world });
  }

  /**
   * Register the packet to pending packet queue and returns the response.
   * @param packet CommandRequest packet
   * @returns CommandResponse packet
   */
  public getCommandResponse(packet: CommandRequestPacket): Promise<CommandResponsePacket> {
    const packetId = packet.header.requestId;
    const sentAt = Date.now();

    return new Promise((resolve, reject) => {
      if (this.world.ws.readyState !== WebSocket.OPEN) return reject(new Error(`Client is offline\npacket: ${JSON.stringify(packet, null, 2)}`));

      const timeout = setTimeout(() => {
        reject(new Error(`Response timeout\npacket: ${JSON.stringify(packet, null, 2)}`));
      }, this.world.server.options.packetTimeout);

      this.pendingResponses.set(packetId, (response) => {
        clearTimeout(timeout);
        if (this.responseTimes.length > 20) this.responseTimes.shift();
        this.responseTimes.push(Date.now() - sentAt);
        resolve(response);
      });
    });
  }
}
