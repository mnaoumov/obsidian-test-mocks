/**
 * @file
 *
 * Mock of Obsidian's `CapacitorAdapter`, the mobile vault data adapter, backed by an in-memory filesystem.
 */

import type { CapacitorAdapter as CapacitorAdapterOriginal } from 'obsidian';

import { InMemoryAdapter } from '../internal/in-memory-adapter.ts';
import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `CapacitorAdapter`, the `DataAdapter` Obsidian uses on mobile.
 *
 * All file operations come from the shared in-memory filesystem; nothing touches the real disk.
 */
export class CapacitorAdapter extends InMemoryAdapter {
  /**
   * Creates an adapter rooted at a base path.
   *
   * @param basePath - The vault's base path, used to build full paths.
   * @param fs - The Capacitor filesystem handle; only forwarded to the construction hook.
   */
  protected constructor(basePath: string, fs: unknown) {
    super(basePath);
    const self = strictProxy(this);
    self.constructor__(basePath, fs);
    return self;
  }

  /**
   * Mock-only factory: creates an adapter, spyable via `vi.spyOn(CapacitorAdapter, 'create__')`.
   *
   * @param basePath - The vault's base path.
   * @param fs - The Capacitor filesystem handle; unused by the mock.
   * @returns The new adapter.
   */
  public static create__(basePath: string, fs: unknown): CapacitorAdapter {
    return new CapacitorAdapter(basePath, fs);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `CapacitorAdapter` as this mock.
   *
   * @param value - The value typed as the original `CapacitorAdapter`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: CapacitorAdapterOriginal): CapacitorAdapter {
    return strictProxy(value, CapacitorAdapter);
  }

  /**
   * Mock-only: views this mock as Obsidian's `CapacitorAdapter` type.
   *
   * @returns The same object, typed as the original `CapacitorAdapter`.
   */
  public asOriginalType__(): CapacitorAdapterOriginal {
    return strictProxy<CapacitorAdapterOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(CapacitorAdapter.prototype, 'constructor__')`.
   *
   * @param _basePath - The base path the adapter was created with.
   * @param _fs - The filesystem handle the adapter was created with.
   */
  public constructor__(_basePath: string, _fs: unknown): void {
    noop();
  }

  /**
   * Resolves a vault path to a full path on the device.
   *
   * @param normalizedPath - The normalized vault-relative path.
   * @returns The base path and the vault path joined with `/`.
   */
  public override getFullPath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
