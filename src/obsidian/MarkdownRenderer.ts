import type {
  App,
  Component,
  HoverPopover,
  MarkdownRenderer as RealMarkdownRenderer,
  TFile
} from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { MarkdownRenderChild } from './MarkdownRenderChild.ts';

export abstract class MarkdownRenderer extends MarkdownRenderChild {
  public app!: App;
  public hoverPopover: HoverPopover | null = null;

  public abstract get file(): TFile;

  public static async render(_app: App, _markdown: string, _el: HTMLElement, _sourcePath: string, _component: Component): Promise<void> {
  }

  public static async renderMarkdown(_markdown: string, _el: HTMLElement, _sourcePath: string, _component: Component): Promise<void> {
  }

  public override asReal__(): RealMarkdownRenderer {
    return strictCastTo<RealMarkdownRenderer>(this);
  }
}
