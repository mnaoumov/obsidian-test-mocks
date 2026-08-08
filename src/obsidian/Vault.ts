import type {
  DataAdapter as DataAdapterOriginal,
  DataWriteOptions as DataWriteOptionsOriginal,
  Vault as VaultOriginal
} from 'obsidian';

import type { TAbstractFile } from './TAbstractFile.ts';

import { InMemoryAdapter } from '../internal/in-memory-adapter.ts';
import { noop } from '../internal/noop.ts';
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

export class Vault extends Events {
  public adapter: DataAdapterOriginal;
  /**
   * Backs `getConfig__` / `setConfig__`. Only `attachmentFolderPath` carries a modeled default —
   * every other key reads as `undefined` until a test sets it.
   */
  public config__: Record<string, unknown> = { [ATTACHMENT_FOLDER_PATH_CONFIG_KEY]: DEFAULT_ATTACHMENT_FOLDER_PATH };
  // eslint-disable-next-line unicorn/name-replacements -- `configDir` is Obsidian's own spelling; the mock has to answer to the name callers actually use.
  public configDir = '.obsidian';
  public fileMap__: Record<string, TAbstractFile> = {};
  private fileMapLowerCase: Record<string, TAbstractFile> = {};

  protected constructor(adapter: DataAdapterOriginal) {
    super();
    this.adapter = adapter;
    const root = TFolder.create__(this, '/');
    this.fileMap__['/'] = root;
    this.fileMapLowerCase['/'] = root;
    root.deleted__ = false;
    const self = strictProxy(this);
    self.constructor2__(adapter);
    return self;
  }

  public static create2__(adapter: DataAdapterOriginal): Vault {
    return new Vault(adapter);
  }

  public static fromOriginalType2__(value: VaultOriginal): Vault {
    return strictProxy(value, Vault);
  }

  public static recurseChildren(folder: TFolder, callback: (f: TAbstractFile) => unknown): void {
    for (const child of folder.children) {
      callback(child);
      if (child instanceof TFolder) {
        Vault.recurseChildren(child, callback);
      }
    }
  }

  public async append(file: TFile, data: string, options?: DataWriteOptionsOriginal): Promise<void> {
    await this.adapter.append(file.path, data, options);
    this.trigger('modify', file);
  }

  public async appendBinary(file: TFile, data: ArrayBuffer, options?: DataWriteOptionsOriginal): Promise<void> {
    await this.adapter.appendBinary(file.path, data, options);
    this.trigger('modify', file);
  }

  public asOriginalType2__(): VaultOriginal {
    return strictProxy<VaultOriginal>(this);
  }

  public async cachedRead(file: TFile): Promise<string> {
    return this.adapter.read(file.path);
  }

  public constructor2__(_adapter: DataAdapterOriginal): void {
    noop();
  }

  public async copy(file: TFile, newPath: string): Promise<TFile> {
    await this.adapter.copy(file.path, newPath);
    const newFile = TFile.create__(this, newPath);
    this.setVaultAbstractFile__(newPath, newFile);
    this.trigger('create', newFile);
    return newFile;
  }

  public async create(path: string, data: string, options?: DataWriteOptionsOriginal): Promise<TFile> {
    await this.adapter.write(path, data, options);
    const file = TFile.create__(this, path);
    this.setVaultAbstractFile__(path, file);
    this.trigger('create', file);
    return file;
  }

  public async createBinary(path: string, data: ArrayBuffer, options?: DataWriteOptionsOriginal): Promise<TFile> {
    await this.adapter.writeBinary(path, data, options);
    const file = TFile.create__(this, path);
    this.setVaultAbstractFile__(path, file);
    this.trigger('create', file);
    return file;
  }

  public async createFolder(path: string): Promise<TFolder> {
    await this.adapter.mkdir(path);
    return this.registerFolderTree(path);
  }

  public createFolderSync__(path: string): TFolder {
    if (!(this.adapter instanceof InMemoryAdapter)) {
      throw new TypeError('createFolderSync__ is only supported for in-memory adapters');
    }
    this.adapter.mkdirSync__(path);
    return this.registerFolderTree(path);
  }

  public createSync__(path: string, content: string): TFile {
    if (!(this.adapter instanceof InMemoryAdapter)) {
      throw new TypeError('createSync__ is only supported for in-memory adapters');
    }
    this.adapter.writeSync__(path, content);
    const file = TFile.create__(this, path);
    this.setVaultAbstractFile__(path, file);
    this.trigger('create', file);
    return file;
  }

  public async delete(file: TAbstractFile, _force?: boolean): Promise<void> {
    if (file instanceof TFolder) {
      await this.adapter.rmdir(file.path, true);
    } else {
      await this.adapter.remove(file.path);
    }
    this.deleteVaultAbstractFile__(file.path);
    this.trigger('delete', file);
  }

  public deleteVaultAbstractFile__(path: string): void {
    const file = this.fileMap__[path];
    if (!file) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- This is a simple in-memory map for tests.
    delete this.fileMap__[path];
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- This is a simple in-memory map for tests.
    delete this.fileMapLowerCase[path.toLowerCase()];
    file.deleted__ = true;
    if (file.parent) {
      const index = file.parent.children.indexOf(file);
      if (index !== -1) {
        file.parent.children.splice(index, 1);
      }
    }
  }

  public getAbstractFileByPath(path: string): null | TAbstractFile {
    return this.fileMap__[path] ?? null;
  }

  public getAbstractFileByPathInsensitive__(path: string): null | TAbstractFile {
    return this.fileMapLowerCase[path.toLowerCase()] ?? null;
  }

  public getAllFolders(_includeRoot?: boolean): TFolder[] {
    return Object.values(this.fileMap__).filter((f): f is TFolder => f instanceof TFolder);
  }

  public getAllLoadedFiles(): TAbstractFile[] {
    return Object.values(this.fileMap__);
  }

  /**
   * Obsidian's de-duplicator: the plain name first, then ` 1`, ` 2`, … until one is free.
   *
   * @param basePath - The desired path without extension.
   * @param extension - The file extension without the leading dot.
   * @returns A path that no existing file occupies.
   */
  public getAvailablePath__(basePath: string, extension: string): string {
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
  public async getAvailablePathForAttachments__(fileName: string, extension: string, file: null | TFile): Promise<string> {
    const rawSetting = this.getConfig__(ATTACHMENT_FOLDER_PATH_CONFIG_KEY);
    const setting = typeof rawSetting === 'string' ? rawSetting : '';
    let folderPath: string;
    if (setting === '.' || setting === RELATIVE_PATH_PREFIX) {
      folderPath = file?.parent?.path ?? '';
    } else if (setting.startsWith(RELATIVE_PATH_PREFIX)) {
      folderPath = (file?.parent?.getParentPrefix__() ?? '') + setting.slice(RELATIVE_PATH_PREFIX.length);
    } else {
      folderPath = setting;
    }

    folderPath = folderPath.replace(/\/+$/, '');
    if (folderPath === '') {
      folderPath = ROOT_PATH;
    }

    const existing = this.getAbstractFileByPathInsensitive__(folderPath);
    const folder = existing instanceof TFolder ? existing : await this.createFolder(folderPath);
    return this.getAvailablePath__(folder.getParentPrefix__() + fileName, extension);
  }

  /**
   * Reads a vault setting.
   *
   * @param key - The setting key.
   * @returns The setting value, or `undefined` when the key was never set.
   */
  public getConfig__(key: string): unknown {
    return this.config__[key];
  }

  public getFileByPath(path: string): null | TFile {
    const f = this.fileMap__[path];
    return f instanceof TFile ? f : null;
  }

  public getFiles(): TFile[] {
    return Object.values(this.fileMap__).filter((f): f is TFile => f instanceof TFile);
  }

  public getFolderByPath(path: string): null | TFolder {
    const f = this.fileMap__[path];
    return f instanceof TFolder ? f : null;
  }

  public getMarkdownFiles(): TFile[] {
    return Object.values(this.fileMap__).filter((f): f is TFile => f instanceof TFile && f.extension === 'md');
  }

  public getName(): string {
    return '';
  }

  public getResourcePath(_file: TFile): string {
    return '';
  }

  public getRoot(): TFolder {
    const root = this.fileMap__['/'];
    if (root instanceof TFolder) {
      return root;
    }
    const fallback = TFolder.create__(this, '/');
    this.fileMap__['/'] = fallback;
    return fallback;
  }

  public async modify(file: TFile, data: string, options?: DataWriteOptionsOriginal): Promise<void> {
    await this.adapter.write(file.path, data, options);
    this.trigger('modify', file);
  }

  public async modifyBinary(file: TFile, data: ArrayBuffer, options?: DataWriteOptionsOriginal): Promise<void> {
    await this.adapter.writeBinary(file.path, data, options);
    this.trigger('modify', file);
  }

  public async process(file: TFile, $function: (data: string) => string, options?: DataWriteOptionsOriginal): Promise<string> {
    const content = await this.adapter.read(file.path);
    const result = $function(content);
    await this.adapter.write(file.path, result, options);
    this.trigger('modify', file);
    return result;
  }

  public async read(file: TFile): Promise<string> {
    return this.adapter.read(file.path);
  }

  public async readBinary(file: TFile): Promise<ArrayBuffer> {
    return this.adapter.readBinary(file.path);
  }

  public readSync__(file: TFile): string {
    if (!(this.adapter instanceof InMemoryAdapter)) {
      throw new TypeError('readSync__ is only supported for in-memory adapters');
    }
    return this.adapter.readSync__(file.path);
  }

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
      if (!(this.fileMap__[folderPath] instanceof TFolder)) {
        this.registerFolderTree(folderPath);
      }
    }

    for (const filePath of files) {
      if (isDotPath(filePath)) {
        continue;
      }
      keep.add(filePath);
      if (!(this.fileMap__[filePath] instanceof TFile)) {
        const file = TFile.create__(this, filePath);
        this.setVaultAbstractFile__(filePath, file);
        this.trigger('create', file);
      }
    }

    // Remove tree entries the adapter no longer has.
    for (const [path, existing] of Object.entries(this.fileMap__)) {
      if (keep.has(path) || isDotPath(path)) {
        continue;
      }
      this.deleteVaultAbstractFile__(path);
      this.trigger('delete', existing);
    }
  }

  public async rename(file: TAbstractFile, newPath: string): Promise<void> {
    const oldPath = file.path;
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
    delete this.fileMap__[oldPath];
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

    // Cascade descendant paths: their tree links are unchanged, only the path prefix moves.
    for (const descendant of descendants) {
      const oldDescendantPath = descendant.path;
      const newDescendantPath = newPath + oldDescendantPath.slice(oldPath.length);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- This is a simple in-memory map for tests.
      delete this.fileMap__[oldDescendantPath];
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- This is a simple in-memory map for tests.
      delete this.fileMapLowerCase[oldDescendantPath.toLowerCase()];
      descendant.path = newDescendantPath;
      this.fileMap__[newDescendantPath] = descendant;
      this.fileMapLowerCase[newDescendantPath.toLowerCase()] = descendant;
    }

    this.trigger('rename', file, oldPath);
  }

  /**
   * Writes a vault setting.
   *
   * @param key - The setting key.
   * @param value - The setting value.
   */
  public setConfig__(key: string, value: unknown): void {
    this.config__[key] = value;
  }

  public setVaultAbstractFile__(path: string, file: TAbstractFile): void {
    this.fileMap__[path] = file;
    this.fileMapLowerCase[path.toLowerCase()] = file;
    file.deleted__ = false;
    const lastSlash = path.lastIndexOf('/');
    const parentKey = lastSlash > 0 ? path.slice(0, lastSlash) : '/';
    const parentFile = this.fileMap__[parentKey];
    if (parentFile instanceof TFolder) {
      file.parent = parentFile;
      if (!parentFile.children.includes(file)) {
        parentFile.children.push(file);
      }
    }
  }

  public async trash(file: TAbstractFile, _system: boolean): Promise<void> {
    if (file instanceof TFolder) {
      await this.adapter.rmdir(file.path, true);
    } else {
      await this.adapter.remove(file.path);
    }
    this.deleteVaultAbstractFile__(file.path);
    this.trigger('delete', file);
  }

  private registerFolderTree(path: string): TFolder {
    const segments = path.split('/');
    let cumulative = '';
    let folder = this.getRoot();
    for (const segment of segments) {
      cumulative = cumulative === '' ? segment : `${cumulative}/${segment}`;
      const existing = this.fileMap__[cumulative];
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
}

/**
 * Dot-prefixed paths (e.g. the `.obsidian` config dir) are not tracked in the
 * vault tree, mirroring how real Obsidian excludes dotfiles/dotfolders.
 */
function isDotPath(path: string): boolean {
  return path.split('/').some((segment) => segment.startsWith('.'));
}
