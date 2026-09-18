/**
 * @file
 *
 * Mock of Obsidian's `FileView`, the base class of views that display a single file.
 */

import type {
  FileView as FileViewOriginal,
  ViewStateResult as ViewStateResultOriginal
} from 'obsidian';

import type { TFile } from './TFile.ts';

import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ItemView } from './ItemView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

/**
 * Mock of Obsidian's `FileView`.
 *
 * Loading a file only records it in {@link FileView.file}; the rename and unload hooks do nothing.
 */
export abstract class FileView extends ItemView {
  /**
   * Whether the view may stay open with no file loaded.
   */
  public allowNoFile = false;

  /**
   * The file the view currently displays, or `null` when none is loaded.
   */
  public file: null | TFile = null;

  /**
   * Whether the view takes part in navigation history. As in Obsidian, a file view opts back into the history the
   * base view opts out of.
   */
  public override navigation = true;

  /**
   * Creates a file view in a leaf.
   *
   * @param leaf - The workspace leaf that hosts the view.
   */
  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const self = strictProxy(this);
    self.constructor4__(leaf);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `FileView` as this mock.
   *
   * @param value - The value typed as the original `FileView`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: FileViewOriginal): FileView {
    return strictProxy(value, FileView);
  }

  /**
   * Mock-only: views this mock as Obsidian's `FileView` type.
   *
   * @returns The same object, typed as the original `FileView`.
   */
  public asOriginalType4__(): FileViewOriginal {
    return strictProxy<FileViewOriginal>(this);
  }

  /**
   * Tells whether the view can open files with the given extension.
   *
   * @param _extension - The file extension, without the leading dot.
   * @returns `false` in the base mock; subclasses override it.
   */
  public canAcceptExtension(_extension: string): boolean {
    return false;
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(FileView.prototype, 'constructor4__')`.
   *
   * @param _leaf - The leaf the view was created in.
   */
  public constructor4__(_leaf: WorkspaceLeaf): void {
    noop();
  }

  /**
   * Gets the text shown in the view's tab header.
   *
   * @returns The loaded file's basename, or an empty string when no file is loaded.
   */
  public getDisplayText(): string {
    return this.file?.basename ?? '';
  }

  /**
   * Gets the view's serializable state.
   *
   * @returns A shallow copy of the inherited view state.
   */
  public override getState(): Record<string, unknown> {
    return { ...super.getState() };
  }

  /**
   * Called when the view is loaded. A no-op in the mock.
   */
  public override onload(): void {
    noop();
  }

  /**
   * Called when a file is loaded into the view.
   *
   * @param file - The file being loaded; the mock stores it in {@link FileView.file}.
   */
  public async onLoadFile(file: TFile): Promise<void> {
    await noopAsync();
    this.file = file;
  }

  /**
   * Called when the displayed file is renamed. A no-op in the mock.
   *
   * @param _file - The renamed file.
   */
  public async onRename(_file: TFile): Promise<void> {
    await noopAsync();
  }

  /**
   * Called when a file is unloaded from the view. A no-op in the mock, which leaves {@link FileView.file} as it
   * was.
   *
   * @param _file - The file being unloaded.
   */
  public async onUnloadFile(_file: TFile): Promise<void> {
    await noopAsync();
  }

  /**
   * Restores the view from a serialized state.
   *
   * @param state - The state to restore.
   * @param result - The result object the view can update, such as to record history.
   */
  public override async setState(state: unknown, result: ViewStateResultOriginal): Promise<void> {
    await super.setState(state, result);
  }
}
