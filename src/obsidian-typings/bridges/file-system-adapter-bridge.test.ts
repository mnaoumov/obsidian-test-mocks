import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../../internal/type-guards.ts';
import { FileSystemAdapter } from '../../obsidian/FileSystemAdapter.ts';
import {
  bridgeFileSystemAdapter,
  unbridgeFileSystemAdapter
} from './file-system-adapter-bridge.ts';

describe('file-system-adapter-bridge', () => {
  afterEach(() => {
    unbridgeFileSystemAdapter();
  });

  it('should bridge insensitive getter to insensitive__', () => {
    bridgeFileSystemAdapter();
    const adapter = FileSystemAdapter.create__('/vault');
    adapter.insensitive__ = true;
    expect(ensureGenericObject(adapter)['insensitive']).toBe(true);
  });

  it('should bridge insensitive setter to insensitive__', () => {
    bridgeFileSystemAdapter();
    const adapter = FileSystemAdapter.create__('/vault');
    ensureGenericObject(adapter)['insensitive'] = true;
    expect(adapter.insensitive__).toBe(true);
  });

  it('should not overwrite if property already exists', () => {
    bridgeFileSystemAdapter();
    bridgeFileSystemAdapter();
    const adapter = FileSystemAdapter.create__('/vault');
    expect(ensureGenericObject(adapter)['insensitive']).toBe(false);
  });

  it('should remove bridge on unbridge', () => {
    bridgeFileSystemAdapter();
    unbridgeFileSystemAdapter();
    const adapter = FileSystemAdapter.create__('/vault');
    expect('insensitive' in adapter).toBe(false);
  });
});
