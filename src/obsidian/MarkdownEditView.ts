/**
 * @file
 *
 * Mock of Obsidian's `MarkdownEditView`, the source/live-preview editing mode of a Markdown view.
 */

import type {
  HoverPopover as HoverPopoverOriginal,
  MarkdownEditView as MarkdownEditViewOriginal
} from 'obsidian';

import type { MarkdownView } from './MarkdownView.ts';
import type { TFile } from './TFile.ts';

import { setMarkdownEditorText } from '../internal/markdown-editor-set.ts';
import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { Editor } from './Editor.ts';

class MockEditor extends Editor {}

/**
 * Mock of Obsidian's `MarkdownEditView`.
 *
 * The text lives in the view's editor, {@link MarkdownEditView.editor}; the scroll position is only remembered.
 * A `MarkdownView` registers one of these as its source mode, so its `editor`, `getViewData()` and `data` all
 * read this one buffer.
 */
export class MarkdownEditView {
  /**
   * The app the edit view belongs to, taken from its Markdown view.
   */
  public app: App;

  /**
   * The in-memory editor holding the edit view's text; the editor its Markdown view exposes as `editor`.
   */
  public editor: Editor;

  /**
   * The hover popover currently shown for this view, or `null` when there is none.
   */
  public hoverPopover: HoverPopoverOriginal | null = null;

  /**
   * The mode this view is, as `MarkdownView.registerMode` keys it and `MarkdownView.getMode()` reports it.
   */
  public readonly type = 'source';

  /**
   * The file open in the owning Markdown view.
   *
   * @returns The Markdown view's file; the mock throws when that view has no file.
   */
  public get file(): TFile {
    return ensureNonNullable(this.view.file);
  }

  // Obsidian's `cmInit`: false until the edit view has been given an editor state of its own, which is what makes
  // its first `set` reset rather than diff, whatever `clear` says.
  private isEditorInitialized = false;

  private scroll = 0;

  private readonly view: MarkdownView;

  /**
   * Creates the edit mode of a Markdown view.
   *
   * @param view - The Markdown view that owns this mode.
   */
  public constructor(view: MarkdownView) {
    this.app = view.app;
    this.editor = new MockEditor();
    this.view = view;
    const self = strictProxy(this);
    self.constructor__(view);
    return self;
  }

  /**
   * Mock-only factory: creates an edit view, spyable via `vi.spyOn(MarkdownEditView, 'create__')`.
   *
   * @param view - The Markdown view that owns this mode.
   * @returns The new edit view.
   */
  public static create__(view: MarkdownView): MarkdownEditView {
    return new MarkdownEditView(view);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `MarkdownEditView` as this mock.
   *
   * @param value - The value typed as the original `MarkdownEditView`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: MarkdownEditViewOriginal): MarkdownEditView {
    return strictProxy(value, MarkdownEditView);
  }

  /**
   * Scrolls the view to a position. The mock only remembers it for {@link MarkdownEditView.getScroll}.
   *
   * @param scroll - The scroll position.
   */
  public applyScroll(scroll: number): void {
    this.scroll = scroll;
  }

  /**
   * Mock-only: views this mock as Obsidian's `MarkdownEditView` type.
   *
   * @returns The same object, typed as the original `MarkdownEditView`.
   */
  public asOriginalType__(): MarkdownEditViewOriginal {
    return strictProxy<MarkdownEditViewOriginal>(this);
  }

  /**
   * Clears the editor's text into a fresh editor state, as Obsidian does: the undo and redo history is dropped and
   * the cursor moves to the start.
   */
  public clear(): void {
    this.editor.resetState__('');
    this.isEditorInitialized = true;
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(MarkdownEditView.prototype, 'constructor__')`.
   *
   * @param _view - The Markdown view the edit view was created with.
   */
  public constructor__(_view: MarkdownView): void {
    noop();
  }

  /**
   * Gets the editor's text.
   *
   * @returns The current text.
   */
  public get(): string {
    return this.editor.getValue();
  }

  /**
   * Gets the current scroll position.
   *
   * @returns The position last passed to {@link MarkdownEditView.applyScroll}, or `0`.
   */
  public getScroll(): number {
    return this.scroll;
  }

  /**
   * Gets the text currently selected in the editor.
   *
   * @returns The selected text.
   */
  public getSelection(): string {
    return this.editor.getSelection();
  }

  /**
   * Replaces the editor's text.
   *
   * @param data - The new text.
   * @param clear - Whether to reset editor state, as when a different file is loaded: the undo and redo history is
   * dropped and the cursor moves to the start. An edit view that has never been given a state of its own resets
   * either way, as Obsidian's does. Otherwise only the lines that differ are changed, as one change that undo can
   * revert and that the selection is mapped through; identical text is no change at all.
   */
  public set(data: string, clear: boolean): void {
    if (clear || !this.isEditorInitialized) {
      this.editor.resetState__(data);
      this.isEditorInitialized = true;
    } else {
      setMarkdownEditorText(this.editor, data);
    }
  }
}
