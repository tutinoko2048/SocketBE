import { Packet } from '../../enums';
import type { BasePacket } from './base';

import { CommandRequestPacket } from './command-request';
import { CommandResponsePacket } from './command-response';
import { CommandErrorPacket } from './command-error';
import { EventSubscribePacket } from './event-subscribe';
import { EventUnsubscribePacket } from './event-unsubscribe';
import { PlayerMessagePacket } from './player-message';
import { EncryptionRequestPacket } from './encryption-request';
import { EncryptionResponsePacket } from './encryption-response';
import { DataRequestPacket } from './data-request';
import { DataResponsePacket } from './data-response';
import { PlayerTravelledPacket } from './player-travelled';


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
  [Packet.PlayerMessage]: PlayerMessagePacket,
  [Packet.PlayerTravelled]: PlayerTravelledPacket,
} satisfies Record<Packet, typeof BasePacket>;
