import type {
  DataAdapter as DataAdapterOriginal,
  DataWriteOptions as DataWriteOptionsOriginal,
  ListedFiles as ListedFilesOriginal,
  Stat as StatOriginal
} from 'obsidian';

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

  protected constructor(private readonly basePath: string) {
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

    this.ensureParentDirs(normalizedPath);
  }

  public async appendBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptionsOriginal): Promise<void> {
    await noopAsync();
    const binaryContent = this.binaryFiles.get(normalizedPath) ?? new ArrayBuffer(0);

    const newContentArr = new Uint8Array(binaryContent.byteLength + data.byteLength);
    newContentArr.set(new Uint8Array(binaryContent), 0);
    newContentArr.set(new Uint8Array(data), binaryContent.byteLength);
    this.binaryFiles.set(normalizedPath, newContentArr.buffer);
    this.addLowerCaseKey(normalizedPath);

    const now = Date.now();
    const meta = this.fileMeta.get(normalizedPath);
    this.fileMeta.set(normalizedPath, {
      ctime: options?.ctime ?? meta?.ctime ?? now,
      mtime: options?.mtime ?? now,
      size: newContentArr.byteLength
    });

    this.ensureParentDirs(normalizedPath);
  }

  public async copy(normalizedPath: string, normalizedNewPath: string): Promise<void> {
    await noopAsync();
    const now = Date.now();

    const textContent = this.textFiles.get(normalizedPath);
    if (textContent === undefined) {
      const binaryContent = this.binaryFiles.get(normalizedPath);
      if (binaryContent === undefined) {
        throw new Error(`File not found: ${normalizedPath}`);
      } else {
        const copied = binaryContent.slice(0);
        this.binaryFiles.set(normalizedNewPath, copied);
        this.addLowerCaseKey(normalizedNewPath);
        this.fileMeta.set(normalizedNewPath, {
          ctime: now,
          mtime: now,
          size: copied.byteLength
        });
      }
    } else {
      this.textFiles.set(normalizedNewPath, textContent);
      this.addLowerCaseKey(normalizedNewPath);
      this.fileMeta.set(normalizedNewPath, {
        ctime: now,
        mtime: now,
        size: textContent.length
      });
    }

    this.ensureParentDirs(normalizedNewPath);
  }

  public async exists(normalizedPath: string, sensitive?: boolean): Promise<boolean> {
    await noopAsync();
    if (sensitive || !this.insensitive__) {
      return this.textFiles.has(normalizedPath)
        || this.binaryFiles.has(normalizedPath)
        || this.directories.has(normalizedPath);
    }

    return this.lowerCaseKeys.has(normalizedPath.toLowerCase());
  }

  public getFilePath(normalizedPath: string): string {
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

    for (const dirPath of this.directories) {
      if (dirPath !== normalizedPath && this.isDirectChild(dirPath, prefix, normalizedPath)) {
        folders.push(dirPath);
      }
    }

    return { files, folders };
  }

  public async mkdir(normalizedPath: string): Promise<void> {
    await noopAsync();
    this.mkdirSync(normalizedPath);
  }

  public async process(normalizedPath: string, fn: (data: string) => string, options?: DataWriteOptionsOriginal): Promise<string> {
    const content = await this.read(normalizedPath);
    const result = fn(content);
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

      const dirsToMove: [string, string][] = [];
      for (const dir of this.directories) {
        if (dir === normalizedPath || dir.startsWith(oldPrefix)) {
          dirsToMove.push([dir, dir === normalizedPath ? normalizedNewPath : newPrefix + dir.slice(oldPrefix.length)]);
        }
      }

      for (const [oldKey, newKey] of entriesToMove) {
        this.moveMapEntry(this.textFiles, oldKey, newKey);
        this.moveMapEntry(this.binaryFiles, oldKey, newKey);
        this.moveMapEntry(this.fileMeta, oldKey, newKey);
      }

      for (const [oldDir, newDir] of dirsToMove) {
        this.directories.delete(oldDir);
        this.directories.add(newDir);
      }

      this.ensureParentDirs(normalizedNewPath);
      this.rebuildLowerCaseKeys();
      return;
    }

    const textContent = this.textFiles.get(normalizedPath);
    if (textContent === undefined) {
      const binaryContent = this.binaryFiles.get(normalizedPath);
      if (binaryContent === undefined) {
        throw new Error(`File not found: ${normalizedPath}`);
      } else {
        this.binaryFiles.set(normalizedNewPath, binaryContent);
        this.binaryFiles.delete(normalizedPath);
      }
    } else {
      this.textFiles.set(normalizedNewPath, textContent);
      this.textFiles.delete(normalizedPath);
    }

    const meta = ensureNonNullable(this.fileMeta.get(normalizedPath));
    this.fileMeta.set(normalizedNewPath, meta);
    this.fileMeta.delete(normalizedPath);

    this.ensureParentDirs(normalizedNewPath);
    this.rebuildLowerCaseKeys();
  }

  public async rmdir(normalizedPath: string, recursive: boolean): Promise<void> {
    await noopAsync();
    if (recursive) {
      const prefix = `${normalizedPath}/`;

      for (const key of [...this.textFiles.keys()]) {
        if (key.startsWith(prefix)) {
          this.textFiles.delete(key);
          this.fileMeta.delete(key);
        }
      }
      for (const key of [...this.binaryFiles.keys()]) {
        if (key.startsWith(prefix)) {
          this.binaryFiles.delete(key);
          this.fileMeta.delete(key);
        }
      }
      for (const dir of [...this.directories]) {
        if (dir === normalizedPath || dir.startsWith(prefix)) {
          this.directories.delete(dir);
        }
      }
    } else {
      this.directories.delete(normalizedPath);
    }
    this.rebuildLowerCaseKeys();
  }

  public async stat(normalizedPath: string): Promise<null | StatOriginal> {
    await noopAsync();
    if (this.directories.has(normalizedPath)) {
      return {
        ctime: 0,
        mtime: 0,
        size: 0,
        type: 'folder'
      } as StatOriginal;
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
    } as StatOriginal;
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
    const now = Date.now();
    const meta = this.fileMeta.get(normalizedPath);

    this.textFiles.set(normalizedPath, data);
    this.addLowerCaseKey(normalizedPath);
    this.fileMeta.set(normalizedPath, {
      ctime: options?.ctime ?? meta?.ctime ?? now,
      mtime: options?.mtime ?? now,
      size: data.length
    });

    this.ensureParentDirs(normalizedPath);
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

    this.ensureParentDirs(normalizedPath);
  }

  private addLowerCaseKey(path: string): void {
    this.lowerCaseKeys.add(path.toLowerCase());
  }

  private ensureParentDirs(path: string): void {
    let parent = getParentDir(path);
    while (parent !== '' && !this.directories.has(parent)) {
      this.directories.add(parent);
      this.addLowerCaseKey(parent);
      parent = getParentDir(parent);
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

  private mkdirSync(normalizedPath: string): void {
    this.directories.add(normalizedPath);
    this.addLowerCaseKey(normalizedPath);
    this.ensureParentDirs(normalizedPath);
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
    for (const dir of this.directories) {
      this.lowerCaseKeys.add(dir.toLowerCase());
    }
  }
}

function getParentDir(path: string): string {
  const segments = path.split('/');
  segments.pop();
  return segments.join('/');
}
