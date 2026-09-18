/**
 * @file
 *
 * Mock of Obsidian's `MarkdownView`, the view that edits and previews Markdown files.
 */

import type {
  HoverPopover as HoverPopoverOriginal,
  MarkdownView as MarkdownViewOriginal
} from 'obsidian';

import type {
  MarkdownViewMode,
  MarkdownViewModes
} from '../internal/markdown-view-modes.ts';
import type { Editor } from './Editor.ts';
import type { WorkspaceLeaf } from './WorkspaceLeaf.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { MarkdownEditView } from './MarkdownEditView.ts';
import { MarkdownPreviewView } from './MarkdownPreviewView.ts';
import { TextFileView } from './TextFileView.ts';

/**
 * Mock of Obsidian's `MarkdownView`.
 *
 * The view is always in source mode, and owns no text of its own: as in Obsidian, its modes do. `currentMode` IS
 * {@link MarkdownView.editMode}, which holds the editor, so {@link MarkdownView.editor},
 * {@link MarkdownView.getViewData} and the inherited `data` are three views onto that one buffer — an edit made
 * through any of them is visible through the others.
 */
export class MarkdownView extends TextFileView {
  /**
   * The active sub-view. Always {@link MarkdownView.editMode} in the mock, which is never in reading mode.
   */
  public currentMode: MarkdownViewMode;

  /**
   * The view's editing mode, which owns the editor and the text.
   */
  public editMode: MarkdownEditView;

  /**
   * The hover popover currently shown for this view, or `null` when there is none.
   */
  public hoverPopover: HoverPopoverOriginal | null = null;

  /**
   * The modes registered on the view, keyed by each mode's `type`.
   */
  public modes: MarkdownViewModes;

  /**
   * The view's reading mode.
   */
  public previewMode: MarkdownPreviewView;

  /**
   * The file's contents, read through the current mode rather than stored beside it.
   *
   * Obsidian keeps `data` as a plain field and refreshes it from `currentMode.get()` on every CodeMirror update,
   * through `onInternalDataChange`. The mock has no such update listener, so a stored copy would go stale the
   * moment a test typed into the editor; reading through the mode is what reproduces the invariant that listener
   * maintains.
   *
   * @returns The current mode's text.
   */
  public override get data(): string {
    return this.currentMode.get();
  }

  /**
   * Replaces the file's contents through the current mode, the way `TextFileView.setData` does in Obsidian.
   *
   * @param value - The new text.
   */
  public override set data(value: string) {
    this.currentMode.set(value, false);
  }

  /**
   * The editor for the view's text.
   *
   * @returns The editing mode's editor, as in Obsidian, where `MarkdownView.editor` is a getter over
   * `editMode.editor`.
   */
  public get editor(): Editor {
    return this.editMode.editor;
  }

  // Every registered mode, as Obsidian's `for (const key in this.modes)` walks them. `Object.values` cannot type
  // an interface with no index signature, and the mock registers exactly these two.
  private get registeredModes(): MarkdownViewMode[] {
    return [this.modes.preview, this.modes.source];
  }

  /**
   * Creates a Markdown view in a leaf.
   *
   * @param leaf - The workspace leaf that hosts the view.
   */
  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.modes = {
      preview: MarkdownPreviewView.create3__(this),
      source: MarkdownEditView.create__(this)
    };
    this.editMode = this.modes.source;
    this.previewMode = this.modes.preview;
    this.currentMode = this.modes.source;

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
   * Clears every registered mode, as Obsidian does. The editor gets a fresh state: its undo and redo history is
   * dropped and the cursor moves to the start.
   */
  public clear(): void {
    for (const mode of this.registeredModes) {
      mode.clear();
    }
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
   * @returns The current mode's `type`, which is always `'source'` in the mock.
   */
  public getMode(): 'preview' | 'source' {
    return this.currentMode.type;
  }

  /**
   * Gets the view's text, as it would be saved to the file.
   *
   * @returns The current mode's text, as in Obsidian, where `getViewData` is `currentMode.get()`.
   */
  public getViewData(): string {
    return this.currentMode.get();
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
   * Replaces the view's text through its modes, as Obsidian does: a clearing set reaches EVERY registered mode,
   * and a non-clearing one only the current mode.
   *
   * @param data - The new text.
   * @param clear - Whether a different file is being loaded, so editor state is reset: the undo and redo history is
   * dropped and the cursor moves to the start. A mode that has never been given a state of its own resets either
   * way. Otherwise only the lines that differ are changed, as one change that undo can revert and that the
   * selection is mapped through; identical text is no change at all.
   */
  public setViewData(data: string, clear: boolean): void {
    if (clear) {
      for (const mode of this.registeredModes) {
        mode.set(data, true);
      }
      return;
    }

    this.currentMode.set(data, false);
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
