import type { ServerEvent } from '../../enums';
import type {
  PlayerChatSignal,
  PlayerJoinSignal,
  PlayerLeaveSignal,
  PlayerMessageSignal,
  PlayerTitleSignal,
} from '../../events';

export interface ServerEvents {
  [ServerEvent.Open]: [];
  [ServerEvent.Close]: [];
  //TODO - add world events
  [ServerEvent.WorldAdd]: [];
  [ServerEvent.WorldRemove]: [];

  [ServerEvent.PlayerJoin]: [PlayerJoinSignal];
  [ServerEvent.PlayerLeave]: [PlayerLeaveSignal];
  [ServerEvent.PlayerChat]: [PlayerChatSignal];
  [ServerEvent.PlayerMessage]: [PlayerMessageSignal];
  [ServerEvent.PlayerTitle]: [PlayerTitleSignal];
}