/**
 * @file
 *
 * Mock of Obsidian's `MarkdownView`, the view that edits and previews Markdown files.
 */

import type {
  HoverPopover as HoverPopoverOriginal,
  MarkdownSubView as MarkdownSubViewOriginal,
  MarkdownView as MarkdownViewOriginal
} from 'obsidian';

import { setMarkdownEditorText } from '../internal/markdown-editor-set.ts';
import { MarkdownSubViewImpl } from '../internal/markdown-sub-view-impl.ts';
import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Editor } from './Editor.ts';
import { MarkdownPreviewView } from './MarkdownPreviewView.ts';
import { TextFileView } from './TextFileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

class MockEditor extends Editor {}

/**
 * Mock of Obsidian's `MarkdownView`.
 *
 * The view is always in source mode. Its text is kept both in the inherited `data` and in an in-memory
 * {@link MarkdownView.editor}, which {@link MarkdownView.setViewData} and {@link MarkdownView.clear} keep in step;
 * edits made through the editor alone are not copied back to `data`.
 */
export class MarkdownView extends TextFileView {
  /**
   * The active sub-view (source or preview). In the mock, a standalone sub-view that only stores what it is given.
   */
  public currentMode: MarkdownSubViewOriginal;

  /**
   * The editor for the view's text; an in-memory mock editor.
   */
  public editor: Editor;

  /**
   * The hover popover currently shown for this view, or `null` when there is none.
   */
  public hoverPopover: HoverPopoverOriginal | null = null;

  /**
   * The view's reading mode.
   */
  public previewMode: MarkdownPreviewView;

  // Obsidian's `cmInit` on the edit mode this view drives: false until that mode has been given an editor state of
  // its own, which is what makes the first `setViewData` reset rather than diff, whatever `clear` says.
  private isEditorInitialized = false;

  private readonly mode: 'preview' | 'source' = 'source';

  /**
   * Creates a Markdown view in a leaf.
   *
   * @param leaf - The workspace leaf that hosts the view.
   */
  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.editor = new MockEditor();
    this.currentMode = new MarkdownSubViewImpl();
    this.previewMode = MarkdownPreviewView.create3__(this);

    const self = strictProxy(this);
    self.constructor7__(leaf);
    return self;
  }

  /**
   * Mock-only factory: creates a Markdown view, spyable via `vi.spyOn(MarkdownView, 'create2__')`. The subclass
   * variant of `Component.create__`.
   *
   * @param leaf - The workspace leaf that hosts the view.
   * @returns The new Markdown view.
   */
  public static create2__(leaf: WorkspaceLeaf): MarkdownView {
    return new MarkdownView(leaf);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `MarkdownView` as this mock.
   *
   * @param value - The value typed as the original `MarkdownView`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType7__(value: MarkdownViewOriginal): MarkdownView {
    return strictProxy(value, MarkdownView);
  }

  /**
   * Mock-only: views this mock as Obsidian's `MarkdownView` type.
   *
   * @returns The same object, typed as the original `MarkdownView`.
   */
  public asOriginalType7__(): MarkdownViewOriginal {
    return strictProxy<MarkdownViewOriginal>(this);
  }

  /**
   * Tells whether the view can open files with the given extension.
   *
   * @param extension - The file extension, without the leading dot.
   * @returns Whether `extension` is `md`.
   */
  public override canAcceptExtension(extension: string): boolean {
    return extension === 'md';
  }

  /**
   * Clears the view's text, both the stored data and the editor. The editor gets a fresh state, as in Obsidian: its
   * undo and redo history is dropped and the cursor moves to the start.
   */
  public clear(): void {
    this.data = '';
    this.editor.resetState__('');
    this.isEditorInitialized = true;
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(MarkdownView.prototype, 'constructor7__')`.
   *
   * @param _leaf - The leaf the view was created in.
   */
  public constructor7__(_leaf: WorkspaceLeaf): void {
    noop();
  }

  /**
   * Gets whether the view is in source (editing) or preview (reading) mode.
   *
   * @returns Always `'source'` in the mock.
   */
  public getMode(): 'preview' | 'source' {
    return this.mode;
  }

  /**
   * Gets the view's text, as it would be saved to the file.
   *
   * @returns The inherited `data`, as last stored by {@link MarkdownView.setViewData} or
   * {@link MarkdownView.clear}.
   */
  public getViewData(): string {
    return this.data;
  }

  /**
   * Gets the view type id Obsidian registers Markdown views under.
   *
   * @returns `'markdown'`.
   */
  public override getViewType(): string {
    return 'markdown';
  }

  /**
   * Replaces the view's text, updating both the stored data and the editor.
   *
   * @param data - The new text.
   * @param clear - Whether a different file is being loaded, so editor state is reset: the undo and redo history is
   * dropped and the cursor moves to the start. A view whose editor has never been given a state of its own resets
   * either way, as Obsidian's edit mode does. Otherwise only the lines that differ are changed, as one change that
   * undo can revert and that the selection is mapped through; identical text is no change at all.
   */
  public setViewData(data: string, clear: boolean): void {
    this.data = data;
    if (clear || !this.isEditorInitialized) {
      this.editor.resetState__(data);
      this.isEditorInitialized = true;
    } else {
      setMarkdownEditorText(this.editor, data);
    }
  }

  /**
   * Opens the in-file search bar. A no-op in the mock.
   *
   * @param _replace - Whether to open search-and-replace instead of plain search.
   */
  public showSearch(_replace?: boolean): void {
    noop();
  }
}
