import type { CapacitorAdapter as CapacitorAdapterOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { InMemoryAdapter } from '../internal/in-memory-adapter.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class CapacitorAdapter extends InMemoryAdapter {
  protected constructor(basePath: string, _fs: unknown) {
    super();
    this.basePath = basePath;
  }

  public static create__(basePath: string, fs: unknown): CapacitorAdapter {
    return strictMock(new CapacitorAdapter(basePath, fs));
  }

  public asOriginalType__(): CapacitorAdapterOriginal {
    return castTo<CapacitorAdapterOriginal>(this);
  }

  public getFullPath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
