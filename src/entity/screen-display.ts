import { RawTextUtil } from '../world';
import { CommandStatusCode } from '../enums';
import type { RawMessage } from '@minecraft/server';
import type { Player } from './player';
import type { TitleDisplayOptions, TitleTimeOptions } from '../types';

export class ScreenDisplay {
  public constructor(
    private readonly player: Player
  ) {}

  public get isValid() {
    return this.player.isValid;
  }

  /**
    '- /titleraw <player: target> <titleLocation: TitleRawSet> <raw json titleText: json>\n' +
    '- /titleraw <player: target> clear\n' +
    '- /titleraw <player: target> reset\n' +
    '- /titleraw <player: target> times <fadeIn: int> <stay: int> <fadeOut: int>'
   */

  public async setTitle(
    title: string | RawMessage | (string | RawMessage)[],
    options?: TitleDisplayOptions,
  ) {
    const promises: Promise<void>[] = [];

    if (options?.subtitle) {
      promises.push(this.updateSubtitle(options.subtitle));
    }
    
    if (options?.times) {
      const { fadeIn, fadeOut, stay } = options.times;
      promises.push(this.setTitleDuration({ fadeIn, fadeOut, stay }));
    }
    
    promises.push((async () => {
      const rawTitle = RawTextUtil.createRawText(title);
      const res = await this.player.world.runCommand(
        `titleraw "${this.player.rawName}" title ${JSON.stringify(rawTitle)}`
      );
      if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
    })());

    await Promise.all(promises);
  }

  public async updateSubtitle(
    subtitle: string | RawMessage | (string | RawMessage)[]
  ) {
    const rawText = RawTextUtil.createRawText(subtitle);
    const res = await this.player.world.runCommand(
      `titleraw "${this.player.rawName}" subtitle ${JSON.stringify(rawText)}`
    );
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async setActionBar(
    text: string | RawMessage | (string | RawMessage)[]
  ) {
    const rawText = RawTextUtil.createRawText(text);
    const res = await this.player.world.runCommand(
      `titleraw "${this.player.rawName}" actionbar ${JSON.stringify(rawText)}`
    );
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  public async setTitleDuration(options: TitleTimeOptions) {
    const { fadeIn, fadeOut, stay } = options;
    const res = await this.player.world.runCommand(
      `titleraw "${this.player.rawName}" times ${fadeIn} ${stay} ${fadeOut}`
    );
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * Clear the title from the screen.
   */
  public async clearTitle() {
    const res = await this.player.world.runCommand(
      `titleraw "${this.player.rawName}" clear`
    );
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }

  /**
   * Reset the title to the default settings.
   */
  public async resetTitle() {
    const res = await this.player.world.runCommand(
      `titleraw "${this.player.rawName}" reset`
    );
    if (res.statusCode < CommandStatusCode.Success) throw new Error(res.statusMessage);
  }
}