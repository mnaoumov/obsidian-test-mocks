import type { FileSystemAdapter as FileSystemAdapterOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { InMemoryAdapter } from '../internal/InMemoryAdapter.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class FileSystemAdapter extends InMemoryAdapter {
  protected constructor(basePath: string) {
    super();
    this.basePath = basePath;
  }

  public static create__(basePath: string): FileSystemAdapter {
    return strictMock(new FileSystemAdapter(basePath));
  }

  public asOriginalType__(): FileSystemAdapterOriginal {
    return castTo<FileSystemAdapterOriginal>(this);
  }

  public getBasePath(): string {
    return this.basePath;
  }

  public override getFilePath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
