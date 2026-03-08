import type { FileSystemAdapter as RealFileSystemAdapter } from 'obsidian';

import { InMemoryAdapter } from '../internal/InMemoryAdapter.ts';
import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';

export class FileSystemAdapter extends InMemoryAdapter {
  protected constructor(basePath: string) {
    super();
    this.basePath = basePath;
    const mock = strictMock(this);
    FileSystemAdapter.constructor__(mock, basePath);
    return mock;
  }

  public static constructor__(_instance: FileSystemAdapter, _basePath: string): void {
    // Spy hook.
  }

  public static create__(basePath: string): FileSystemAdapter {
    return new FileSystemAdapter(basePath);
  }

  public asReal__(): RealFileSystemAdapter {
    return strictCastTo<RealFileSystemAdapter>(this);
  }

  public getBasePath(): string {
    return this.basePath;
  }

  public override getFilePath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
