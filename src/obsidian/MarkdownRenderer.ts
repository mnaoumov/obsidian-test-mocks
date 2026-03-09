import type {
  App,
  Component,
  HoverPopover,
  MarkdownRenderer as MarkdownRendererOriginal,
  TFile
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { noop } from '../internal/Noop.ts';
import { MarkdownRenderChild } from './MarkdownRenderChild.ts';

export abstract class MarkdownRenderer extends MarkdownRenderChild {
  // eslint-disable-next-line no-restricted-syntax -- Matches obsidian.d.ts declaration; initialized by subclass.
  public app!: App;
  public hoverPopover: HoverPopover | null = null;

  public abstract get file(): TFile;

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public static async render(_app: App, _markdown: string, _el: HTMLElement, _sourcePath: string, _component: Component): Promise<void> {
    noop();
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public static async renderMarkdown(_markdown: string, _el: HTMLElement, _sourcePath: string, _component: Component): Promise<void> {
    noop();
  }

  public override asOriginalType__(): MarkdownRendererOriginal {
    return castTo<MarkdownRendererOriginal>(this);
  }
}
