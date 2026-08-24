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

export class InMemoryAdapter implements DataAdapterOriginal {
  public insensitive__ = false;

  private readonly binaryFiles = new Map<string, ArrayBuffer>();
  private readonly directories = new Set<string>(['']);
  private readonly fileMeta = new Map<string, FileMeta>();
  private readonly lowerCaseKeys = new Set<string>(['']);
  private readonly textFiles = new Map<string, string>();

  protected constructor(protected readonly basePath: string) {
    noop();
  }

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

  // eslint-disable-next-line unicorn/consistent-boolean-name -- `sensitive` is Obsidian's own parameter name on the signature being mocked, so a boolean prefix would make the mock stop matching it.
  public async exists(normalizedPath: string, sensitive?: boolean): Promise<boolean> {
    await noopAsync();
    if (sensitive || !this.insensitive__) {
      return this.textFiles.has(normalizedPath)
        || this.binaryFiles.has(normalizedPath)
        || this.directories.has(normalizedPath);
    }

    return this.lowerCaseKeys.has(normalizedPath.toLowerCase());
  }

  public getFullPath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }

  public getName(): string {
    return 'mock-vault';
  }

  public getResourcePath(normalizedPath: string): string {
    return `app://local/${normalizedPath}`;
  }

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

  public listAll__(): AdapterListing {
    const files = [...this.textFiles.keys(), ...this.binaryFiles.keys()];
    const folders = [...this.directories].filter((directory) => directory !== '');
    return { files, folders };
  }

  public async mkdir(normalizedPath: string): Promise<void> {
    await noopAsync();
    this.mkdirSync__(normalizedPath);
  }

  public mkdirSync__(normalizedPath: string): void {
    this.directories.add(normalizedPath);
    this.addLowerCaseKey(normalizedPath);
    this.ensureParentDirectories(normalizedPath);
  }

  public async process(normalizedPath: string, $function: (data: string) => string, options?: DataWriteOptionsOriginal): Promise<string> {
    const content = await this.read(normalizedPath);
    const result = $function(content);
    await this.write(normalizedPath, result, options);
    return result;
  }

  public async read(normalizedPath: string): Promise<string> {
    await noopAsync();
    const content = this.textFiles.get(normalizedPath);
    if (content === undefined) {
      throw new Error(`File not found: ${normalizedPath}`);
    }
    return content;
  }

  public async readBinary(normalizedPath: string): Promise<ArrayBuffer> {
    await noopAsync();
    const content = this.binaryFiles.get(normalizedPath);
    if (content === undefined) {
      throw new Error(`File not found: ${normalizedPath}`);
    }
    return content;
  }

  public readSync__(normalizedPath: string): string {
    const content = this.textFiles.get(normalizedPath);
    if (content === undefined) {
      throw new Error(`File not found: ${normalizedPath}`);
    }
    return content;
  }

  public async remove(normalizedPath: string): Promise<void> {
    await noopAsync();
    this.textFiles.delete(normalizedPath);
    this.binaryFiles.delete(normalizedPath);
    this.fileMeta.delete(normalizedPath);
    this.rebuildLowerCaseKeys();
  }

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

  public async stat(normalizedPath: string): Promise<null | StatOriginal> {
    await noopAsync();
    return this.statSync__(normalizedPath);
  }

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
    if (!meta) {
      return null;
    }

    return {
      ctime: meta.ctime,
      mtime: meta.mtime,
      size: meta.size,
      type: 'file'
    };
  }

  public async trashLocal(normalizedPath: string): Promise<void> {
    await this.remove(normalizedPath);
  }

  public async trashSystem(normalizedPath: string): Promise<boolean> {
    await this.remove(normalizedPath);
    return true;
  }

  public async write(normalizedPath: string, data: string, options?: DataWriteOptionsOriginal): Promise<void> {
    await noopAsync();
    this.writeSync__(normalizedPath, data, options);
  }

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
    if (value !== undefined) {
      map.set(newKey, value);
      map.delete(oldKey);
    }
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
