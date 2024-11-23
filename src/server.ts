import Emitter from '@serenityjs/emitter';
import { Network, type Connection } from './network';
import { Handlers } from './handlers';
import type { RawMessage } from '@minecraft/server';
import type { World } from './world';
import type { CommandResult, ServerEvents, ServerOptions } from './types';

const defaultOption: ServerOptions = {
  port: 8000,
  packetTimeout: 10_000,
  debug: false,
  commandVersion: 31,
  formatter: {}
}

export class Server extends Emitter<ServerEvents> {
  public readonly network: Network;

  public readonly worlds: Map<Connection, World> = new Map();

  public readonly options: ServerOptions;
  
  public readonly startedAt: number = Date.now();
  
  constructor(options?: ServerOptions) {
    super();
    const mergedPptions = { ...defaultOption, ...options };
    this.options = mergedPptions;

    this.network = new Network(this, Handlers);
  }

  public getWorldByConnection(connection: Connection): World | undefined {
    return this.worlds.get(connection);
  }

  public getWorlds() {
    return [...this.worlds.values()];
  }

  /**
   * Sends a command to all the worlds.
   */
  public async broadcastCommand(command: string): Promise<CommandResult<Record<string, any>>[]> {
    const res = this.getWorlds().map(w => w.runCommand(command));
    return await Promise.all(res);
  }
  
  /**
   * Sends a message to all the worlds.
   * @param message The message to be displayed.
   * @param Player name or target selector
   */
  public async broadcastMessage(message: string | RawMessage, target?: string): Promise<void> {
    const res = this.getWorlds().map(w => w.sendMessage(message, target));
    await Promise.all(res);
  }
  
  /**
   * Disconnects all worlds
   */
  public async disconnectAll() {
    return await Promise.all(
      this.getWorlds().map(w => w.disconnect())
    )
  }

  public async stop() {
    await this.disconnectAll();
    this.network.stop();
  }
}
