import { Packet, ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';


export class PlayerChatSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerChat;

  public static readonly packets: Packet[] = [Packet.PlayerMessage];
  
  public readonly sender: Player;
  
  public message: string;

  public constructor(world: World, sender: Player, message: string) {
    super(world);
    this.sender = sender;
    this.message = message;
  }
}
