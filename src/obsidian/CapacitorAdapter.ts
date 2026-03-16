import type { CapacitorAdapter as CapacitorAdapterOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { InMemoryAdapter } from '../internal/in-memory-adapter.ts';
import { noop } from '../internal/noop.ts';

export class CapacitorAdapter extends InMemoryAdapter {
  protected constructor(basePath: string, _fs: unknown) {
    super(basePath);
    const self = createMockOfUnsafe(this);
    self.constructor__(basePath, _fs);
    return self;
  }

  public static create__(basePath: string, fs: unknown): CapacitorAdapter {
    return new CapacitorAdapter(basePath, fs);
  }

  public static fromOriginalType__(value: CapacitorAdapterOriginal): CapacitorAdapter {
    return createMockOfUnsafe<CapacitorAdapter>(value);
  }

  public asOriginalType__(): CapacitorAdapterOriginal {
    return createMockOfUnsafe<CapacitorAdapterOriginal>(this);
  }

  public constructor__(_basePath: string, _fs: unknown): void {
    noop();
  }

  public getFullPath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
