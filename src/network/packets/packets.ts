import { Packet } from '../../enums';

import { CommandRequestPacket } from './command-request';
import { CommandResponsePacket } from './command-response';
import { CommandErrorPacket } from './command-error';
import { EventSubscribePacket } from './event-subscribe';
import { EventUnsubscribePacket } from './event-unsubscribe';
import { PlayerMessagePacket } from './player-message';
import { EncryptionRequestPacket } from './encryption-request';
import { EncryptionResponsePacket } from './encryption-response';


export const Packets = {
  [Packet.CommandRequest]: CommandRequestPacket,
  [Packet.CommandResponse]: CommandResponsePacket,
  [Packet.CommandError]: CommandErrorPacket,
  [Packet.PlayerMessage]: PlayerMessagePacket,
  [Packet.EventSubscribe]: EventSubscribePacket,
  [Packet.EventUnsubscribe]: EventUnsubscribePacket,
  [Packet.EncryptionRequest]: EncryptionRequestPacket,
  [Packet.EncryptionResponse]: EncryptionResponsePacket,
};
