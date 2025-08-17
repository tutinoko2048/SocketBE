import { Emitter } from '@serenityjs/emitter';

export class ExtendedEmitter<T> extends Emitter<T> {    
  constructor() {
    super();
  }

  public getRegisteredEvents(): Set<keyof T> {
    return new Set<keyof T>([
      ...((this as any)._listeners as Map<keyof T, any>).keys(),
      ...((this as any)._beforeHooks as Map<keyof T, any>).keys(),
      ...((this as any)._afterHooks as Map<keyof T, any>).keys(),
    ])
  }
}
