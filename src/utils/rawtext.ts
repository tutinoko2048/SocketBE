import type { RawText } from '@minecraft/server';

export class RawTextUtil {
  public static isRawText(text: string): boolean {
    return text.startsWith('{') && text.endsWith('}\n');
  }
  
  /** @throws */
  public static parseRawText(text: string): RawText {
    if (!this.isRawText(text)) throw new SyntaxError('Text is not rawtext');
    
    const rawtext: RawText = JSON.parse(text);
    
    if (!('rawtext' in rawtext)) throw new SyntaxError('Invalid rawtext');

    return rawtext;
  }
}