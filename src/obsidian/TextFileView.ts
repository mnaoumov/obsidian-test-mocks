/**
 * @file
 *
 * Mock of Obsidian's `TextFileView`, a file view that edits a file's contents as text.
 */

import type { TextFileView as TextFileViewOriginal } from 'obsidian';

import type { TFile } from './TFile.ts';

import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { EditableFileView } from './EditableFileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

/**
 * Mock of Obsidian's `TextFileView` base class.
 *
 * Loading, unloading and saving do not touch the vault: they are no-ops, so a test drives
 * {@link TextFileView.setViewData} and {@link TextFileView.getViewData} directly.
 */
export abstract class TextFileView extends EditableFileView {
  /**
   * The file's contents held in memory; empty until a subclass sets it.
   */
  public data = '';

  /**
   * Creates the view in a leaf.
   *
   * @param leaf - The workspace leaf that hosts the view.
   */
  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const self = strictProxy(this);
    self.constructor6__(leaf);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `TextFileView` as this mock.
   *
   * @param value - The value typed as the original `TextFileView`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType6__(value: TextFileViewOriginal): TextFileView {
    return strictProxy(value, TextFileView);
  }

  /**
   * Mock-only: views this mock as Obsidian's `TextFileView` type.
   *
   * @returns The same object, typed as the original `TextFileView`.
   */
  public asOriginalType6__(): TextFileViewOriginal {
    return strictProxy<TextFileViewOriginal>(this);
  }

  /**
   * Clears the editor, including undo history and any caches tied to the previous file's contents; called before a
   * different file is opened.
   */
  public abstract clear(): void;

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(TextFileView.prototype, 'constructor6__')`.
   *
   * @param _leaf - The leaf the view was created in.
   */
  public constructor6__(_leaf: WorkspaceLeaf): void {
    noop();
  }

  /**
   * Gets the editor's contents; called to save them to the file.
   *
   * @returns The text to write to the file.
   */
  public abstract getViewData(): string;

  /**
   * Called when a file is loaded into the view; Obsidian reads it and calls `setViewData`. A no-op in the mock.
   *
   * @param _file - The file being loaded.
   */
  public override async onLoadFile(_file: TFile): Promise<void> {
    await noopAsync();
  }

  /**
   * Called when a file is unloaded from the view; Obsidian saves pending changes first. A no-op in the mock.
   *
   * @param _file - The file being unloaded.
   */
  public override async onUnloadFile(_file: TFile): Promise<void> {
    await noopAsync();
  }

  /**
   * Requests a debounced save, two seconds from now. A no-op in the mock.
   */
  public requestSave(): void {
    noop();
  }

  /**
   * Saves the view's data to its file. A no-op in the mock.
   *
   * @param _clear - Whether to clear the view after saving.
   */
  public async save(_clear?: boolean): Promise<void> {
    await noopAsync();
  }

  /**
   * Loads contents into the editor.
   *
   * @param data - The file contents.
   * @param clear - Whether a completely different file is being opened, so the editor state should be cleared.
   */
  public abstract setViewData(data: string, clear: boolean): void;
}
