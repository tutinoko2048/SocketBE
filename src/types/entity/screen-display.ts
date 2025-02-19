import type { RawMessage } from '@minecraft/server';

export interface TitleDisplayOptions {
  subtitle?: string | RawMessage | (string | RawMessage)[];
  times?: TitleTimeOptions;
}

export interface TitleTimeOptions {
  fadeIn: number;
  stay: number;
  fadeOut: number;
}
