import { CommandResponseHandler } from './command-response';
import { CommandErrorHandler } from './command-error';
import { EncryptionResponseHandler } from './encryption-response';
import { DataResponseHandler } from './data-response';
import { PlayerMessageHandler } from './player-message';
import { PlayerTransformHandler } from './player-transform';
import { PlayerTravelledHandler } from './player-travelled';
import { BlockBrokenHandler } from './block-broken';
import { BlockPlacedHandler } from './block-placed';
import { ItemAcquiredHandler } from './item-acquired';
import { ItemCraftedHandler } from './item-crafted';
import { ItemEquippedHandler } from './item-equipped';
import { ItemInteractedHandler } from './item-interacted';
import { ItemSmeltedHandler } from './item-smelted';
import { ItemTradedHandler } from './item-traded';
import { MobInteractedHandler } from './mob-interacted';
import { PlayerBouncedHandler } from './player-bounced';
import { PlayerTeleportedHandler } from './player-teleported';
import { TargetBlockHitHandler } from './target-block-hit';

export const Handlers = [
  CommandResponseHandler,
  CommandErrorHandler,
  PlayerMessageHandler,
  EncryptionResponseHandler,
  DataResponseHandler,
  BlockBrokenHandler,
  BlockPlacedHandler,
  ItemAcquiredHandler,
  ItemCraftedHandler,
  ItemEquippedHandler,
  ItemInteractedHandler,
  ItemSmeltedHandler,
  ItemTradedHandler,
  MobInteractedHandler,
  PlayerBouncedHandler,
  PlayerTeleportedHandler,
  PlayerTransformHandler,
  PlayerTravelledHandler,
  TargetBlockHitHandler,
];
