import { Player, type World } from '../structures';

export class PlayerManager {
  public readonly world: World;
  private readonly players = new Map<string, Player>();

  constructor(world: World) {
    this.world = world;
  }

  public add(playerName: string): Player {
    const player = new Player(this.world, playerName);
    this.players.set(playerName, player);
    return player;
  }

  public remove(playerName: string): void {
    this.players.delete(playerName);
  }

  public get(playerName: string): Player | undefined {
    return this.players.get(playerName);
  }

  public getAll(): Player[] {
    return [...this.players.values()];
  }
}