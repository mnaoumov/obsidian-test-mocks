/**
 * @file
 *
 * Mock of Obsidian's `FileView`, the base class of views that display a single file.
 */

import type {
  FileView as FileViewOriginal,
  ViewStateResult as ViewStateResultOriginal
} from 'obsidian';

import type { ViewStateResultInternal } from '../internal/types.ts';
import type { WorkspaceLeaf } from './WorkspaceLeaf.ts';

import { castTo } from '../internal/castTo.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ItemView } from './ItemView.ts';
import { TFile } from './TFile.ts';

/**
 * The text Obsidian's file views show when no file is loaded, `noFile` in the shipped `i18n.js`.
 */
const NO_FILE_LABEL = 'No file';

/**
 * A view state that carries a `file` entry, which {@link FileView.setState} resolves into the file to load.
 */
interface StateWithFileEntry {
  file?: unknown;
}

/**
 * Mock of Obsidian's `FileView`.
 *
 * {@link FileView.setState} resolves the `file` path in the state and loads it through
 * {@link FileView.loadFile}, exactly as Obsidian does, so `WorkspaceLeaf.openFile` really leaves the view holding
 * the file. The rename hook does nothing.
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
   * @returns The loaded file's basename, or Obsidian's own `No file` when none is loaded.
   */
  public getDisplayText(): string {
    return this.file?.basename ?? NO_FILE_LABEL;
  }

  /**
   * Gets the view's serializable state, which carries the loaded file's path as Obsidian's does.
   *
   * @returns A shallow copy of the inherited view state, with `file` added when a file is loaded.
   */
  public override getState(): Record<string, unknown> {
    return {
      ...super.getState(),
      ...this.file && { file: this.file.path }
    };
  }

  /**
   * Loads a file into the view, as Obsidian does: the outgoing file is unloaded through
   * {@link FileView.onUnloadFile}, the new one is stored and passed to {@link FileView.onLoadFile}, and a hook that
   * throws leaves the view with no file rather than a half-loaded one. Loading the file the view already holds does
   * nothing.
   *
   * The user-facing notice Obsidian shows for a file that failed to load is not modeled; the error is logged, as it
   * is there.
   *
   * @param file - The file to load, or `null` to unload the current one.
   * @returns Whether the loaded file changed.
   */
  public async loadFile(file: null | TFile): Promise<boolean> {
    const previous = this.file;
    if (previous === file) {
      return false;
    }

    if (previous) {
      await this.onUnloadFile(previous);
    }

    this.file = null;
    if (file) {
      try {
        this.file = file;
        await this.onLoadFile(file);
      } catch (error) {
        this.file = null;
        console.error(error);
      }
    }

    if (this.app.workspace.activeLeaf === this.leaf) {
      this.app.workspace.requestActiveLeafEvents();
    }
    return true;
  }

  /**
   * Called when the view is loaded. A no-op in the mock.
   */
  public override onload(): void {
    noop();
  }

  /**
   * Called when a file is loaded into the view, after {@link FileView.loadFile} has stored it in
   * {@link FileView.file}. An empty hook for subclasses, as in Obsidian.
   *
   * @param _file - The file being loaded.
   */
  public async onLoadFile(_file: TFile): Promise<void> {
    await noopAsync();
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
   * Called when a file is unloaded from the view, before {@link FileView.loadFile} clears
   * {@link FileView.file}. An empty hook for subclasses, as in Obsidian.
   *
   * @param _file - The file being unloaded.
   */
  public async onUnloadFile(_file: TFile): Promise<void> {
    await noopAsync();
  }

  /**
   * Restores the view from a serialized state, loading the file its `file` path names, as Obsidian does. A state
   * naming a path that is not a file unloads the current one; a view left with no file asks the leaf to close it,
   * unless {@link FileView.allowNoFile} is set.
   *
   * Obsidian also schedules the linked-pane sync on the result's `done` callback; `syncState` is not modeled, so the
   * mock does not.
   *
   * @param state - The state to restore.
   * @param result - The result object the view can update, such as to record history.
   */
  public override async setState(state: unknown, result: ViewStateResultOriginal): Promise<void> {
    const internalResult = castTo<ViewStateResultInternal>(result);
    let hasFileChanged = false;

    if (hasFileEntry(state)) {
      const file = typeof state.file === 'string' ? this.app.vault.getAbstractFileByPath(state.file) : null;
      hasFileChanged = await this.loadFile(file instanceof TFile ? file : null);
    }

    if (!this.file && !this.allowNoFile) {
      internalResult.close = true;
    }

    if (hasFileChanged) {
      internalResult.history = true;
      internalResult.layout = true;
    }

    await super.setState(state, result);
  }
}

function hasFileEntry(state: unknown): state is StateWithFileEntry {
  return typeof state === 'object' && state !== null && Object.hasOwn(state, 'file');
}
