/**
 * @file
 *
 * Mock of Obsidian's `MarkdownPreviewRenderer`, which renders Markdown in reading view and runs post-processors.
 */

import type {
  MarkdownPostProcessorContext as MarkdownPostProcessorContextOriginal,
  MarkdownPostProcessor as MarkdownPostProcessorOriginal,
  MarkdownPreviewRenderer as MarkdownPreviewRendererOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `MarkdownPreviewRenderer`.
 *
 * Nothing is rendered: registered post-processors are only kept in a private list, and none of them ever runs.
 */
export class MarkdownPreviewRenderer {
  private static _postProcessors: MarkdownPostProcessorOriginal[] = [];

  /**
   * Creates a preview renderer. Obsidian constructs these internally.
   *
   * @param owner - The component that owns the renderer.
   * @param containerEl - The element the rendered sections are placed in.
   * @param parentEl - The scrollable parent of `containerEl`.
   * @param workerPath - The worker used to parse Markdown off the main thread.
   * @param observeInsertion - Whether to watch for the container being inserted into the DOM.
   */
  public constructor(owner: unknown, containerEl: HTMLElement, parentEl: HTMLElement, workerPath: unknown, observeInsertion?: boolean) {
    const self = strictProxy(this);
    self.constructor__(owner, containerEl, parentEl, workerPath, observeInsertion);
    return self;
  }

  /**
   * Wraps a code block handler into a post-processor for fenced code blocks of one language.
   *
   * The mock's post-processor does nothing: it never finds code blocks and never calls `_handler`.
   *
   * @param _language - The code block language the handler is for.
   * @param _handler - The handler that renders a code block's source into an element.
   * @returns A post-processor that is a no-op.
   */
  public static createCodeBlockPostProcessor(
    _language: string,
    _handler: (source: string, el: HTMLElement, context: MarkdownPostProcessorContextOriginal) => unknown
  ): (el: HTMLElement, context: MarkdownPostProcessorContextOriginal) => void {
    // eslint-disable-next-line func-names -- Mock implementation.
    return function (_el: HTMLElement, _context: MarkdownPostProcessorContextOriginal): void {
      noop();
    };
  }

  /**
   * Mock-only: views a value typed as Obsidian's `MarkdownPreviewRenderer` as this mock.
   *
   * @param value - The value typed as the original `MarkdownPreviewRenderer`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: MarkdownPreviewRendererOriginal): MarkdownPreviewRenderer {
    return strictProxy(value, MarkdownPreviewRenderer);
  }

  /**
   * Registers a post-processor that runs on every rendered Markdown section.
   *
   * The mock records it but never runs it, and ignores the sort order.
   *
   * @param postProcessor - The post-processor to register.
   * @param _sortOrder - Where the post-processor runs relative to others; ignored by the mock.
   */
  public static registerPostProcessor(postProcessor: MarkdownPostProcessorOriginal, _sortOrder?: number): void {
    MarkdownPreviewRenderer._postProcessors.push(postProcessor);
  }

  /**
   * Unregisters a post-processor, removing every registration of it.
   *
   * @param postProcessor - The post-processor to remove.
   */
  public static unregisterPostProcessor(postProcessor: MarkdownPostProcessorOriginal): void {
    MarkdownPreviewRenderer._postProcessors = MarkdownPreviewRenderer._postProcessors.filter((p) => p !== postProcessor);
  }

  /**
   * Mock-only: views this mock as Obsidian's `MarkdownPreviewRenderer` type.
   *
   * @returns The same object, typed as the original `MarkdownPreviewRenderer`.
   */
  public asOriginalType__(): MarkdownPreviewRendererOriginal {
    return strictProxy<MarkdownPreviewRendererOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(MarkdownPreviewRenderer.prototype, 'constructor__')`.
   *
   * @param _owner - The owner the renderer was created with.
   * @param _containerEl - The container element the renderer was created with.
   * @param _parentEl - The parent element the renderer was created with.
   * @param _workerPath - The worker the renderer was created with.
   * @param _observeInsertion - The insertion-observing flag the renderer was created with.
   */
  public constructor__(_owner: unknown, _containerEl: HTMLElement, _parentEl: HTMLElement, _workerPath: unknown, _observeInsertion?: boolean): void {
    noop();
  }
}
