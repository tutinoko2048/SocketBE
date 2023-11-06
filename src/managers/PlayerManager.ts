import { Player, type World } from '../structures';

export class PlayerManager {
  public readonly world: World;
  private readonly players = new Map<string, Player>();

  constructor(world: World) {
    this.world = world;
  }

  public create(playerName: string): Player {
    const player = new Player(this.world, playerName);
    this.players.set(playerName, player);
    return player;
  }

  public delete(playerName: string): void {
    this.players.delete(playerName);
  }

  public has(playerName: string | Player): boolean {
    return this.players.has(playerName instanceof Player ? playerName.rawName : playerName);
  }

  /** 
   * @param playerName Raw name of the player.
   */
  public get(playerName: string): Player | undefined {
    return this.players.get(playerName);
  }

  public getAll(): Player[] {
    return [...this.players.values()];
  }
}