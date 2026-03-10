import type {
  MarkdownPostProcessor as MarkdownPostProcessorOriginal,
  MarkdownPreviewRenderer as MarkdownPreviewRendererOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class MarkdownPreviewRenderer {
  private static _postProcessors: MarkdownPostProcessorOriginal[] = [];

  public constructor() {
    const self = strictMock(this);
    self.constructor__();
    return self;
  }

  public static registerPostProcessor(postProcessor: MarkdownPostProcessorOriginal, _sortOrder?: number): void {
    MarkdownPreviewRenderer._postProcessors.push(postProcessor);
  }

  public static unregisterPostProcessor(postProcessor: MarkdownPostProcessorOriginal): void {
    MarkdownPreviewRenderer._postProcessors = MarkdownPreviewRenderer._postProcessors.filter((p) => p !== postProcessor);
  }

  public asOriginalType__(): MarkdownPreviewRendererOriginal {
    return castTo<MarkdownPreviewRendererOriginal>(this);
  }

  public constructor__(): void {
    noop();
  }
}
