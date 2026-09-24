/**
 * @file
 *
 * Mock of Obsidian's `FileSystemAdapter`, the desktop vault adapter, backed by an in-memory filesystem.
 */

import type {
  DataWriteOptions as DataWriteOptionsOriginal,
  FileSystemAdapter as FileSystemAdapterOriginal
} from 'obsidian';

import { InMemoryAdapter } from '../internal/in-memory-adapter.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `FileSystemAdapter`.
 *
 * File operations come from the in-memory adapter; nothing touches the real disk. The base path is only used to
 * build the absolute paths the desktop adapter reports.
 */
export class FileSystemAdapter extends InMemoryAdapter {
  /**
   * Creates an adapter rooted at a base path. Use {@link FileSystemAdapter.create__} from tests.
   *
   * @param basePath - The absolute path the vault is reported to live at.
   */
  protected constructor(basePath: string) {
    super(basePath);
    const self = strictProxy(this);
    self.constructor__(basePath);
    return self;
  }

  /**
   * Mock-only factory: creates a file system adapter, spyable via `vi.spyOn(FileSystemAdapter, 'create__')`.
   *
   * @param basePath - The absolute path the vault is reported to live at.
   * @returns The new file system adapter.
   */
  public static create__(basePath: string): FileSystemAdapter {
    return new FileSystemAdapter(basePath);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `FileSystemAdapter` as this mock.
   *
   * @param value - The value typed as the original `FileSystemAdapter`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: FileSystemAdapterOriginal): FileSystemAdapter {
    return strictProxy(value, FileSystemAdapter);
  }

  /**
   * Reads a file from anywhere on the local disk, by absolute path.
   *
   * The mock reads nothing: it resolves to an empty buffer.
   *
   * @param _path - The absolute path of the file to read.
   * @returns An empty `ArrayBuffer`.
   */
  public static async readLocalFile(_path: string): Promise<ArrayBuffer> {
    await noopAsync();
    return new ArrayBuffer(0);
  }

  /**
   * Adds text to the end of a text file, as the in-memory adapter does, except that the file's folder must already
   * exist: Obsidian's desktop adapter runs `fs.appendFile`, which does not create parents.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @param data - The text to append.
   * @param options - Explicit `ctime` / `mtime` to record; by default `ctime` is kept and `mtime` is now.
   * @throws Error `ENOENT: no such file or directory, open …` when the file's folder does not exist, and
   * `ENOTDIR: not a directory, open …` when a file sits where that folder would be.
   */
  public override async append(normalizedPath: string, data: string, options?: DataWriteOptionsOriginal): Promise<void> {
    this.ensureParentFolderForOpen(normalizedPath);
    await super.append(normalizedPath, data, options);
  }

  /**
   * Adds bytes to the end of a binary file, as the in-memory adapter does, except that the file's folder must already
   * exist: Obsidian's desktop adapter runs `fs.appendFile`, which does not create parents.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @param data - The bytes to append.
   * @param options - Explicit `ctime` / `mtime` to record; by default `ctime` is kept and `mtime` is now.
   * @throws Error `ENOENT: no such file or directory, open …` when the file's folder does not exist, and
   * `ENOTDIR: not a directory, open …` when a file sits where that folder would be.
   */
  public override async appendBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptionsOriginal): Promise<void> {
    this.ensureParentFolderForOpen(normalizedPath);
    await super.appendBinary(normalizedPath, data, options);
  }

  /**
   * Mock-only: views this mock as Obsidian's `FileSystemAdapter` type.
   *
   * @returns The same object, typed as the original `FileSystemAdapter`.
   */
  public asOriginalType__(): FileSystemAdapterOriginal {
    return strictProxy<FileSystemAdapterOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(FileSystemAdapter.prototype, 'constructor__')`.
   *
   * @param _basePath - The base path the adapter was created with.
   */
  public constructor__(_basePath: string): void {
    noop();
  }

  /**
   * Copies a file, or a folder together with everything under it, as the in-memory adapter does, except that a FILE
   * is never copied into a missing folder: Obsidian's desktop adapter copies a file with `fs.copyFile`, which does not
   * create parents, while it creates a copied folder with a recursive `mkdir`, which does.
   *
   * @param normalizedPath - The vault-relative path of the file or folder to copy.
   * @param normalizedNewPath - The vault-relative path of the copy.
   * @throws Error `ENOENT: no such file or directory, copyfile …` when a file's destination folder does not exist, and
   * whatever {@link InMemoryAdapter.copy} throws.
   */
  public override async copy(normalizedPath: string, normalizedNewPath: string): Promise<void> {
    if (this.statSync__(normalizedPath)?.type === 'file' && this.statSync__(getParentPath(normalizedNewPath))?.type !== 'folder') {
      throw new Error(
        `ENOENT: no such file or directory, copyfile '${this.getFullPath(normalizedPath)}' -> '${this.getFullPath(normalizedNewPath)}'`
      );
    }

    await super.copy(normalizedPath, normalizedNewPath);
  }

  /**
   * Gets the absolute path of the vault folder on disk.
   *
   * @returns The base path the adapter was created with.
   */
  public getBasePath(): string {
    return this.basePath;
  }

  /**
   * Gets the `file://` path of a vault file.
   *
   * The mock does not build a `file://` URL: it joins the base path and the vault path with `/`.
   *
   * @param normalizedPath - The vault path of the file.
   * @returns The base path and `normalizedPath` joined with `/`.
   */
  public getFilePath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }

  /**
   * Gets the absolute on-disk path of a vault file.
   *
   * @param normalizedPath - The vault path of the file.
   * @returns The base path and `normalizedPath` joined with `/`.
   */
  public override getFullPath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }

  /**
   * Removes a folder. Obsidian's desktop adapter runs `fs.rm(path, { recursive })`, so without `recursive` it
   * refuses ANY folder, an empty one included. A FILE at `normalizedPath` is deleted whatever `recursive` says, as
   * `fs.rm` deletes one.
   *
   * @param normalizedPath - The vault-relative path of the folder.
   * @param recursive - Whether to delete everything under the folder too.
   * @throws Error `ENOENT: no such file or directory, lstat …` when nothing exists at `normalizedPath`, and
   * `Path is a directory: rm returned EISDIR (is a directory) …` when it is a folder and `recursive` is not set.
   */
  public override async rmdir(normalizedPath: string, recursive: boolean): Promise<void> {
    this.ensureExistsForRmdir(normalizedPath);
    if (this.statSync__(normalizedPath)?.type === 'file') {
      await this.remove(normalizedPath);
      return;
    }

    if (!recursive) {
      throw new Error(`Path is a directory: rm returned EISDIR (is a directory) ${this.getFullPath(normalizedPath)}`);
    }

    await super.rmdir(normalizedPath, true);
  }

  /**
   * Writes a text file, as the in-memory adapter does, except that the file's folder must already exist: Obsidian's
   * desktop adapter runs `fs.writeFile`, which does not create parents. This is what makes `Vault.create` reject a
   * path whose folder is missing, exactly as in the app, where the vault itself checks nothing.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @param data - The new content.
   * @param options - Explicit `ctime` / `mtime` to record; by default `ctime` is kept and `mtime` is now.
   * @throws Error `ENOENT: no such file or directory, open …` when the file's folder does not exist, and
   * `ENOTDIR: not a directory, open …` when a file sits where that folder would be.
   */
  public override async write(normalizedPath: string, data: string, options?: DataWriteOptionsOriginal): Promise<void> {
    this.ensureParentFolderForOpen(normalizedPath);
    await super.write(normalizedPath, data, options);
  }

  /**
   * Writes a binary file, as the in-memory adapter does, except that the file's folder must already exist: Obsidian's
   * desktop adapter runs `fs.writeFile`, which does not create parents. This is what makes `Vault.createBinary` reject
   * a path whose folder is missing, exactly as in the app, where the vault itself checks nothing.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @param data - The new content, stored as is without copying.
   * @param options - Explicit `ctime` / `mtime` to record; by default `ctime` is kept and `mtime` is now.
   * @throws Error `ENOENT: no such file or directory, open …` when the file's folder does not exist, and
   * `ENOTDIR: not a directory, open …` when a file sits where that folder would be.
   */
  public override async writeBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptionsOriginal): Promise<void> {
    this.ensureParentFolderForOpen(normalizedPath);
    await super.writeBinary(normalizedPath, data, options);
  }

  private ensureParentFolderForOpen(normalizedPath: string): void {
    const parentType = this.statSync__(getParentPath(normalizedPath))?.type;
    if (parentType === 'folder') {
      return;
    }

    const code = parentType === 'file' ? 'ENOTDIR: not a directory' : 'ENOENT: no such file or directory';
    throw new Error(`${code}, open '${this.getFullPath(normalizedPath)}'`);
  }
}

function getParentPath(normalizedPath: string): string {
  const lastSlashIndex = normalizedPath.lastIndexOf('/');
  return lastSlashIndex === -1 ? '' : normalizedPath.slice(0, lastSlashIndex);
}
