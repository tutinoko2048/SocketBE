import { ServerEvent } from '../enums';
import type { Player, World } from '../world';
import { PlayerChatSignal } from './player-chat';


export class PlayerTitleSignal extends PlayerChatSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerTitle;

  public readonly receiver: string;

  public constructor(
    world: World, 
    sender: Player, 
    message: string,
    receiver: string, 
  ) {
    super(world, sender, message);
    this.receiver = receiver;
  }
}
