import type {
  App as AppOriginal,
  Component as ComponentOriginal,
  HoverPopover as HoverPopoverOriginal,
  MarkdownRenderer as MarkdownRendererOriginal,
  TFile as TFileOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { MarkdownRenderChild } from './MarkdownRenderChild.ts';

export abstract class MarkdownRenderer extends MarkdownRenderChild {
  // eslint-disable-next-line no-restricted-syntax -- Matches obsidian.d.ts declaration; initialized by subclass.
  public app!: AppOriginal;

  public hoverPopover: HoverPopoverOriginal | null = null;

  public abstract get file(): TFileOriginal;
  public constructor(containerEl: HTMLElement) {
    super(containerEl);
    const self = strictMock(this);
    self.constructor3__(containerEl);
    return self;
  }

  public static async render(_app: AppOriginal, _markdown: string, _el: HTMLElement, _sourcePath: string, _component: ComponentOriginal): Promise<void> {
    await noopAsync();
  }

  public static async renderMarkdown(_markdown: string, _el: HTMLElement, _sourcePath: string, _component: ComponentOriginal): Promise<void> {
    await noopAsync();
  }

  public override asOriginalType__(): MarkdownRendererOriginal {
    return castTo<MarkdownRendererOriginal>(this);
  }

  public constructor3__(_containerEl: HTMLElement): void {
    noop();
  }
}
