import { ServerEvent } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';


export class PlayerChatSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerChat;
  
  public readonly sender: string;
  
  public message: string;

  public constructor(world: World, sender: string, message: string) {
    super(world);
    this.sender = sender;
    this.message = message;
  }
}
