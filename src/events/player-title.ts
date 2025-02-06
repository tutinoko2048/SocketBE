import { PlayerChatSignal } from './player-chat';
import { ServerEvent } from '../enums';
import { RawTextUtil } from '../world';
import type { RawText } from '@minecraft/server';
import type { Player, World } from '../world';
import type { RawTextResolvable } from '../types';


export class PlayerTitleSignal extends PlayerChatSignal implements RawTextResolvable {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerTitle;

  public readonly receiver: Player;

  public constructor(
    world: World,
    sender: Player,
    message: string,
    receiver: Player, 
  ) {
    super(world, sender, message);
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
