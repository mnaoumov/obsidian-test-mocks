/**
 * @file
 *
 * Mock of Obsidian's `MarkdownPreviewView`, the reading mode of a Markdown view.
 */

import type { MarkdownPreviewView as MarkdownPreviewViewOriginal } from 'obsidian';

import type { MarkdownView } from './MarkdownView.ts';
import type { TFile } from './TFile.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { MarkdownRenderer } from './MarkdownRenderer.ts';

/**
 * Mock of Obsidian's `MarkdownPreviewView`.
 *
 * Nothing is rendered: the text passed to {@link MarkdownPreviewView.set} and the scroll position are only
 * remembered. The owning view registers it as its reading mode, so `setViewData(data, true)` and `clear()` reach
 * it as they reach the edit mode; the mock is never IN reading mode, so `getViewData()` never reads it.
 */
export class MarkdownPreviewView extends MarkdownRenderer {
  /**
   * The element the preview renders into; shared with the owning Markdown view.
   */
  public override containerEl: HTMLElement;

  /**
   * The mode this view is, as `MarkdownView.registerMode` keys it and `MarkdownView.getMode()` reports it.
   */
  public readonly type = 'preview';

  /**
   * The file open in the owning Markdown view.
   *
   * @returns The Markdown view's file; the mock throws when that view has no file.
   */
  public get file(): TFile {
    return ensureNonNullable(this.markdownView.file);
  }

  private data = '';
  private readonly markdownView: MarkdownView;
  private scroll = 0;

  /**
   * Creates the reading mode of a Markdown view.
   *
   * @param markdownView - The Markdown view that owns this mode.
   */
  public constructor(markdownView: MarkdownView) {
    super(markdownView.app, markdownView.containerEl);
    this.containerEl = markdownView.containerEl;
    this.markdownView = markdownView;
    const self = strictProxy(this);
    self.constructor4__(markdownView);
    return self;
  }

  /**
   * Mock-only factory: creates a preview view, spyable via `vi.spyOn(MarkdownPreviewView, 'create3__')`. The
   * subclass variant of `MarkdownRenderChild.create2__`.
   *
   * @param markdownView - The Markdown view that owns this mode.
   * @returns The new preview view.
   */
  public static create3__(markdownView: MarkdownView): MarkdownPreviewView {
    return new MarkdownPreviewView(markdownView);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `MarkdownPreviewView` as this mock.
   *
   * @param value - The value typed as the original `MarkdownPreviewView`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: MarkdownPreviewViewOriginal): MarkdownPreviewView {
    return strictProxy(value, MarkdownPreviewView);
  }

  /**
   * Scrolls the preview to a position. The mock only remembers it for {@link MarkdownPreviewView.getScroll}.
   *
   * @param scroll - The scroll position.
   */
  public applyScroll(scroll: number): void {
    this.scroll = scroll;
  }

  /**
   * Mock-only: views this mock as Obsidian's `MarkdownPreviewView` type.
   *
   * @returns The same object, typed as the original `MarkdownPreviewView`.
   */
  public asOriginalType4__(): MarkdownPreviewViewOriginal {
    return strictProxy<MarkdownPreviewViewOriginal>(this);
  }

  /**
   * Clears the previewed text.
   */
  public clear(): void {
    this.data = '';
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(MarkdownPreviewView.prototype, 'constructor4__')`.
   *
   * @param _markdownView - The Markdown view the preview view was created with.
   */
  public constructor4__(_markdownView: MarkdownView): void {
    noop();
  }

  /**
   * Gets the previewed Markdown text.
   *
   * @returns The text last passed to {@link MarkdownPreviewView.set}, or an empty string.
   */
  public get(): string {
    return this.data;
  }

  /**
   * Gets the current scroll position.
   *
   * @returns The position last passed to {@link MarkdownPreviewView.applyScroll}, or `0`.
   */
  public getScroll(): number {
    return this.scroll;
  }

  /**
   * Re-renders the preview. A no-op in the mock, which renders nothing.
   *
   * @param _full - Whether to discard every rendered section and render from scratch.
   */
  public rerender(_full?: boolean): void {
    noop();
  }

  /**
   * Replaces the previewed Markdown text.
   *
   * @param data - The new text.
   * @param _clear - Whether to reset view state, as when a different file is loaded; ignored by the mock.
   */
  public set(data: string, _clear: boolean): void {
    this.data = data;
  }
}
