import type { MarkdownPostProcessor } from 'obsidian';

export class MarkdownPreviewRenderer {
  private static _postProcessors: MarkdownPostProcessor[] = [];

  public static registerPostProcessor(postProcessor: MarkdownPostProcessor, _sortOrder?: number): void {
    MarkdownPreviewRenderer._postProcessors.push(postProcessor);
  }

  public static unregisterPostProcessor(postProcessor: MarkdownPostProcessor): void {
    MarkdownPreviewRenderer._postProcessors = MarkdownPreviewRenderer._postProcessors.filter((p) => p !== postProcessor);
  }
}
