import type { FileSystemAdapter as FileSystemAdapterOriginal } from 'obsidian';

import { InMemoryAdapter } from '../internal/in-memory-adapter.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export class FileSystemAdapter extends InMemoryAdapter {
  protected constructor(basePath: string) {
    super(basePath);
    const self = strictProxy(this);
    self.constructor__(basePath);
    return self;
  }

  public static create__(basePath: string): FileSystemAdapter {
    return new FileSystemAdapter(basePath);
  }

  public static fromOriginalType__(value: FileSystemAdapterOriginal): FileSystemAdapter {
    return strictProxy(value, FileSystemAdapter);
  }

  public static async readLocalFile(_path: string): Promise<ArrayBuffer> {
    await noopAsync();
    return new ArrayBuffer(0);
  }

  public asOriginalType__(): FileSystemAdapterOriginal {
    return strictProxy<FileSystemAdapterOriginal>(this);
  }

  public constructor__(_basePath: string): void {
    noop();
  }

  public getBasePath(): string {
    return this.basePath;
  }

  public getFilePath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }

  public override getFullPath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
