import type { CapacitorAdapter as CapacitorAdapterOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { CapacitorAdapter } from './CapacitorAdapter.ts';

describe('CapacitorAdapter', () => {
  function createAdapter(): CapacitorAdapter {
    return CapacitorAdapter.create__('/mock-vault', null);
  }

  it('should create an instance via create__', () => {
    const adapter = createAdapter();
    expect(adapter).toBeInstanceOf(CapacitorAdapter);
  });

  it('should throw when accessing an unmocked property', () => {
    const adapter = createAdapter();
    const record = adapter as unknown as Record<string, unknown>;
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in CapacitorAdapter. To override, assign a value first: mock.nonExistentProperty = ...'
    );
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const adapter = createAdapter();
      const original: CapacitorAdapterOriginal = adapter.asOriginalType__();
      expect(original).toBe(adapter);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const adapter = createAdapter();
      const mock = CapacitorAdapter.fromOriginalType__(adapter.asOriginalType__());
      expect(mock).toBe(adapter);
    });
  });

  describe('getFullPath', () => {
    it('should return base path joined with normalized path', () => {
      const adapter = createAdapter();
      expect(adapter.getFullPath('notes/file.md')).toBe('/mock-vault/notes/file.md');
    });

    it('should handle empty normalized path', () => {
      const adapter = createAdapter();
      expect(adapter.getFullPath('')).toBe('/mock-vault/');
    });
  });

  describe('inherited InMemoryAdapter methods', () => {
    it('should write and read text files', async () => {
      const adapter = createAdapter();
      await adapter.write('test.md', 'hello');
      const content = await adapter.read('test.md');
      expect(content).toBe('hello');
    });

    it('should check existence of files', async () => {
      const adapter = createAdapter();
      await adapter.write('exists.md', 'data');
      expect(await adapter.exists('exists.md')).toBe(true);
      expect(await adapter.exists('missing.md')).toBe(false);
    });
  });
});
