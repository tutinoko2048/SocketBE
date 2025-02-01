import { CommandResponseHandler } from './command-response';
import { CommandErrorHandler } from './command-error';
import { PlayerMessageHandler } from './player-message';

export const Handlers = [
  CommandResponseHandler,
  CommandErrorHandler,
  PlayerMessageHandler,
];
