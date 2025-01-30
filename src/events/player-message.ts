import { PlayerChatSignal } from './player-chat';
import { ServerEvent, type PlayerMessageType } from '../enums';
import { RawTextUtil } from '../utils';
import type { RawText } from '@minecraft/server';
import type { Player, World } from '../world';
import type { RawTextResolvable } from '../types';


type MessageType = PlayerMessageType.Me | PlayerMessageType.Say | PlayerMessageType.Tell;

export class PlayerMessageSignal extends PlayerChatSignal implements RawTextResolvable {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerMessage;

  public readonly type: MessageType;
  
  public readonly receiver?: Player;

  public constructor(
    world: World, 
    sender: Player, 
    message: string, 
    type: MessageType,
    receiver?: Player, 
  ) {
    super(world, sender, message);
    this.type = type;
    this.receiver = receiver;
  }

  public isRawText(): boolean {
    return RawTextUtil.isRawText(this.message);
  }

  public getRawText(): RawText | undefined {
    try {
      return RawTextUtil.parseRawText(this.message);
    } catch {}
  }
}
