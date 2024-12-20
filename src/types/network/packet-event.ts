import type { PacketBound } from '../../enums';
import type { BasePacket, Connection } from '../../network';
import type { IHeader } from './packet';

export interface NetworkEvent<T extends BasePacket> {
  connection: Connection;
  packet: T;
  bound: PacketBound;
  header: IHeader;
}

export interface RawNetworkEvent<T = Record<string, any>> {
  header: IHeader;
  body: T;
  connection: Connection;
}