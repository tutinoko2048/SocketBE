import { Packet, PlayerMessageType } from '../enums';
import { PlayerChatSignal, PlayerMessageSignal, PlayerTitleSignal } from '../events';
import { NetworkHandler, type PlayerMessagePacket, type Connection } from '../network';

export class PlayerMessageHandler extends NetworkHandler {
  public static readonly packet = Packet.PlayerMessage;

  public handle(packet: PlayerMessagePacket, connection: Connection): void {
    const world = this.server.getWorldByConnection(connection);
    const { sender, message, receiver } = packet;
    
    switch (packet.type) {
      case PlayerMessageType.Chat: {
        new PlayerChatSignal(world, sender, message).emit();
        break;
      }

      case PlayerMessageType.Tell:
      case PlayerMessageType.Say:
      case PlayerMessageType.Me: {
        new PlayerMessageSignal(world, sender, message, receiver, packet.type).emit();
        break;
      }

      case PlayerMessageType.Title: {
        new PlayerTitleSignal(world, sender, message, receiver).emit();
        break;
      }
      
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unknown player message type: ${packet.type}`);
    }
  }
}
