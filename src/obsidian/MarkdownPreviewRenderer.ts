import type {
  MarkdownPostProcessor,
  MarkdownPreviewRenderer as MarkdownPreviewRendererOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';

export class MarkdownPreviewRenderer {
  private static _postProcessors: MarkdownPostProcessor[] = [];

  public static registerPostProcessor(postProcessor: MarkdownPostProcessor, _sortOrder?: number): void {
    MarkdownPreviewRenderer._postProcessors.push(postProcessor);
  }

  public static unregisterPostProcessor(postProcessor: MarkdownPostProcessor): void {
    MarkdownPreviewRenderer._postProcessors = MarkdownPreviewRenderer._postProcessors.filter((p) => p !== postProcessor);
  }

  public asOriginalType__(): MarkdownPreviewRendererOriginal {
    return castTo<MarkdownPreviewRendererOriginal>(this);
  }
}
