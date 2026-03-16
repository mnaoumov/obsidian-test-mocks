import type { CapacitorAdapter as CapacitorAdapterOriginal } from 'obsidian';

import { InMemoryAdapter } from '../internal/in-memory-adapter.ts';
import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export class CapacitorAdapter extends InMemoryAdapter {
  protected constructor(basePath: string, _fs: unknown) {
    super(basePath);
    const self = strictProxy(this);
    self.constructor__(basePath, _fs);
    return self;
  }

  public static create__(basePath: string, fs: unknown): CapacitorAdapter {
    return new CapacitorAdapter(basePath, fs);
  }

  public static fromOriginalType__(value: CapacitorAdapterOriginal): CapacitorAdapter {
    return strictProxy(value, CapacitorAdapter);
  }

  public asOriginalType__(): CapacitorAdapterOriginal {
    return strictProxy<CapacitorAdapterOriginal>(this);
  }

  public constructor__(_basePath: string, _fs: unknown): void {
    noop();
  }

  public getFullPath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
