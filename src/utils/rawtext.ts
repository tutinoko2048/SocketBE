import type { RawMessage, RawText } from '@minecraft/server';

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

  /**
   * Creates a RawText object from a string, RawMessage, or an array of strings and/or RawMessages.
   * @param message - The message(s) to be converted into RawText.
   * @returns The resulting RawText object.
   */
  public static createRawText(message: string | RawMessage | (string | RawMessage)[]): RawText {
    const rawtext: RawText = { rawtext: [] };

    if (typeof message === 'string') {
      rawtext.rawtext.push({ text: message });

    } else if (Array.isArray(message)) {
      rawtext.rawtext = message.map(msg => typeof msg === 'string' ? { text: msg } : msg);

    } else {
      rawtext.rawtext.push(message);
    }

    return rawtext;
  }
}