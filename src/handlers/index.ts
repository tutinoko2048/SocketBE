import { CommandResponseHandler } from './command-response';
import { CommandErrorHandler } from './command-error';
import { PlayerMessageHandler } from './player-message';
import { EncryptionResponseHandler } from './encryption-response';
import { DataResponseHandler } from './data-response';

export const Handlers = [
  CommandResponseHandler,
  CommandErrorHandler,
  PlayerMessageHandler,
  EncryptionResponseHandler,
  DataResponseHandler,
];
