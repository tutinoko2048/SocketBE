import type { Vector3 } from '@minecraft/server';
import type { ItemLockMode } from '../../enums';

export interface WorldPlayer {
  color: string;
  dimension: number;
  id: number;
  name: string;
  position: Vector3;
  type: string;
  variant: number;
  yRot: number;
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