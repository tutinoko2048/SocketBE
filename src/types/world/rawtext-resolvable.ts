import type { RawText } from '@minecraft/server';

export interface RawTextResolvable {
  isRawText(): boolean;
  getRawText(): RawText | undefined;
}
