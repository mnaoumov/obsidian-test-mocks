import type {
  MarkdownPostProcessor,
  MarkdownPreviewRenderer as RealMarkdownPreviewRenderer
} from 'obsidian';
import { strictCastTo } from '../internal/StrictMock.ts';

export class MarkdownPreviewRenderer {
  private static _postProcessors: MarkdownPostProcessor[] = [];

  public static registerPostProcessor(postProcessor: MarkdownPostProcessor, _sortOrder?: number): void {
    MarkdownPreviewRenderer._postProcessors.push(postProcessor);
  }

  public static unregisterPostProcessor(postProcessor: MarkdownPostProcessor): void {
    MarkdownPreviewRenderer._postProcessors = MarkdownPreviewRenderer._postProcessors.filter((p) => p !== postProcessor);
  }

  public asReal__(): RealMarkdownPreviewRenderer {
    return strictCastTo<RealMarkdownPreviewRenderer>(this);
  }
}
