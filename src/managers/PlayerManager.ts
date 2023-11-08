import { Player, ServerEventTypes, type World } from '../structures';

export class PlayerManager {
  public readonly world: World;
  private readonly players = new Map<string, Player>();
  private lastPlayerNames: string[] = [];
  private countInterval: NodeJS.Timeout | null;

  constructor(world: World) {
    this.world = world;
    this.startPlayerCounter();
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

  public async updatePlayerList(): Promise<void> {
    try {
      const { players, max } = await this.world.getPlayerList();
      
      const join = players.filter(name => this.lastPlayerNames.indexOf(name) === -1);
      const leave = this.lastPlayerNames.filter(name => players.indexOf(name) === -1);

      this.lastPlayerNames = players;
      this.world.maxPlayers = max;

      join.forEach(name => this.create(name));
      if (join.length > 0) this.world.server.events.emit(ServerEventTypes.PlayerJoin, { world: this.world, joinedPlayers: join });

      if (leave.length > 0) this.world.server.events.emit(ServerEventTypes.PlayerLeave, { world: this.world, leftPlayers: leave });
      leave.forEach(name => this.players.delete(name));
    } catch {}
  }

  public startPlayerCounter(): void {
    if (this.countInterval) return;
    this.updatePlayerList();
    this.countInterval = setInterval(
      () => this.updatePlayerList(),
      this.world.server.options.listUpdateInterval
    );
  }

  public stopPlayerCounter(): void {
    if (!this.countInterval) return;
    clearInterval(this.countInterval);
    this.countInterval = null;
  }
}