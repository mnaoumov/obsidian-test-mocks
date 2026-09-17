/**
 * @file
 *
 * Mock of Obsidian's `Vault`, which tracks the vault's file tree over a data adapter, usually the in-memory one.
 */

import type {
  DataAdapter as DataAdapterOriginal,
  DataWriteOptions as DataWriteOptionsOriginal,
  Vault as VaultOriginal
} from 'obsidian';

import type { TAbstractFile } from './TAbstractFile.ts';

import { castTo } from '../internal/castTo.ts';
import { InMemoryAdapter } from '../internal/in-memory-adapter.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { Events } from './Events.ts';
import { TFile } from './TFile.ts';
import { TFolder } from './TFolder.ts';

/**
 * The only vault setting the attachment-path resolution reads. Obsidian's own default is `/` (the
 * vault root); `./` means "same folder as the note", `./sub` a sub-folder of it, and anything else a
 * fixed folder. Confirmed against a real Obsidian 1.13.4.
 */
const ATTACHMENT_FOLDER_PATH_CONFIG_KEY = 'attachmentFolderPath';
const DEFAULT_ATTACHMENT_FOLDER_PATH = '/';
const RELATIVE_PATH_PREFIX = './';
const ROOT_PATH = '/';

/**
 * Mock of Obsidian's `Vault`.
 *
 * File operations go through {@link Vault.adapter}; the vault keeps a path-keyed tree of `TFile` / `TFolder`
 * objects in {@link Vault.fileMap} in step with them and fires `create`, `modify`, `delete` and `rename` events.
 * Dot-prefixed paths such as the config folder are never tracked. The `__` helpers add synchronous access and
 * re-syncing, and work only over an {@link InMemoryAdapter}.
 */
export class Vault extends Events {
  /**
   * The data adapter every file operation reads from and writes to.
   */
  public adapter: DataAdapterOriginal;
  /**
   * Backs `getConfig` / `setConfig`. Only `attachmentFolderPath` carries a modeled default —
   * every other key reads as `undefined` until a test sets it.
   */
  public config: Record<string, unknown> = { [ATTACHMENT_FOLDER_PATH_CONFIG_KEY]: DEFAULT_ATTACHMENT_FOLDER_PATH };
  /**
   * The vault-relative path of the config folder, typically `.obsidian`.
   */
  // eslint-disable-next-line unicorn/name-replacements -- `configDir` is Obsidian's own spelling; the mock has to answer to the name callers actually use.
  public configDir = '.obsidian';
  /**
   * Every tracked file and folder, keyed by exact path; the root is keyed as `/`.
   */
  public fileMap: Record<string, TAbstractFile> = {};
  private fileMapLowerCase: Record<string, TAbstractFile> = {};

  /**
   * Creates a vault over an adapter, tracking only the root folder.
   *
   * @param adapter - The data adapter the vault reads from and writes to.
   */
  protected constructor(adapter: DataAdapterOriginal) {
    super();
    this.adapter = adapter;
    const root = TFolder.create__(this, '/');
    this.fileMap['/'] = root;
    this.fileMapLowerCase['/'] = root;
    root.deleted = false;
    const self = strictProxy(this);
    self.constructor2__(adapter);
    return self;
  }

  /**
   * Mock-only factory: creates a vault, spyable via `vi.spyOn(Vault, 'create2__')`. It is numbered because
   * `Events.create__` takes no adapter, so a `create__` here would conflict on the static side.
   *
   * @param adapter - The data adapter the vault reads from and writes to.
   * @returns The new vault.
   */
  public static create2__(adapter: DataAdapterOriginal): Vault {
    return new Vault(adapter);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Vault` as this mock.
   *
   * @param value - The value typed as the original `Vault`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: VaultOriginal): Vault {
    return strictProxy(value, Vault);
  }

  /**
   * Walks a folder's descendants depth-first, calling the callback on each child before descending into it. The
   * folder itself is not visited.
   *
   * @param folder - The folder to walk.
   * @param callback - Called with each descendant file and folder.
   */
  public static recurseChildren(folder: TFolder, callback: (f: TAbstractFile) => unknown): void {
    for (const child of folder.children) {
      callback(child);
      if (child instanceof TFolder) {
        Vault.recurseChildren(child, callback);
      }
    }
  }

  /**
   * Adds text to the end of a plaintext file, then refreshes its `stat` and fires `modify`.
   *
   * @param file - The file to append to.
   * @param data - The text to add.
   * @param options - Write options such as timestamps to set.
   */
  public async append(file: TFile, data: string, options?: DataWriteOptionsOriginal): Promise<void> {
    await this.adapter.append(file.path, data, options);
    this.refreshStat__(file);
    this.trigger('modify', file);
  }

  /**
   * Adds data to the end of a binary file, then refreshes its `stat` and fires `modify`.
   *
   * @param file - The file to append to.
   * @param data - The data to add.
   * @param options - Write options such as timestamps to set.
   */
  public async appendBinary(file: TFile, data: ArrayBuffer, options?: DataWriteOptionsOriginal): Promise<void> {
    await this.adapter.appendBinary(file.path, data, options);
    this.refreshStat__(file);
    this.trigger('modify', file);
  }

  /**
   * Mock-only: views this mock as Obsidian's `Vault` type.
   *
   * @returns The same object, typed as the original `Vault`.
   */
  public asOriginalType2__(): VaultOriginal {
    return strictProxy<VaultOriginal>(this);
  }

  /**
   * Reads a plaintext file for display. Obsidian may serve it from a cache; the mock reads the adapter, exactly as
   * {@link Vault.read} does.
   *
   * @param file - The file to read.
   * @returns The file's text.
   */
  public async cachedRead(file: TFile): Promise<string> {
    return this.adapter.read(file.path);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Vault.prototype, 'constructor2__')`.
   *
   * @param _adapter - The adapter the vault was created with.
   */
  public constructor2__(_adapter: DataAdapterOriginal): void {
    noop();
  }

  /**
   * Copies a file, or a folder together with everything under it, tracks the copies, and fires `create` for each new
   * entry: the copy itself first, then its descendants depth-first. A folder copied onto an existing folder merges
   * into it, as in Obsidian.
   *
   * @typeParam T - The type of the file or folder being copied.
   * @param file - The file or folder to copy.
   * @param newPath - The vault-relative path for the copy.
   * @returns The copy, of the same type as `file`.
   * @throws Error from the adapter when a file would be copied onto an existing path.
   */
  public async copy<T extends TAbstractFile>(file: T, newPath: string): Promise<T> {
    await this.adapter.copy(file.path, newPath);
    if (!(file instanceof TFolder)) {
      return castTo<T>(this.trackCopiedFile(newPath));
    }

    const copy = this.registerFolderTree(newPath);
    Vault.recurseChildren(file, (child) => {
      const childPath = newPath + child.path.slice(file.path.length);
      if (child instanceof TFolder) {
        this.registerFolderTree(childPath);
      } else {
        this.trackCopiedFile(childPath);
      }
    });
    return castTo<T>(copy);
  }

  /**
   * Creates a plaintext file, tracks it, and fires `create`.
   *
   * @param path - The vault-relative path for the new file, with extension.
   * @param data - The file's text.
   * @param options - Write options such as timestamps to set.
   * @returns The new file.
   * @throws Error `File already exists.` when the adapter reports anything at `path`, which on a case-insensitive
   * adapter includes a path differing only in case.
   */
  public async create(path: string, data: string, options?: DataWriteOptionsOriginal): Promise<TFile> {
    await this.ensureNothingExists(path, 'File already exists.');
    await this.adapter.write(path, data, options);
    const file = TFile.create__(this, path);
    this.setVaultAbstractFile__(path, file);
    this.refreshStat__(file);
    this.trigger('create', file);
    return file;
  }

  /**
   * Creates a binary file, tracks it, and fires `create`.
   *
   * @param path - The vault-relative path for the new file, with extension.
   * @param data - The file's content.
   * @param options - Write options such as timestamps to set.
   * @returns The new file.
   * @throws Error `File already exists.` when the adapter reports anything at `path`, which on a case-insensitive
   * adapter includes a path differing only in case.
   */
  public async createBinary(path: string, data: ArrayBuffer, options?: DataWriteOptionsOriginal): Promise<TFile> {
    await this.ensureNothingExists(path, 'File already exists.');
    await this.adapter.writeBinary(path, data, options);
    const file = TFile.create__(this, path);
    this.setVaultAbstractFile__(path, file);
    this.refreshStat__(file);
    this.trigger('create', file);
    return file;
  }

  /**
   * Creates a folder along with any missing ancestors, tracking each new one and firing `create` for it.
   *
   * @param path - The vault-relative path for the new folder.
   * @returns The new folder.
   * @throws Error `Folder already exists.` when the adapter reports anything at `path`, a file included.
   */
  public async createFolder(path: string): Promise<TFolder> {
    await this.ensureNothingExists(path, 'Folder already exists.');
    await this.adapter.mkdir(path);
    return this.registerFolderTree(path);
  }

  /**
   * Mock-only: a synchronous {@link Vault.createFolder} for setting up a test vault. Unlike `createFolder`, it returns
   * the existing folder when `path` is already one.
   *
   * @param path - The vault-relative path for the new folder.
   * @returns The folder at `path`.
   * @throws TypeError when the adapter is not an {@link InMemoryAdapter}.
   */
  public createFolderSync__(path: string): TFolder {
    if (!(this.adapter instanceof InMemoryAdapter)) {
      throw new TypeError('createFolderSync__ is only supported for in-memory adapters');
    }
    this.adapter.mkdirSync__(path);
    return this.registerFolderTree(path);
  }

  /**
   * Mock-only: a synchronous {@link Vault.create} for setting up a test vault; it also fires `create`. Unlike
   * `create`, it overwrites a file that already exists at `path`.
   *
   * @param path - The vault-relative path for the new file, with extension.
   * @param content - The file's text.
   * @returns The new file.
   * @throws TypeError when the adapter is not an {@link InMemoryAdapter}.
   */
  public createSync__(path: string, content: string): TFile {
    if (!(this.adapter instanceof InMemoryAdapter)) {
      throw new TypeError('createSync__ is only supported for in-memory adapters');
    }
    this.adapter.writeSync__(path, content);
    const file = TFile.create__(this, path);
    this.setVaultAbstractFile__(path, file);
    this.refreshStat__(file);
    this.trigger('create', file);
    return file;
  }

  /**
   * Deletes a file or a folder and stops tracking it. For a folder, every descendant is untracked and marked `deleted`
   * too, each firing its own `delete` depth-first before the folder's. As in Obsidian, `force` goes straight to the
   * adapter as `rmdir`'s `recursive`, and deleting the root does nothing.
   *
   * @param file - The file or folder to delete.
   * @param force - Whether to remove a folder recursively. Without it the desktop `FileSystemAdapter` refuses any
   * folder, an empty one included, while the mobile `CapacitorAdapter` removes it anyway.
   * @throws Error from the adapter, in which case nothing is untracked.
   */
  public async delete(file: TAbstractFile, force = false): Promise<void> {
    if (file === this.fileMap['/']) {
      return;
    }

    if (file instanceof TFolder) {
      await this.adapter.rmdir(file.path, force);
    } else {
      await this.adapter.remove(file.path);
    }
    this.removeTree(file);
  }

  /**
   * Mock-only: stops tracking the entry at `path`, marks it `deleted` and detaches it from its parent, setting its
   * `parent` to `null` as Obsidian does before it fires `delete`, without touching the adapter or firing an event.
   * Does nothing when no entry is tracked there. A folder's descendants are left tracked; untrack each of them the
   * same way.
   *
   * @param path - The exact path of the entry.
   */
  public deleteVaultAbstractFile__(path: string): void {
    const file = this.fileMap[path];
    if (!file) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- This is a simple in-memory map for tests.
    delete this.fileMap[path];
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- This is a simple in-memory map for tests.
    delete this.fileMapLowerCase[path.toLowerCase()];
    file.deleted = true;
    if (!file.parent) {
      return;
    }

    const index = file.parent.children.indexOf(file);
    if (index !== -1) {
      file.parent.children.splice(index, 1);
    }
    file.parent = null;
  }

  /**
   * Whether anything exists at `path`.
   *
   * @param path - The path to test.
   * @param isCaseSensitive - Force a case-sensitive check. Obsidian's own default is a
   * case-insensitive lookup, because most vaults sit on a case-insensitive file system.
   * @returns Whether a file or folder exists at that path.
   */
  public async exists(path: string, isCaseSensitive?: boolean): Promise<boolean> {
    await noopAsync();
    return (isCaseSensitive ? this.getAbstractFileByPath(path) : this.getAbstractFileByPathInsensitive(path)) !== null;
  }

  /**
   * Gets the tracked file or folder at a path.
   *
   * @param path - The vault-relative path, with extension; matched case-sensitively.
   * @returns The file or folder, or `null` when none is tracked there.
   */
  public getAbstractFileByPath(path: string): null | TAbstractFile {
    return this.fileMap[path] ?? null;
  }

  /**
   * Gets the tracked file or folder at a path, ignoring case.
   *
   * @param path - The vault-relative path, with extension.
   * @returns The file or folder, or `null` when none is tracked there.
   */
  public getAbstractFileByPathInsensitive(path: string): null | TAbstractFile {
    return this.fileMapLowerCase[path.toLowerCase()] ?? null;
  }

  /**
   * Gets every tracked folder.
   *
   * @param includeRoot - Whether to include the root folder; it is left out by default.
   * @returns The folders.
   */
  public getAllFolders(includeRoot = false): TFolder[] {
    return Object.values(this.fileMap).filter((f): f is TFolder => f instanceof TFolder && (includeRoot || !f.isRoot()));
  }

  /**
   * Gets every tracked file and folder, the root included.
   *
   * @returns The files and folders.
   */
  public getAllLoadedFiles(): TAbstractFile[] {
    return Object.values(this.fileMap);
  }

  /**
   * Obsidian's de-duplicator: the plain name first, then ` 1`, ` 2`, … until one is free.
   *
   * @param basePath - The desired path without extension.
   * @param extension - The file extension without the leading dot.
   * @returns A path that no existing file occupies.
   */
  public getAvailablePath(basePath: string, extension: string): string {
    const suffix = extension ? `.${extension}` : '';
    let candidate = `${basePath}${suffix}`;
    let index = 0;
    while (this.getAbstractFileByPath(candidate)) {
      index++;
      candidate = `${basePath} ${String(index)}${suffix}`;
    }
    return candidate;
  }

  /**
   * Resolves where an attachment of `file` goes, per the `attachmentFolderPath` setting, creating the
   * target folder when it is missing. Confirmed against a real Obsidian 1.13.4: for a note
   * `Docs/api/get.md` the setting `/` yields `img.png`, `./` yields `Docs/api/img.png`, `./assets`
   * yields `Docs/api/assets/img.png` (creating `Docs/api/assets`), and `Files` yields `Files/img.png`
   * (creating `Files`). A `null` file resolves as a root-level note does.
   *
   * @param fileName - The attachment base name without extension.
   * @param extension - The attachment extension without the leading dot.
   * @param file - The note the attachment belongs to, or `null`.
   * @returns A {@link Promise} that resolves to the available attachment path.
   */
  public async getAvailablePathForAttachments(fileName: string, extension: string, file: null | TFile): Promise<string> {
    const rawSetting = this.getConfig(ATTACHMENT_FOLDER_PATH_CONFIG_KEY);
    const setting = typeof rawSetting === 'string' ? rawSetting : '';
    let folderPath: string;
    if (setting === '.' || setting === RELATIVE_PATH_PREFIX) {
      folderPath = file?.parent?.path ?? '';
    } else if (setting.startsWith(RELATIVE_PATH_PREFIX)) {
      folderPath = (file?.parent?.getParentPrefix() ?? '') + setting.slice(RELATIVE_PATH_PREFIX.length);
    } else {
      folderPath = setting;
    }

    folderPath = folderPath.replace(/\/+$/, '');
    if (folderPath === '') {
      folderPath = ROOT_PATH;
    }

    const existing = this.getAbstractFileByPathInsensitive(folderPath);
    const folder = existing instanceof TFolder ? existing : await this.createFolder(folderPath);
    return this.getAvailablePath(folder.getParentPrefix() + fileName, extension);
  }

  /**
   * Reads a vault setting.
   *
   * @param key - The setting key.
   * @returns The setting value, or `undefined` when the key was never set.
   */
  public getConfig(key: string): unknown {
    return this.config[key];
  }

  /**
   * Gets the tracked file at a path.
   *
   * @param path - The vault-relative path, with extension; matched case-sensitively.
   * @returns The file, or `null` when nothing, or a folder, is tracked there.
   */
  public getFileByPath(path: string): null | TFile {
    const f = this.fileMap[path];
    return f instanceof TFile ? f : null;
  }

  /**
   * Gets every tracked file.
   *
   * @returns The files, in tracking order.
   */
  public getFiles(): TFile[] {
    return Object.values(this.fileMap).filter((f): f is TFile => f instanceof TFile);
  }

  /**
   * Gets the tracked folder at a path.
   *
   * @param path - The vault-relative path; matched case-sensitively, with `/` for the root.
   * @returns The folder, or `null` when nothing, or a file, is tracked there.
   */
  public getFolderByPath(path: string): null | TFolder {
    const f = this.fileMap[path];
    return f instanceof TFolder ? f : null;
  }

  /**
   * Gets every tracked Markdown file, meaning every file whose extension is exactly `md`.
   *
   * @returns The Markdown files.
   */
  public getMarkdownFiles(): TFile[] {
    return Object.values(this.fileMap).filter((f): f is TFile => f instanceof TFile && f.extension === 'md');
  }

  /**
   * Gets the vault's name.
   *
   * @returns The name; always an empty string in the mock.
   */
  public getName(): string {
    return '';
  }

  /**
   * Gets a URI the browser engine can load a file from, for example to embed an image.
   *
   * @param _file - The file to get the URI for.
   * @returns The URI; always an empty string in the mock.
   */
  public getResourcePath(_file: TFile): string {
    return '';
  }

  /**
   * Gets the vault's root folder, creating and tracking a fresh one if the root entry is missing.
   *
   * @returns The root folder.
   */
  public getRoot(): TFolder {
    const root = this.fileMap['/'];
    if (root instanceof TFolder) {
      return root;
    }
    const fallback = TFolder.create__(this, '/');
    this.fileMap['/'] = fallback;
    this.fileMapLowerCase['/'] = fallback;
    return fallback;
  }

  /**
   * Replaces a plaintext file's contents, then refreshes its `stat` and fires `modify`.
   *
   * @param file - The file to modify.
   * @param data - The new text.
   * @param options - Write options such as timestamps to set.
   */
  public async modify(file: TFile, data: string, options?: DataWriteOptionsOriginal): Promise<void> {
    await this.adapter.write(file.path, data, options);
    this.refreshStat__(file);
    this.trigger('modify', file);
  }

  /**
   * Replaces a binary file's contents, then refreshes its `stat` and fires `modify`.
   *
   * @param file - The file to modify.
   * @param data - The new content.
   * @param options - Write options such as timestamps to set.
   */
  public async modifyBinary(file: TFile, data: ArrayBuffer, options?: DataWriteOptionsOriginal): Promise<void> {
    await this.adapter.writeBinary(file.path, data, options);
    this.refreshStat__(file);
    this.trigger('modify', file);
  }

  /**
   * Reads a plaintext file, transforms its text with a synchronous function, writes the result back, then refreshes
   * its `stat` and fires `modify`. Obsidian does this atomically; the mock simply runs the steps in order.
   *
   * @param file - The file to process.
   * @param $function - Returns the new text for the current text.
   * @param options - Write options such as timestamps to set.
   * @returns The text that was written.
   */
  public async process(file: TFile, $function: (data: string) => string, options?: DataWriteOptionsOriginal): Promise<string> {
    const content = await this.adapter.read(file.path);
    const result = $function(content);
    await this.adapter.write(file.path, result, options);
    this.refreshStat__(file);
    this.trigger('modify', file);
    return result;
  }

  /**
   * Reads a plaintext file from the adapter.
   *
   * @param file - The file to read.
   * @returns The file's text.
   */
  public async read(file: TFile): Promise<string> {
    return this.adapter.read(file.path);
  }

  /**
   * Reads a binary file from the adapter.
   *
   * @param file - The file to read.
   * @returns The file's content.
   */
  public async readBinary(file: TFile): Promise<ArrayBuffer> {
    return this.adapter.readBinary(file.path);
  }

  /**
   * Mock-only: a synchronous {@link Vault.read}.
   *
   * @param file - The file to read.
   * @returns The file's text.
   * @throws TypeError when the adapter is not an {@link InMemoryAdapter}.
   */
  public readSync__(file: TFile): string {
    if (!(this.adapter instanceof InMemoryAdapter)) {
      throw new TypeError('readSync__ is only supported for in-memory adapters');
    }
    return this.adapter.readSync__(file.path);
  }

  /**
   * Mock-only: re-syncs the tracked tree with the adapter's contents after a test wrote to the adapter directly.
   * Missing folders and files are tracked (firing `create` for each new file), `stat` is refreshed for files already
   * tracked, and entries the adapter no longer has are dropped (firing `delete`). Dot-prefixed paths are skipped.
   *
   * @throws TypeError when the adapter is not an {@link InMemoryAdapter}.
   */
  public reconcile__(): void {
    if (!(this.adapter instanceof InMemoryAdapter)) {
      throw new TypeError('reconcile__ is only supported for in-memory adapters');
    }
    const { files, folders } = this.adapter.listAll__();
    const keep = new Set<string>(['/']);

    // Register folders shallowest-first so ancestors exist before their children.
    const sortedFolders = folders
      .filter((path) => !isDotPath(path))
      .sort((a, b) => a.split('/').length - b.split('/').length);
    for (const folderPath of sortedFolders) {
      keep.add(folderPath);
      if (!(this.fileMap[folderPath] instanceof TFolder)) {
        this.registerFolderTree(folderPath);
      }
    }

    for (const filePath of files) {
      if (isDotPath(filePath)) {
        continue;
      }
      keep.add(filePath);
      const tracked = this.fileMap[filePath];
      if (tracked instanceof TFile) {
        // Already tracked, but the adapter may have been written to behind the vault's back.
        this.refreshStat__(tracked);
        continue;
      }

      const file = TFile.create__(this, filePath);
      this.setVaultAbstractFile__(filePath, file);
      this.refreshStat__(file);
      this.trigger('create', file);
    }

    // Remove tree entries the adapter no longer has.
    for (const [path, existing] of Object.entries(this.fileMap)) {
      if (keep.has(path) || isDotPath(path)) {
        continue;
      }
      this.deleteVaultAbstractFile__(path);
      this.trigger('delete', existing);
    }
  }

  /**
   * Copies the adapter's recorded `ctime` / `mtime` / `size` onto `file.stat`, mutating the existing
   * object in place so a reference a test captured stays valid. Real Obsidian has stat'ed the file by
   * the time it fires `create` / `modify`, so every write path calls this BEFORE triggering its event.
   *
   * Only the in-memory adapter records stat, so this is a silent no-op for any other adapter —
   * deliberately not the `TypeError` that `createSync__` / `readSync__` / `reconcile__` throw: unlike
   * those explicit helpers it runs as a side effect of an ordinary `create()` / `modify()`, so it must
   * not break a caller that supplied a partial adapter.
   *
   * @param file - The file whose `stat` to refresh.
   */
  public refreshStat__(file: TFile): void {
    if (!(this.adapter instanceof InMemoryAdapter)) {
      return;
    }

    const stat = this.adapter.statSync__(file.path);
    if (!stat) {
      return;
    }

    file.stat.ctime = stat.ctime;
    file.stat.mtime = stat.mtime;
    file.stat.size = stat.size;
  }

  /**
   * Renames or moves a file or folder. The mock updates the object in place (path, name, and for a file its
   * basename and extension), re-parents it, cascades the new path prefix to a folder's descendants, and fires
   * `rename` with the old path. Unlike `FileManager.renameFile`, it does not update links. Renaming onto the current
   * path does nothing and fires no event.
   *
   * @param file - The file or folder to rename.
   * @param newPath - The new vault-relative path.
   * @throws Error from the adapter when something already exists at `newPath`.
   */
  public async rename(file: TAbstractFile, newPath: string): Promise<void> {
    const oldPath = file.path;
    if (oldPath === newPath) {
      return;
    }
    await this.adapter.rename(oldPath, newPath);

    // Capture descendants before mutating: a folder rename must cascade their paths.
    const descendants: TAbstractFile[] = [];
    if (file instanceof TFolder) {
      Vault.recurseChildren(file, (child) => {
        descendants.push(child);
      });
    }

    // Remove old entry from maps and parent's children
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- This is a simple in-memory map for tests.
    delete this.fileMap[oldPath];
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- This is a simple in-memory map for tests.
    delete this.fileMapLowerCase[oldPath.toLowerCase()];
    if (file.parent) {
      const index = file.parent.children.indexOf(file);
      if (index !== -1) {
        file.parent.children.splice(index, 1);
      }
    }

    // Update the file's properties in place
    file.path = newPath;
    const parts = newPath.split('/');
    file.name = ensureNonNullable(parts.at(-1));
    if (file instanceof TFile) {
      const dotIndex = file.name.lastIndexOf('.');
      file.extension = dotIndex === -1 ? '' : file.name.slice(dotIndex + 1);
      file.basename = dotIndex === -1 ? file.name : file.name.slice(0, dotIndex);
    }

    // Re-register with new path and attach to new parent
    this.setVaultAbstractFile__(newPath, file);
    if (file instanceof TFile) {
      this.refreshStat__(file);
    }

    // Cascade descendant paths: their tree links are unchanged, only the path prefix moves.
    for (const descendant of descendants) {
      const oldDescendantPath = descendant.path;
      const newDescendantPath = newPath + oldDescendantPath.slice(oldPath.length);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- This is a simple in-memory map for tests.
      delete this.fileMap[oldDescendantPath];
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- This is a simple in-memory map for tests.
      delete this.fileMapLowerCase[oldDescendantPath.toLowerCase()];
      descendant.path = newDescendantPath;
      this.fileMap[newDescendantPath] = descendant;
      this.fileMapLowerCase[newDescendantPath.toLowerCase()] = descendant;
      if (descendant instanceof TFile) {
        this.refreshStat__(descendant);
      }
    }

    this.trigger('rename', file, oldPath);
  }

  /**
   * Writes a vault setting.
   *
   * @param key - The setting key.
   * @param value - The setting value.
   */
  public setConfig(key: string, value: unknown): void {
    this.config[key] = value;
  }

  /**
   * Mock-only: tracks an entry at `path`, clears its `deleted` flag, and attaches it to the parent folder when that
   * folder is tracked, without touching the adapter or firing an event.
   *
   * @param path - The exact path to track the entry under.
   * @param file - The file or folder to track.
   */
  public setVaultAbstractFile__(path: string, file: TAbstractFile): void {
    this.fileMap[path] = file;
    this.fileMapLowerCase[path.toLowerCase()] = file;
    file.deleted = false;
    const lastSlash = path.lastIndexOf('/');
    const parentKey = lastSlash > 0 ? path.slice(0, lastSlash) : '/';
    const parentFile = this.fileMap[parentKey];
    if (!(parentFile instanceof TFolder)) {
      return;
    }

    file.parent = parentFile;
    if (!parentFile.children.includes(file)) {
      parentFile.children.push(file);
    }
  }

  /**
   * Moves a file or folder to the system or the local trash. The mock deletes it from the adapter outright and stops
   * tracking it and, for a folder, its descendants, firing `delete` for each, as {@link Vault.delete} does. As in
   * Obsidian, trashing the root does nothing.
   *
   * @param file - The file or folder to trash.
   * @param _system - Whether to try the system trash first; ignored by the mock.
   */
  public async trash(file: TAbstractFile, _system: boolean): Promise<void> {
    if (file === this.fileMap['/']) {
      return;
    }

    if (file instanceof TFolder) {
      await this.adapter.rmdir(file.path, true);
    } else {
      await this.adapter.remove(file.path);
    }
    this.removeTree(file);
  }

  private async ensureNothingExists(path: string, message: string): Promise<void> {
    if (await this.adapter.exists(path)) {
      throw new Error(message);
    }
  }

  private registerFolderTree(path: string): TFolder {
    const segments = path.split('/');
    let cumulative = '';
    let folder = this.getRoot();
    for (const segment of segments) {
      cumulative = cumulative === '' ? segment : `${cumulative}/${segment}`;
      const existing = this.fileMap[cumulative];
      if (existing instanceof TFolder) {
        folder = existing;
        continue;
      }
      folder = TFolder.create__(this, cumulative);
      this.setVaultAbstractFile__(cumulative, folder);
      this.trigger('create', folder);
    }
    return folder;
  }

  private removeTree(file: TAbstractFile): void {
    // Obsidian drops the descendants before the folder itself, each with its own `delete` event.
    const entries: TAbstractFile[] = [];
    if (file instanceof TFolder) {
      Vault.recurseChildren(file, (child) => {
        entries.push(child);
      });
    }
    entries.push(file);
    for (const entry of entries) {
      this.deleteVaultAbstractFile__(entry.path);
      this.trigger('delete', entry);
    }
  }

  private trackCopiedFile(path: string): TFile {
    const file = TFile.create__(this, path);
    this.setVaultAbstractFile__(path, file);
    this.refreshStat__(file);
    this.trigger('create', file);
    return file;
  }
}

/**
 * Dot-prefixed paths (e.g. the `.obsidian` config dir) are not tracked in the
 * vault tree, mirroring how real Obsidian excludes dotfiles/dotfolders.
 *
 * @param path - The vault-relative path to check.
 * @returns Whether any segment of the path starts with a dot.
 */
function isDotPath(path: string): boolean {
  return path.split('/').some((segment) => segment.startsWith('.'));
}
