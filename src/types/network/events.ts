import type { NetworkEvent, RawNetworkEvent } from './packet-event';
import type { Packet } from '../../enums';
import type {
  BasePacket,
  CommandErrorPacket,
  CommandRequestPacket,
  CommandResponsePacket,
  DataRequestPacket,
  DataResponsePacket,
  EventSubscribePacket,
  EventUnsubscribePacket,
  EncryptionRequestPacket,
  EncryptionResponsePacket,
  BlockBrokenPacket,
  BlockPlacedPacket,
  ItemAcquiredPacket,
  ItemCraftedPacket,
  ItemEquippedPacket,
  ItemInteractedPacket,
  ItemSmeltedPacket,
  ItemTradedPacket,
  MobInteractedPacket,
  PlayerBouncedPacket,
  PlayerMessagePacket,
  PlayerTeleportedPacket,
  PlayerTransformPacket,
  PlayerTravelledPacket,
  TargetBlockHitPacket,
  EndOfDayPacket,
  ItemUsedPacket,
  MobKilledPacket,
  PlayerDiedPacket,
  ItemDroppedPacket,
  EntitySpawnedPacket,
} from '../../network';

export interface NetworkEvents {
  all: [NetworkEvent<BasePacket>];
  /**
   * Fired for any sevrer-bound packet.
   */
  raw: [RawNetworkEvent];

  [Packet.CommandRequest]: [NetworkEvent<CommandRequestPacket>];
  [Packet.CommandResponse]: [NetworkEvent<CommandResponsePacket>];
  [Packet.CommandError]: [NetworkEvent<CommandErrorPacket>];
  [Packet.DataRequest]: [NetworkEvent<DataRequestPacket>];
  [Packet.DataResponse]: [NetworkEvent<DataResponsePacket>];
  [Packet.EventSubscribe]: [NetworkEvent<EventSubscribePacket>];
  [Packet.EventUnsubscribe]: [NetworkEvent<EventUnsubscribePacket>];
  [Packet.EncryptionRequest]: [NetworkEvent<EncryptionRequestPacket>];
  [Packet.EncryptionResponse]: [NetworkEvent<EncryptionResponsePacket>];

  // --- mc event packets ---
  [Packet.BlockBroken]: [NetworkEvent<BlockBrokenPacket>];
  [Packet.BlockPlaced]: [NetworkEvent<BlockPlacedPacket>];
  [Packet.ItemAcquired]: [NetworkEvent<ItemAcquiredPacket>];
  [Packet.ItemCrafted]: [NetworkEvent<ItemCraftedPacket>];
  [Packet.ItemEquipped]: [NetworkEvent<ItemEquippedPacket>];
  [Packet.ItemInteracted]: [NetworkEvent<ItemInteractedPacket>];
  [Packet.ItemSmelted]: [NetworkEvent<ItemSmeltedPacket>];
  [Packet.ItemTraded]: [NetworkEvent<ItemTradedPacket>];
  [Packet.MobInteracted]: [NetworkEvent<MobInteractedPacket>];
  [Packet.PlayerBounced]: [NetworkEvent<PlayerBouncedPacket>];
  [Packet.PlayerMessage]: [NetworkEvent<PlayerMessagePacket>];
  [Packet.PlayerTeleported]: [NetworkEvent<PlayerTeleportedPacket>];
  [Packet.PlayerTransform]: [NetworkEvent<PlayerTransformPacket>];
  [Packet.PlayerTravelled]: [NetworkEvent<PlayerTravelledPacket>];
  [Packet.TargetBlockHit]: [NetworkEvent<TargetBlockHitPacket>];
  [Packet.EndOfDay]: [NetworkEvent<EndOfDayPacket>];
  [Packet.ItemUsed]: [NetworkEvent<ItemUsedPacket>];
  [Packet.MobKilled]: [NetworkEvent<MobKilledPacket>];
  [Packet.PlayerDied]: [NetworkEvent<PlayerDiedPacket>];
  [Packet.ItemDropped]: [NetworkEvent<ItemDroppedPacket>];
  [Packet.EntitySpawned]: [NetworkEvent<EntitySpawnedPacket>];
}
