import { ServerEvent, type PlayerMessageType } from '../enums';
import { PlayerChatSignal } from './player-chat';
import type { RawText } from '@minecraft/server';
import type { Player, World } from '../world';


type MessageType = PlayerMessageType.Me | PlayerMessageType.Say | PlayerMessageType.Tell;

export class PlayerMessageSignal extends PlayerChatSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerMessage;

  public readonly receiver: string;

  public readonly type: MessageType;

  public constructor(
    world: World, 
    sender: Player, 
    message: string, 
    receiver: string, 
    type: MessageType
  ) {
    super(world, sender, message);
    this.receiver = receiver;
    this.type = type;
  }

  public getRawText(): RawText | undefined {
    try {
      return JSON.parse(this.message) as RawText;
    } catch {}
  }
}
