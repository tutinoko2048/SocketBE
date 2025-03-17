import { Packet, ServerEvent, type TravelMethod } from '../enums';
import { WorldEventSignal } from './world-event-signal';
import type { World } from '../world';
import type { Player } from '../entity';
import type { WorldPlayer } from '../types';

export class PlayerTravelledSignal extends WorldEventSignal {
  public static readonly identifier: ServerEvent = ServerEvent.PlayerTravelled;

  public static readonly packets: Packet[] = [Packet.PlayerTravelled];
  
  public readonly isUnderwater: boolean;

  public readonly metersTravelled: number;

  public readonly newBiome: number;

  public readonly player: Player;

  public readonly travelMethod: TravelMethod;

  public readonly rawPlayer: WorldPlayer;

  public constructor(
    world: World,
    isUnderwater: boolean,
    metersTravelled: number,
    newBiome: number,
    player: Player,
    travelMethod: TravelMethod,
    rawPlayer: WorldPlayer
  ) {
    super(world);
    this.isUnderwater = isUnderwater;
    this.metersTravelled = metersTravelled;
    this.newBiome = newBiome;
    this.player = player;
    this.travelMethod = travelMethod;
    this.rawPlayer = rawPlayer;
  }
}
