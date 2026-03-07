import type { MarkdownPostProcessor } from 'obsidian';

import { noop } from '../internal/Noop.ts';

export class MarkdownPreviewRenderer {
  public static registerPostProcessor(_postProcessor: MarkdownPostProcessor, _sortOrder?: number): void {
    noop();
  }

  public static unregisterPostProcessor(_postProcessor: MarkdownPostProcessor): void {
    noop();
  }
}
