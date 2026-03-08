import { castTo } from '../internal/Cast.ts';
import type { CapacitorAdapter as RealCapacitorAdapter } from 'obsidian';

import { InMemoryAdapter } from '../internal/InMemoryAdapter.ts';
import {
  strictMock
} from '../internal/StrictMock.ts';

export class CapacitorAdapter extends InMemoryAdapter {
  protected constructor(basePath: string, _fs: unknown) {
    super();
    this.basePath = basePath;
    const mock = strictMock(this);
    CapacitorAdapter.constructor__(mock, basePath, _fs);
    return mock;
  }

  public static constructor__(_instance: CapacitorAdapter, _basePath: string, _fs: unknown): void {
    // Spy hook.
  }

  public static create__(basePath: string, _fs: unknown): CapacitorAdapter {
    return new CapacitorAdapter(basePath, _fs);
  }

  public asReal__(): RealCapacitorAdapter {
    return castTo<RealCapacitorAdapter>(this);
  }

  public getFullPath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
