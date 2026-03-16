import type { CapacitorAdapter as CapacitorAdapterOriginal } from 'obsidian';

import { InMemoryAdapter } from '../internal/in-memory-adapter.ts';
import { noop } from '../internal/noop.ts';
import {
  mergePrototype,
  strictProxyForce
} from '../internal/strict-proxy.ts';

export class CapacitorAdapter extends InMemoryAdapter {
  protected constructor(basePath: string, _fs: unknown) {
    super(basePath);
    const self = strictProxyForce(this);
    self.constructor__(basePath, _fs);
    return self;
  }

  public static create__(basePath: string, fs: unknown): CapacitorAdapter {
    return new CapacitorAdapter(basePath, fs);
  }

  public static fromOriginalType__(value: CapacitorAdapterOriginal): CapacitorAdapter {
    return mergePrototype(CapacitorAdapter, value);
  }

  public asOriginalType__(): CapacitorAdapterOriginal {
    return strictProxyForce<CapacitorAdapterOriginal>(this);
  }

  public constructor__(_basePath: string, _fs: unknown): void {
    noop();
  }

  public getFullPath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
