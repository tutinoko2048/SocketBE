import type { VersionResolvable } from '../options';

export interface CommandOptions {
  /** If true, the function immediately return empty response without waiting for minecraft response. */
  noResponse?: boolean;
  /** in milliseconds */
  timeout?: number;
  /** Override the version of command request. */
  version?: VersionResolvable;
}