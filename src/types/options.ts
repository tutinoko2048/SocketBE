import type { ServerOptions as WebSocketOptions } from 'ws';

export interface ServerOptions {
  port: number;
  debug?: boolean;
  packetTimeout?: number;
  listUpdateInterval?: number;
  
  /**
   * The version used for requesting commands. More info in Bedrock OSS(link)
   * @example "1.19.70" or [ 1, 19, 70 ] or 31 (internal value)
   * @link https://discord.com/channels/494194063730278411/1075339534797119548/1076028491616768062
   */
  commandVersion?: VersionResolvable;
  
  formatter?: Formatter;

  webSocketOptions?: WebSocketOptions;
}

export type VersionResolvable = string | number | [number, number, number];

export interface Formatter {
  /**
   * This is useful when player nameTag is changed by ScriptAPI
   * and prevents Join/Leave event from spamming because it is based on player's nameTag.
   */
  playerName?: (name: string) => string;
}
