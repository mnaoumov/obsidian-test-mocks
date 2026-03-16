import type { FileSystemAdapter as FileSystemAdapterOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { InMemoryAdapter } from '../internal/in-memory-adapter.ts';
import { noop } from '../internal/noop.ts';

export class FileSystemAdapter extends InMemoryAdapter {
  protected constructor(basePath: string) {
    super(basePath);
    const self = createMockOfUnsafe(this);
    self.constructor__(basePath);
    return self;
  }

  public static create__(basePath: string): FileSystemAdapter {
    return new FileSystemAdapter(basePath);
  }

  public static fromOriginalType__(value: FileSystemAdapterOriginal): FileSystemAdapter {
    return createMockOfUnsafe<FileSystemAdapter>(value);
  }

  public asOriginalType__(): FileSystemAdapterOriginal {
    return createMockOfUnsafe<FileSystemAdapterOriginal>(this);
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
