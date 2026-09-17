/**
 * @file
 *
 * In-memory implementation of Obsidian's `DataAdapter` interface, the filesystem shared by the
 * `FileSystemAdapter` and `CapacitorAdapter` mocks.
 */

import type {
  DataAdapter as DataAdapterOriginal,
  DataWriteOptions as DataWriteOptionsOriginal,
  ListedFiles as ListedFilesOriginal,
  Stat as StatOriginal
} from 'obsidian';

import type { AdapterListing } from './types.ts';

import {
  noop,
  noopAsync
} from './noop.ts';
import { ensureNonNullable } from './type-guards.ts';

interface FileMeta {
  ctime: number;
  mtime: number;
  size: number;
}

/**
 * An in-memory `DataAdapter`: text files, binary files and folders live in maps keyed by vault-relative path,
 * with a creation time, modification time and size kept per file.
 *
 * Parent folders are created implicitly whenever a file or folder is written. Paths are case-sensitive unless
 * {@link InMemoryAdapter.insensitive} is set.
 */
export class InMemoryAdapter implements DataAdapterOriginal {
  /**
   * Whether the simulated filesystem is case-insensitive. When `true`, {@link InMemoryAdapter.exists} matches paths
   * ignoring case unless a case-sensitive check is requested.
   */
  public insensitive = false;

  private readonly binaryFiles = new Map<string, ArrayBuffer>();
  private readonly directories = new Set<string>(['']);
  private readonly fileMeta = new Map<string, FileMeta>();
  private readonly lowerCaseKeys = new Set<string>(['']);
  private readonly textFiles = new Map<string, string>();

  /**
   * Creates an empty filesystem holding only the vault root.
   *
   * @param basePath - The absolute path the vault pretends to live at, used by `getFullPath`.
   */
  protected constructor(protected readonly basePath: string) {
    noop();
  }

  /**
   * Adds text to the end of a text file, creating the file when it does not exist.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @param data - The text to append.
   * @param options - Explicit `ctime` / `mtime` to record; by default `ctime` is kept and `mtime` is now.
   */
  public async append(normalizedPath: string, data: string, options?: DataWriteOptionsOriginal): Promise<void> {
    await noopAsync();
    const existing = this.textFiles.get(normalizedPath) ?? '';
    const newContent = existing + data;
    this.textFiles.set(normalizedPath, newContent);
    this.addLowerCaseKey(normalizedPath);

    const now = Date.now();
    const meta = this.fileMeta.get(normalizedPath);
    this.fileMeta.set(normalizedPath, {
      ctime: options?.ctime ?? meta?.ctime ?? now,
      mtime: options?.mtime ?? now,
      size: newContent.length
    });

    this.ensureParentDirectories(normalizedPath);
  }

  /**
   * Adds bytes to the end of a binary file, creating the file when it does not exist.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @param data - The bytes to append.
   * @param options - Explicit `ctime` / `mtime` to record; by default `ctime` is kept and `mtime` is now.
   */
  public async appendBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptionsOriginal): Promise<void> {
    await noopAsync();
    const binaryContent = this.binaryFiles.get(normalizedPath) ?? new ArrayBuffer(0);

    const newContentArray = new Uint8Array(binaryContent.byteLength + data.byteLength);
    newContentArray.set(new Uint8Array(binaryContent), 0);
    newContentArray.set(new Uint8Array(data), binaryContent.byteLength);
    this.binaryFiles.set(normalizedPath, newContentArray.buffer);
    this.addLowerCaseKey(normalizedPath);

    const now = Date.now();
    const meta = this.fileMeta.get(normalizedPath);
    this.fileMeta.set(normalizedPath, {
      ctime: options?.ctime ?? meta?.ctime ?? now,
      mtime: options?.mtime ?? now,
      size: newContentArray.byteLength
    });

    this.ensureParentDirectories(normalizedPath);
  }

  /**
   * Copies a text or binary file, stamping the copy with the current time. Obsidian fails when a file already exists
   * at the destination; the mock overwrites it.
   *
   * @param normalizedPath - The vault-relative path of the file to copy.
   * @param normalizedNewPath - The vault-relative path of the copy.
   * @throws Error when no file exists at `normalizedPath`.
   */
  public async copy(normalizedPath: string, normalizedNewPath: string): Promise<void> {
    await noopAsync();
    const now = Date.now();

    const textContent = this.textFiles.get(normalizedPath);
    if (textContent === undefined) {
      const binaryContent = this.binaryFiles.get(normalizedPath);
      if (binaryContent === undefined) {
        throw new Error(`File not found: ${normalizedPath}`);
      }

      // eslint-disable-next-line unicorn/prefer-spread -- `binaryContent` is an `ArrayBuffer`, so `slice(0)` copies the BUFFER. Spreading it would produce a plain array and lose `byteLength`.
      const copied = binaryContent.slice(0);
      this.binaryFiles.set(normalizedNewPath, copied);
      this.addLowerCaseKey(normalizedNewPath);
      this.fileMeta.set(normalizedNewPath, {
        ctime: now,
        mtime: now,
        size: copied.byteLength
      });
    } else {
      this.textFiles.set(normalizedNewPath, textContent);
      this.addLowerCaseKey(normalizedNewPath);
      this.fileMeta.set(normalizedNewPath, {
        ctime: now,
        mtime: now,
        size: textContent.length
      });
    }

    this.ensureParentDirectories(normalizedNewPath);
  }

  /**
   * Checks whether a file or folder exists at a path.
   *
   * @param normalizedPath - The vault-relative path to check.
   * @param sensitive - Forces a case-sensitive check even when {@link InMemoryAdapter.insensitive} is set.
   * @returns `true` when a text file, binary file or folder exists at the path.
   */
  // eslint-disable-next-line unicorn/consistent-boolean-name -- `sensitive` is Obsidian's own parameter name on the signature being mocked, so a boolean prefix would make the mock stop matching it.
  public async exists(normalizedPath: string, sensitive?: boolean): Promise<boolean> {
    await noopAsync();
    return sensitive || !this.insensitive
      ? this.textFiles.has(normalizedPath)
        || this.binaryFiles.has(normalizedPath)
        || this.directories.has(normalizedPath)
      : this.lowerCaseKeys.has(normalizedPath.toLowerCase());
  }

  /**
   * Resolves a vault-relative path against the adapter's base path.
   *
   * @param normalizedPath - The vault-relative path.
   * @returns The base path joined with `normalizedPath` by a `/`.
   */
  public getFullPath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }

  /**
   * Gets the vault's name.
   *
   * @returns Always `mock-vault` in the mock.
   */
  public getName(): string {
    return 'mock-vault';
  }

  /**
   * Returns a URI the browser engine can load, for example to embed an image.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @returns A fake `app://local/` URI for the path; nothing is served at it.
   */
  public getResourcePath(normalizedPath: string): string {
    return `app://local/${normalizedPath}`;
  }

  /**
   * Lists the files and folders directly inside a folder, not recursively.
   *
   * @param normalizedPath - The vault-relative path of the folder; an empty string for the vault root.
   * @returns The vault-relative paths of the direct child files and folders.
   */
  public async list(normalizedPath: string): Promise<ListedFilesOriginal> {
    await noopAsync();
    const files: string[] = [];
    const folders: string[] = [];
    const prefix = normalizedPath === '' ? '' : `${normalizedPath}/`;

    for (const filePath of this.textFiles.keys()) {
      if (this.isDirectChild(filePath, prefix, normalizedPath)) {
        files.push(filePath);
      }
    }

    for (const filePath of this.binaryFiles.keys()) {
      if (this.isDirectChild(filePath, prefix, normalizedPath)) {
        files.push(filePath);
      }
    }

    for (const directoryPath of this.directories) {
      if (directoryPath !== normalizedPath && this.isDirectChild(directoryPath, prefix, normalizedPath)) {
        folders.push(directoryPath);
      }
    }

    return { files, folders };
  }

  /**
   * Mock-only: lists every file and folder in the filesystem, at any depth.
   *
   * @returns The paths of all text and binary files, and of all folders except the vault root.
   */
  public listAll__(): AdapterListing {
    const files = [...this.textFiles.keys(), ...this.binaryFiles.keys()];
    const folders = [...this.directories].filter((directory) => directory !== '');
    return { files, folders };
  }

  /**
   * Creates a folder and any missing parent folders.
   *
   * @param normalizedPath - The vault-relative path of the folder.
   */
  public async mkdir(normalizedPath: string): Promise<void> {
    await noopAsync();
    this.mkdirSync__(normalizedPath);
  }

  /**
   * Mock-only: synchronous {@link InMemoryAdapter.mkdir}, for seeding a vault without awaiting.
   *
   * @param normalizedPath - The vault-relative path of the folder.
   */
  public mkdirSync__(normalizedPath: string): void {
    this.directories.add(normalizedPath);
    this.addLowerCaseKey(normalizedPath);
    this.ensureParentDirectories(normalizedPath);
  }

  /**
   * Reads a text file, transforms its content and writes the result back.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @param $function - Receives the current content and returns the new content synchronously.
   * @param options - Write options, as for {@link InMemoryAdapter.write}.
   * @returns The content that was written.
   * @throws Error when no text file exists at `normalizedPath`.
   */
  public async process(normalizedPath: string, $function: (data: string) => string, options?: DataWriteOptionsOriginal): Promise<string> {
    const content = await this.read(normalizedPath);
    const result = $function(content);
    await this.write(normalizedPath, result, options);
    return result;
  }

  /**
   * Reads a text file.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @returns The file's content.
   * @throws Error when no text file exists at `normalizedPath`; binary files are not readable as text.
   */
  public async read(normalizedPath: string): Promise<string> {
    await noopAsync();
    const content = this.textFiles.get(normalizedPath);
    if (content === undefined) {
      throw new Error(`File not found: ${normalizedPath}`);
    }
    return content;
  }

  /**
   * Reads a binary file.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @returns The stored buffer itself, not a copy.
   * @throws Error when no binary file exists at `normalizedPath`; text files are not readable as binary.
   */
  public async readBinary(normalizedPath: string): Promise<ArrayBuffer> {
    await noopAsync();
    const content = this.binaryFiles.get(normalizedPath);
    if (content === undefined) {
      throw new Error(`File not found: ${normalizedPath}`);
    }
    return content;
  }

  /**
   * Mock-only: synchronous {@link InMemoryAdapter.read}.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @returns The file's content.
   * @throws Error when no text file exists at `normalizedPath`.
   */
  public readSync__(normalizedPath: string): string {
    const content = this.textFiles.get(normalizedPath);
    if (content === undefined) {
      throw new Error(`File not found: ${normalizedPath}`);
    }
    return content;
  }

  /**
   * Deletes a file. Deleting a path that holds no file does nothing.
   *
   * @param normalizedPath - The vault-relative path of the file.
   */
  public async remove(normalizedPath: string): Promise<void> {
    await noopAsync();
    this.textFiles.delete(normalizedPath);
    this.binaryFiles.delete(normalizedPath);
    this.fileMeta.delete(normalizedPath);
    this.rebuildLowerCaseKeys();
  }

  /**
   * Moves a file, or a folder together with everything under it, creating missing parent folders of the destination.
   *
   * @param normalizedPath - The current vault-relative path.
   * @param normalizedNewPath - The new vault-relative path; an existing file there is overwritten.
   * @throws Error when neither a folder nor a file exists at `normalizedPath`.
   */
  public async rename(normalizedPath: string, normalizedNewPath: string): Promise<void> {
    await noopAsync();
    if (this.directories.has(normalizedPath)) {
      const oldPrefix = `${normalizedPath}/`;
      const newPrefix = `${normalizedNewPath}/`;

      const entriesToMove: [string, string][] = [];

      for (const key of this.textFiles.keys()) {
        if (key === normalizedPath || key.startsWith(oldPrefix)) {
          entriesToMove.push([key, newPrefix + key.slice(oldPrefix.length)]);
        }
      }
      for (const key of this.binaryFiles.keys()) {
        if (key === normalizedPath || key.startsWith(oldPrefix)) {
          entriesToMove.push([key, newPrefix + key.slice(oldPrefix.length)]);
        }
      }

      const directoriesToMove: [string, string][] = [];
      for (const directory of this.directories) {
        if (directory === normalizedPath || directory.startsWith(oldPrefix)) {
          directoriesToMove.push([directory, directory === normalizedPath ? normalizedNewPath : newPrefix + directory.slice(oldPrefix.length)]);
        }
      }

      for (const [oldKey, newKey] of entriesToMove) {
        this.moveMapEntry(this.textFiles, oldKey, newKey);
        this.moveMapEntry(this.binaryFiles, oldKey, newKey);
        this.moveMapEntry(this.fileMeta, oldKey, newKey);
      }

      for (const [oldDirectory, newDirectory] of directoriesToMove) {
        this.directories.delete(oldDirectory);
        this.directories.add(newDirectory);
      }

      this.ensureParentDirectories(normalizedNewPath);
      this.rebuildLowerCaseKeys();
      return;
    }

    const textContent = this.textFiles.get(normalizedPath);
    if (textContent === undefined) {
      const binaryContent = this.binaryFiles.get(normalizedPath);
      if (binaryContent === undefined) {
        throw new Error(`File not found: ${normalizedPath}`);
      }
      this.binaryFiles.set(normalizedNewPath, binaryContent);
      this.binaryFiles.delete(normalizedPath);
    } else {
      this.textFiles.set(normalizedNewPath, textContent);
      this.textFiles.delete(normalizedPath);
    }

    const meta = ensureNonNullable(this.fileMeta.get(normalizedPath));
    this.fileMeta.set(normalizedNewPath, meta);
    this.fileMeta.delete(normalizedPath);

    this.ensureParentDirectories(normalizedNewPath);
    this.rebuildLowerCaseKeys();
  }

  /**
   * Removes a folder. Obsidian requires the folder to be empty unless `recursive` is set; the mock does not check, and
   * a non-recursive call removes only the folder entry itself, leaving anything under it in place.
   *
   * @param normalizedPath - The vault-relative path of the folder.
   * @param recursive - Whether to delete everything under the folder too.
   */
  // eslint-disable-next-line unicorn/consistent-boolean-name -- `recursive` is Obsidian's own parameter name on the signature being mocked, so a boolean prefix would make the mock stop matching it.
  public async rmdir(normalizedPath: string, recursive: boolean): Promise<void> {
    await noopAsync();
    if (recursive) {
      const prefix = `${normalizedPath}/`;

      for (const key of this.textFiles.keys()) {
        if (!key.startsWith(prefix)) {
          continue;
        }

        this.textFiles.delete(key);
        this.fileMeta.delete(key);
      }
      for (const key of this.binaryFiles.keys()) {
        if (!key.startsWith(prefix)) {
          continue;
        }

        this.binaryFiles.delete(key);
        this.fileMeta.delete(key);
      }
      for (const directory of this.directories) {
        if (directory === normalizedPath || directory.startsWith(prefix)) {
          this.directories.delete(directory);
        }
      }
    } else {
      this.directories.delete(normalizedPath);
    }
    this.rebuildLowerCaseKeys();
  }

  /**
   * Retrieves metadata about a file or folder.
   *
   * @param normalizedPath - The vault-relative path.
   * @returns The type, times and size, with all three numbers `0` for a folder; `null` when nothing exists there.
   */
  public async stat(normalizedPath: string): Promise<null | StatOriginal> {
    await noopAsync();
    return this.statSync__(normalizedPath);
  }

  /**
   * Mock-only: synchronous {@link InMemoryAdapter.stat}.
   *
   * @param normalizedPath - The vault-relative path.
   * @returns The type, times and size, with all three numbers `0` for a folder; `null` when nothing exists there.
   */
  public statSync__(normalizedPath: string): null | StatOriginal {
    if (this.directories.has(normalizedPath)) {
      return {
        ctime: 0,
        mtime: 0,
        size: 0,
        type: 'folder'
      };
    }

    const meta = this.fileMeta.get(normalizedPath);
    return meta
      ? {
        ctime: meta.ctime,
        mtime: meta.mtime,
        size: meta.size,
        type: 'file'
      }
      : null;
  }

  /**
   * Moves a file into the vault's `.trash` folder. The mock has no trash: the file is deleted outright.
   *
   * @param normalizedPath - The vault-relative path of the file.
   */
  public async trashLocal(normalizedPath: string): Promise<void> {
    await this.remove(normalizedPath);
  }

  /**
   * Moves a file to the system trash. The mock has no trash: the file is deleted outright.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @returns Always `true`, since the deletion cannot fail.
   */
  public async trashSystem(normalizedPath: string): Promise<boolean> {
    await this.remove(normalizedPath);
    return true;
  }

  /**
   * Writes a text file, overwriting any existing content and creating missing parent folders.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @param data - The new content.
   * @param options - Explicit `ctime` / `mtime` to record; by default `ctime` is kept and `mtime` is now.
   */
  public async write(normalizedPath: string, data: string, options?: DataWriteOptionsOriginal): Promise<void> {
    await noopAsync();
    this.writeSync__(normalizedPath, data, options);
  }

  /**
   * Writes a binary file, overwriting any existing content and creating missing parent folders.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @param data - The new content, stored as is without copying.
   * @param options - Explicit `ctime` / `mtime` to record; by default `ctime` is kept and `mtime` is now.
   */
  public async writeBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptionsOriginal): Promise<void> {
    await noopAsync();
    const now = Date.now();
    const meta = this.fileMeta.get(normalizedPath);

    this.binaryFiles.set(normalizedPath, data);
    this.addLowerCaseKey(normalizedPath);
    this.fileMeta.set(normalizedPath, {
      ctime: options?.ctime ?? meta?.ctime ?? now,
      mtime: options?.mtime ?? now,
      size: data.byteLength
    });

    this.ensureParentDirectories(normalizedPath);
  }

  /**
   * Mock-only: synchronous {@link InMemoryAdapter.write}, for seeding a vault without awaiting.
   *
   * @param normalizedPath - The vault-relative path of the file.
   * @param data - The new content.
   * @param options - Explicit `ctime` / `mtime` to record; by default `ctime` is kept and `mtime` is now.
   */
  public writeSync__(normalizedPath: string, data: string, options?: DataWriteOptionsOriginal): void {
    this.textFiles.set(normalizedPath, data);
    this.addLowerCaseKey(normalizedPath);
    const meta = this.fileMeta.get(normalizedPath);
    const now = Date.now();
    this.fileMeta.set(normalizedPath, {
      ctime: options?.ctime ?? meta?.ctime ?? now,
      mtime: options?.mtime ?? now,
      size: data.length
    });
    this.ensureParentDirectories(normalizedPath);
  }

  private addLowerCaseKey(path: string): void {
    this.lowerCaseKeys.add(path.toLowerCase());
  }

  private ensureParentDirectories(path: string): void {
    let parent = getParentDirectory(path);
    while (parent !== '' && !this.directories.has(parent)) {
      this.directories.add(parent);
      this.addLowerCaseKey(parent);
      parent = getParentDirectory(parent);
    }
    this.directories.add('');
  }

  private isDirectChild(path: string, prefix: string, normalizedPath: string): boolean {
    if (normalizedPath === '') {
      return !path.includes('/') && path !== '';
    }
    if (!path.startsWith(prefix)) {
      return false;
    }
    const remainder = path.slice(prefix.length);
    return remainder !== '' && !remainder.includes('/');
  }

  private moveMapEntry<V>(map: Map<string, V>, oldKey: string, newKey: string): void {
    const value = map.get(oldKey);
    if (value === undefined) {
      return;
    }

    map.set(newKey, value);
    map.delete(oldKey);
  }

  private rebuildLowerCaseKeys(): void {
    this.lowerCaseKeys.clear();
    for (const key of this.textFiles.keys()) {
      this.lowerCaseKeys.add(key.toLowerCase());
    }
    for (const key of this.binaryFiles.keys()) {
      this.lowerCaseKeys.add(key.toLowerCase());
    }
    for (const directory of this.directories) {
      this.lowerCaseKeys.add(directory.toLowerCase());
    }
  }
}

function getParentDirectory(path: string): string {
  const segments = path.split('/');
  segments.pop();
  return segments.join('/');
}
