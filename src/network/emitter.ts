import Emitter from '@serenityjs/emitter';
import type { NetworkEvents } from '../types';

export class NetworkEmitter extends Emitter<NetworkEvents> {    
  constructor() {
    super();
  }

  public getRegisteredEvents(): (keyof NetworkEvents)[] {
    return [...((this as any)._listeners as Map<keyof NetworkEvents, any>).keys()];
  }
}
