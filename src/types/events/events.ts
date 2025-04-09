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
  PlayerTravelledSignal,
  EnableEncryptionSignal,
  BlockBrokenSignal,
  BlockPlacedSignal,
  ItemAcquiredSignal,
  ItemCraftedSignal,
  ItemEquippedSignal,
  ItemInteractedSignal,
  ItemSmeltedSignal,
  ItemTradedSignal,
  MobInteractedSignal,
  PlayerBouncedSignal,
  PlayerTeleportedSignal,
  PlayerTransformSignal,
  TargetBlockHitSignal,
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
  [ServerEvent.PlayerTitle]: [PlayerTitleSignal];
  [ServerEvent.PlayerMessage]: [PlayerMessageSignal];
  [ServerEvent.EnableEncryption]: [EnableEncryptionSignal];
  [ServerEvent.BlockBroken]: [BlockBrokenSignal];
  [ServerEvent.BlockPlaced]: [BlockPlacedSignal];
  [ServerEvent.ItemAcquired]: [ItemAcquiredSignal];
  [ServerEvent.ItemCrafted]: [ItemCraftedSignal];
  [ServerEvent.ItemEquipped]: [ItemEquippedSignal];
  [ServerEvent.ItemInteracted]: [ItemInteractedSignal];
  [ServerEvent.ItemSmelted]: [ItemSmeltedSignal];
  [ServerEvent.ItemTraded]: [ItemTradedSignal];
  [ServerEvent.MobInteracted]: [MobInteractedSignal];
  [ServerEvent.PlayerBounced]: [PlayerBouncedSignal];
  [ServerEvent.PlayerTeleported]: [PlayerTeleportedSignal];
  [ServerEvent.PlayerTransform]: [PlayerTransformSignal];
  [ServerEvent.PlayerTravelled]: [PlayerTravelledSignal];
  [ServerEvent.TargetBlockHit]: [TargetBlockHitSignal];
}