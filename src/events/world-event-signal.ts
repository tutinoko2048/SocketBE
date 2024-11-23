import type { World } from '../world';
import { EventSignal } from './event-signal';


export class WorldEventSignal extends EventSignal {
  public readonly world: World;

  public constructor(world: World) {
    super(world.server);
    this.world = world;
  }
}
