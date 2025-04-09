import type { Vector3 } from '@minecraft/server';
import type { ItemLockMode } from '../../enums';
import type { WorldEntity } from './entity';

export interface WorldPlayer extends WorldEntity {
  /** map marker color */
  color: string;
  name: string;
}

export interface PlayerList {
  current: number;
  max: number;
  players: string[];
}

export interface PlayerDetail {
  activeSessionId: string;
  avgpacketloss: number;
  avgping: number;
  clientId: string;
  color: string;
  deviceSessionId: string;
  globalMultiplayerCorrelationId: string;
  id: number;
  maxbps: number;
  name: string;
  packetloss: number;
  ping: number;
  randomId: number;
  uuid: string;

  /** Only on bedrock server */
  xuid?: string;
}

export interface PlayerListDetail extends PlayerList {
  details: PlayerDetail[];
}

export interface QueryTargetResult {
  dimension: number;
  id: number;
  position: Vector3;
  uniqueId: string;
  yRot: number;
}

export interface GiveItemOptions {
  data?: number;
  canDestroy?: string[];
  canPlaceOn?: string[];
  lockMode?: ItemLockMode;
  keepOnDeath?: boolean;
}