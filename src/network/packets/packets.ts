import { Packet } from '../../enums';
import type { BasePacket } from './base';

import { CommandRequestPacket } from './command-request';
import { CommandResponsePacket } from './command-response';
import { CommandErrorPacket } from './command-error';
import { DataRequestPacket } from './data-request';
import { DataResponsePacket } from './data-response';
import { EventSubscribePacket } from './event-subscribe';
import { EventUnsubscribePacket } from './event-unsubscribe';
import { EncryptionRequestPacket } from './encryption-request';
import { EncryptionResponsePacket } from './encryption-response';
import { BlockBrokenPacket } from './block-broken';
import { BlockPlacedPacket } from './block-placed';
import { ItemAcquiredPacket } from './item-acquired';
import { ItemCraftedPacket } from './item-crafted';
import { ItemEquippedPacket } from './item-equipped';
import { ItemInteractedPacket } from './item-interacted';
import { ItemSmeltedPacket } from './item-smelted';
import { ItemTradedPacket } from './item-traded';
import { MobInteractedPacket } from './mob-interacted';
import { PlayerBouncedPacket } from './player-bounced';
import { PlayerMessagePacket } from './player-message';
import { PlayerTeleportedPacket } from './player-teleported';
import { PlayerTransformPacket } from './player-transform';
import { PlayerTravelledPacket } from './player-travelled';
import { TargetBlockHitPacket } from './target-block-hit';


export const Packets = {
  [Packet.CommandRequest]: CommandRequestPacket,
  [Packet.CommandResponse]: CommandResponsePacket,
  [Packet.CommandError]: CommandErrorPacket,
  [Packet.DataRequest]: DataRequestPacket,
  [Packet.DataResponse]: DataResponsePacket,
  [Packet.EventSubscribe]: EventSubscribePacket,
  [Packet.EventUnsubscribe]: EventUnsubscribePacket,
  [Packet.EncryptionRequest]: EncryptionRequestPacket,
  [Packet.EncryptionResponse]: EncryptionResponsePacket,

  // --- mc event packets ---
  [Packet.BlockBroken]: BlockBrokenPacket,
  [Packet.BlockPlaced]: BlockPlacedPacket,
  [Packet.ItemAcquired]: ItemAcquiredPacket,
  [Packet.ItemCrafted]: ItemCraftedPacket,
  [Packet.ItemEquipped]: ItemEquippedPacket,
  [Packet.ItemInteracted]: ItemInteractedPacket,
  [Packet.ItemSmelted]: ItemSmeltedPacket,
  [Packet.ItemTraded]: ItemTradedPacket,
  [Packet.MobInteracted]: MobInteractedPacket,
  [Packet.PlayerBounced]: PlayerBouncedPacket,
  [Packet.PlayerMessage]: PlayerMessagePacket,
  [Packet.PlayerTeleported]: PlayerTeleportedPacket,
  [Packet.PlayerTransform]: PlayerTransformPacket,
  [Packet.PlayerTravelled]: PlayerTravelledPacket,
  [Packet.TargetBlockHit]: TargetBlockHitPacket,
} satisfies Record<Packet, typeof BasePacket>;
