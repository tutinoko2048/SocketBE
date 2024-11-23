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
}

export interface PlayerListDetail extends PlayerList {
  details: PlayerDetail[];
}