import type { FileSystemAdapter as FileSystemAdapterOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { InMemoryAdapter } from '../internal/in-memory-adapter.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class FileSystemAdapter extends InMemoryAdapter {
  protected constructor(basePath: string) {
    super();
    this.basePath = basePath;
    const self = strictMock(this);
    self.constructor__(basePath);
    return self;
  }

  public static create__(basePath: string): FileSystemAdapter {
    return new FileSystemAdapter(basePath);
  }

  public asOriginalType__(): FileSystemAdapterOriginal {
    return castTo<FileSystemAdapterOriginal>(this);
  }

  public constructor__(_basePath: string): void {
    noop();
  }

  public getBasePath(): string {
    return this.basePath;
  }

  public override getFilePath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
