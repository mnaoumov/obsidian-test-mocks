/**
 * @file
 *
 * Mock of Obsidian's `FileSystemAdapter`, the desktop vault adapter, backed by an in-memory filesystem.
 */

import type { FileSystemAdapter as FileSystemAdapterOriginal } from 'obsidian';

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
}
