import type { ServerEvent } from '../../enums';
import type {
  PlayerChatSignal,
  PlayerJoinSignal,
  PlayerLeaveSignal,
  PlayerLoadSignal,
  PlayerMessageSignal,
  PlayerTitleSignal,
  WorldAddSignal,
  WorldInitializeSignal,
  WorldRemoveSignal,
} from '../../events';

export interface ServerEvents {
  [ServerEvent.Open]: [];
  [ServerEvent.Close]: [];
  [ServerEvent.WorldAdd]: [WorldAddSignal];
  [ServerEvent.WorldRemove]: [WorldRemoveSignal];
  [ServerEvent.WorldInitialize]: [WorldInitializeSignal];
  [ServerEvent.PlayerJoin]: [PlayerJoinSignal];
  [ServerEvent.PlayerLeave]: [PlayerLeaveSignal];
  [ServerEvent.PlayerLoad]: [PlayerLoadSignal];
  [ServerEvent.PlayerChat]: [PlayerChatSignal];
  [ServerEvent.PlayerMessage]: [PlayerMessageSignal];
  [ServerEvent.PlayerTitle]: [PlayerTitleSignal];
}