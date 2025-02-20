import { CommandResponseHandler } from './command-response';
import { CommandErrorHandler } from './command-error';
import { PlayerMessageHandler } from './player-message';
import { EncryptionResponseHandler } from './encryption-response';

export const Handlers = [
  CommandResponseHandler,
  CommandErrorHandler,
  PlayerMessageHandler,
  EncryptionResponseHandler,
];
