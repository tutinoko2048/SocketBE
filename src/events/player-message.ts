import { ServerEvent, type PlayerMessageType } from '../enums';
import type { World } from '../world';
import { PlayerChatSignal } from './player-chat';


type MessageType = PlayerMessageType.Me | PlayerMessageType.Say | PlayerMessageType.Tell;

export class PlayerMessageSignal extends PlayerChatSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerMessage;

  public readonly receiver: string;

  public readonly type: MessageType;

  public constructor(
    world: World, 
    sender: string, 
    message: string, 
    receiver: string, 
    type: MessageType
  ) {
    super(world, sender, message);
    this.receiver = receiver;
    this.type = type;
  }
}
