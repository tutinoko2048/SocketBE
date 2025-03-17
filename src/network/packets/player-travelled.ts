import { MessagePurpose, Packet, type TravelMethod } from '../../enums';
import { PacketClass } from '../decorator';
import { BasePacket } from './base';
import type { WorldPlayer } from '../../types';

@PacketClass(Packet.PlayerTravelled, MessagePurpose.Event)
export class PlayerTravelledPacket extends BasePacket {  
  public isUnderwater: boolean;

  public metersTravelled: number;

  public newBiome: number;

  public player: WorldPlayer;

  public travelMethod: TravelMethod;

  public static deserialize(data: Record<string, any>): PlayerTravelledPacket {
    const packet = new PlayerTravelledPacket();
    packet.isUnderwater = data.isUnderwater;
    packet.metersTravelled = data.metersTravelled;
    packet.newBiome = data.newBiome;
    packet.player = data.player;
    packet.travelMethod = data.travelMethod;
    
    return packet;
  }
}