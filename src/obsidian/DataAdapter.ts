import type {
  DataWriteOptions,
  ListedFiles,
  Stat
} from 'obsidian';

interface FileMeta {
  ctime: number;
  mtime: number;
  size: number;
}

function getParentDir(path: string): string {
  const segments = path.split('/');
  segments.pop();
  return segments.join('/');
}

export class DataAdapter {
  public basePath = '/mock-vault';
  public insensitive = false;

  private binaryFiles = new Map<string, ArrayBuffer>();
  private directories = new Set<string>(['']);
  private fileMeta = new Map<string, FileMeta>();
  private textFiles = new Map<string, string>();

  public async append(normalizedPath: string, data: string, _options?: DataWriteOptions): Promise<void> {
    const existing = this.textFiles.get(normalizedPath) ?? '';
    const newContent = existing + data;
    this.textFiles.set(normalizedPath, newContent);

    const now = Date.now();
    const meta = this.fileMeta.get(normalizedPath);
    this.fileMeta.set(normalizedPath, {
      ctime: meta?.ctime ?? now,
      mtime: now,
      size: newContent.length
    });

    this.ensureParentDirs(normalizedPath);
  }

  public async copy(normalizedPath: string, normalizedNewPath: string): Promise<void> {
    const now = Date.now();

    if (this.textFiles.has(normalizedPath)) {
      const content = this.textFiles.get(normalizedPath)!;
      this.textFiles.set(normalizedNewPath, content);
      this.fileMeta.set(normalizedNewPath, {
        ctime: now,
        mtime: now,
        size: content.length
      });
    } else if (this.binaryFiles.has(normalizedPath)) {
      const content = this.binaryFiles.get(normalizedPath)!;
      const copied = content.slice(0);
      this.binaryFiles.set(normalizedNewPath, copied);
      this.fileMeta.set(normalizedNewPath, {
        ctime: now,
        mtime: now,
        size: copied.byteLength
      });
    } else {
      throw new Error(`File not found: ${normalizedPath}`);
    }

    this.ensureParentDirs(normalizedNewPath);
  }

  public async exists(normalizedPath: string, _sensitive?: boolean): Promise<boolean> {
    return this.textFiles.has(normalizedPath)
      || this.binaryFiles.has(normalizedPath)
      || this.directories.has(normalizedPath);
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

  public async list(normalizedPath: string): Promise<ListedFiles> {
    const files: string[] = [];
    const folders: string[] = [];
    const prefix = normalizedPath === '' ? '' : normalizedPath + '/';

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
    this.mkdirSync(normalizedPath);
  }

  public async process(normalizedPath: string, fn: (data: string) => string, _options?: DataWriteOptions): Promise<string> {
    const content = await this.read(normalizedPath);
    const result = fn(content);
    await this.write(normalizedPath, result);
    return result;
  }

  public async read(normalizedPath: string): Promise<string> {
    const content = this.textFiles.get(normalizedPath);
    if (content === undefined) {
      throw new Error(`File not found: ${normalizedPath}`);
    }
    return content;
  }

  public async readBinary(normalizedPath: string): Promise<ArrayBuffer> {
    const content = this.binaryFiles.get(normalizedPath);
    if (content === undefined) {
      throw new Error(`File not found: ${normalizedPath}`);
    }
    return content;
  }

  public async remove(normalizedPath: string): Promise<void> {
    this.textFiles.delete(normalizedPath);
    this.binaryFiles.delete(normalizedPath);
    this.fileMeta.delete(normalizedPath);
  }

  public async rename(normalizedPath: string, normalizedNewPath: string): Promise<void> {
    if (this.directories.has(normalizedPath)) {
      const oldPrefix = normalizedPath === '' ? '' : normalizedPath + '/';
      const newPrefix = normalizedNewPath === '' ? '' : normalizedNewPath + '/';

      const entriesToMove: Array<[string, string]> = [];

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

      const dirsToMove: Array<[string, string]> = [];
      for (const dir of this.directories) {
        if (dir === normalizedPath || dir.startsWith(oldPrefix)) {
          dirsToMove.push([dir, dir === normalizedPath ? normalizedNewPath : newPrefix + dir.slice(oldPrefix.length)]);
        }
      }

      for (const [oldKey, newKey] of entriesToMove) {
        if (this.textFiles.has(oldKey)) {
          this.textFiles.set(newKey, this.textFiles.get(oldKey)!);
          this.textFiles.delete(oldKey);
        }
        if (this.binaryFiles.has(oldKey)) {
          this.binaryFiles.set(newKey, this.binaryFiles.get(oldKey)!);
          this.binaryFiles.delete(oldKey);
        }
        if (this.fileMeta.has(oldKey)) {
          this.fileMeta.set(newKey, this.fileMeta.get(oldKey)!);
          this.fileMeta.delete(oldKey);
        }
      }

      for (const [oldDir, newDir] of dirsToMove) {
        this.directories.delete(oldDir);
        this.directories.add(newDir);
      }

      this.ensureParentDirs(normalizedNewPath);
      return;
    }

    if (this.textFiles.has(normalizedPath)) {
      this.textFiles.set(normalizedNewPath, this.textFiles.get(normalizedPath)!);
      this.textFiles.delete(normalizedPath);
    } else if (this.binaryFiles.has(normalizedPath)) {
      this.binaryFiles.set(normalizedNewPath, this.binaryFiles.get(normalizedPath)!);
      this.binaryFiles.delete(normalizedPath);
    } else {
      throw new Error(`File not found: ${normalizedPath}`);
    }

    if (this.fileMeta.has(normalizedPath)) {
      this.fileMeta.set(normalizedNewPath, this.fileMeta.get(normalizedPath)!);
      this.fileMeta.delete(normalizedPath);
    }

    this.ensureParentDirs(normalizedNewPath);
  }

  public async rmdir(normalizedPath: string, recursive: boolean): Promise<void> {
    if (recursive) {
      const prefix = normalizedPath === '' ? '' : normalizedPath + '/';

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
  }

  public async stat(normalizedPath: string): Promise<null | Stat> {
    if (this.directories.has(normalizedPath)) {
      return {
        ctime: 0,
        mtime: 0,
        size: 0,
        type: 'folder'
      } as unknown as Stat;
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
    } as unknown as Stat;
  }

  public async trashLocal(normalizedPath: string): Promise<void> {
    await this.remove(normalizedPath);
  }

  public async trashSystem(normalizedPath: string): Promise<boolean> {
    await this.remove(normalizedPath);
    return true;
  }

  public async write(normalizedPath: string, data: string, _options?: DataWriteOptions): Promise<void> {
    const now = Date.now();
    const meta = this.fileMeta.get(normalizedPath);

    this.textFiles.set(normalizedPath, data);
    this.fileMeta.set(normalizedPath, {
      ctime: meta?.ctime ?? now,
      mtime: now,
      size: data.length
    });

    this.ensureParentDirs(normalizedPath);
  }

  public async writeBinary(normalizedPath: string, data: ArrayBuffer, _options?: DataWriteOptions): Promise<void> {
    const now = Date.now();
    const meta = this.fileMeta.get(normalizedPath);

    this.binaryFiles.set(normalizedPath, data);
    this.fileMeta.set(normalizedPath, {
      ctime: meta?.ctime ?? now,
      mtime: now,
      size: data.byteLength
    });

    this.ensureParentDirs(normalizedPath);
  }

  private ensureParentDirs(path: string): void {
    let parent = getParentDir(path);
    while (parent !== '' && !this.directories.has(parent)) {
      this.directories.add(parent);
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
    this.ensureParentDirs(normalizedPath);
  }
}
