import type {
  App,
  Component,
  HoverPopover,
  MarkdownRenderer as MarkdownRendererOriginal,
  TFile
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { MarkdownRenderChild } from './MarkdownRenderChild.ts';

export abstract class MarkdownRenderer extends MarkdownRenderChild {
  // eslint-disable-next-line no-restricted-syntax -- Matches obsidian.d.ts declaration; initialized by subclass.
  public app!: App;
  public hoverPopover: HoverPopover | null = null;

  public abstract get file(): TFile;

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- Noop stub matching obsidian.d.ts.
  public static async render(_app: App, _markdown: string, _el: HTMLElement, _sourcePath: string, _component: Component): Promise<void> {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- Noop stub matching obsidian.d.ts.
  public static async renderMarkdown(_markdown: string, _el: HTMLElement, _sourcePath: string, _component: Component): Promise<void> {
  }

  public override asOriginalType__(): MarkdownRendererOriginal {
    return castTo<MarkdownRendererOriginal>(this);
  }
}
