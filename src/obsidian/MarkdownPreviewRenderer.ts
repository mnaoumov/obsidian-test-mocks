import type {
  MarkdownPostProcessor as MarkdownPostProcessorOriginal,
  MarkdownPreviewRenderer as MarkdownPreviewRendererOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';

export class MarkdownPreviewRenderer {
  private static _postProcessors: MarkdownPostProcessorOriginal[] = [];

  public static registerPostProcessor(postProcessor: MarkdownPostProcessorOriginal, _sortOrder?: number): void {
    MarkdownPreviewRenderer._postProcessors.push(postProcessor);
  }

  public static unregisterPostProcessor(postProcessor: MarkdownPostProcessorOriginal): void {
    MarkdownPreviewRenderer._postProcessors = MarkdownPreviewRenderer._postProcessors.filter((p) => p !== postProcessor);
  }

  public asOriginalType__(): MarkdownPreviewRendererOriginal {
    return castTo<MarkdownPreviewRendererOriginal>(this);
  }
}
