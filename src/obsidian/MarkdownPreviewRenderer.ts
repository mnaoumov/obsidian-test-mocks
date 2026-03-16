import type {
  MarkdownPostProcessor as MarkdownPostProcessorOriginal,
  MarkdownPreviewRenderer as MarkdownPreviewRendererOriginal
} from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';

export class MarkdownPreviewRenderer {
  private static _postProcessors: MarkdownPostProcessorOriginal[] = [];

  public constructor(owner: unknown, containerEl: HTMLElement, parentEl: HTMLElement, workerPath: unknown, observeInsertion?: boolean) {
    const self = createMockOfUnsafe(this);
    self.constructor__(owner, containerEl, parentEl, workerPath, observeInsertion);
    return self;
  }

  public static fromOriginalType__(value: MarkdownPreviewRendererOriginal): MarkdownPreviewRenderer {
    return createMockOfUnsafe<MarkdownPreviewRenderer>(value);
  }

  public static registerPostProcessor(postProcessor: MarkdownPostProcessorOriginal, _sortOrder?: number): void {
    MarkdownPreviewRenderer._postProcessors.push(postProcessor);
  }

  public static unregisterPostProcessor(postProcessor: MarkdownPostProcessorOriginal): void {
    MarkdownPreviewRenderer._postProcessors = MarkdownPreviewRenderer._postProcessors.filter((p) => p !== postProcessor);
  }

  public asOriginalType__(): MarkdownPreviewRendererOriginal {
    return createMockOfUnsafe<MarkdownPreviewRendererOriginal>(this);
  }

  public constructor__(_owner: unknown, _containerEl: HTMLElement, _parentEl: HTMLElement, _workerPath: unknown, _observeInsertion?: boolean): void {
    noop();
  }
}
