/**
 * @file
 *
 * In-memory implementation of Obsidian's `MarkdownSubView` interface, used as the `MarkdownView` mock's current
 * mode.
 */

import type { MarkdownSubView as MarkdownSubViewOriginal } from 'obsidian';

/**
 * A `MarkdownSubView` that keeps its content and scroll position in memory, with no editor or preview behind it.
 */
export class MarkdownSubViewImpl implements MarkdownSubViewOriginal {
  private data = '';
  private scroll = 0;

  /**
   * Scrolls to a position. The mock only records it for {@link MarkdownSubViewImpl.getScroll}.
   *
   * @param scroll - The scroll position.
   */
  public applyScroll(scroll: number): void {
    this.scroll = scroll;
  }

  /**
   * Gets the view's content.
   *
   * @returns The text last passed to {@link MarkdownSubViewImpl.set}, or an empty string.
   */
  public get(): string {
    return this.data;
  }

  /**
   * Gets the scroll position.
   *
   * @returns The position last passed to {@link MarkdownSubViewImpl.applyScroll}, or `0`.
   */
  public getScroll(): number {
    return this.scroll;
  }

  /**
   * Replaces the view's content.
   *
   * @param data - The new content.
   * @param _clear - Set when a completely different file is being loaded, so the view should reset rather than
   * update in place. Ignored by the mock.
   */
  // eslint-disable-next-line unicorn/consistent-boolean-name -- `clear` is Obsidian's own parameter name on the signature being mocked, so a boolean prefix would make the mock stop matching it.
  public set(data: string, _clear: boolean): void {
    this.data = data;
  }
}
