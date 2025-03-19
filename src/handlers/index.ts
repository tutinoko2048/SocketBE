import { CommandResponseHandler } from './command-response';
import { CommandErrorHandler } from './command-error';
import { EncryptionResponseHandler } from './encryption-response';
import { DataResponseHandler } from './data-response';
import { PlayerMessageHandler } from './player-message';
import { PlayerTransformHandler } from './player-transform';
import { PlayerTravelledHandler } from './player-travelled';

export const Handlers = [
  CommandResponseHandler,
  CommandErrorHandler,
  PlayerMessageHandler,
  EncryptionResponseHandler,
  DataResponseHandler,
  PlayerTransformHandler,
  PlayerTravelledHandler,
];
