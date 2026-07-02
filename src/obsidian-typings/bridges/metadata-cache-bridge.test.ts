import type { CachedMetadata } from 'obsidian';

import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import type { FileCacheEntry } from '../../internal/types.ts';

import {
  ensureGenericObject,
  ensureNonNullable
} from '../../internal/type-guards.ts';
import { App } from '../../obsidian/App.ts';
import { MetadataCache } from '../../obsidian/MetadataCache.ts';
import {
  bridgeMetadataCache,
  unbridgeMetadataCache
} from './metadata-cache-bridge.ts';

type ComputeMetadataAsyncFn = (this: MetadataCache, arrayBuffer: ArrayBuffer) => Promise<CachedMetadata>;

function toArrayBuffer(text: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(text);
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

describe('metadata-cache-bridge', () => {
  afterEach(() => {
    unbridgeMetadataCache();
  });

  describe('fileCache', () => {
    it('should expose the internal file cache record', () => {
      bridgeMetadataCache();
      const app = App.createConfigured__();
      app.vault.createSync__('note.md', '# Title');
      const fileCache = ensureGenericObject(app.metadataCache)['fileCache'] as Record<string, FileCacheEntry>;

      expect(fileCache['note.md']).toBeDefined();
      expect(typeof fileCache['note.md']?.hash).toBe('string');
    });
  });

  describe('metadataCache', () => {
    it('should map the file hash to its parsed metadata', () => {
      bridgeMetadataCache();
      const app = App.createConfigured__();
      app.vault.createSync__('note.md', '# Title');
      const record = ensureGenericObject(app.metadataCache);
      const fileCache = record['fileCache'] as Record<string, FileCacheEntry>;
      const metadataCache = record['metadataCache'] as Record<string, CachedMetadata>;
      const hash = ensureNonNullable(fileCache['note.md']).hash;

      expect(metadataCache[hash]?.headings?.[0]?.heading).toBe('Title');
    });
  });

  describe('computeMetadataAsync', () => {
    it('should parse metadata from an ArrayBuffer', async () => {
      bridgeMetadataCache();
      const app = App.createConfigured__();
      const fn = ensureGenericObject(app.metadataCache)['computeMetadataAsync'] as ComputeMetadataAsyncFn;
      const cache = await fn.call(app.metadataCache, toArrayBuffer('# Heading'));

      expect(cache.headings?.[0]?.heading).toBe('Heading');
    });
  });

  it('should be idempotent', () => {
    bridgeMetadataCache();
    bridgeMetadataCache();
    const app = App.createConfigured__();

    expect('fileCache' in app.metadataCache).toBe(true);
  });

  it('should remove bridges on unbridge', () => {
    bridgeMetadataCache();
    unbridgeMetadataCache();
    const app = App.createConfigured__();

    expect('fileCache' in app.metadataCache).toBe(false);
    expect('metadataCache' in app.metadataCache).toBe(false);
    expect('computeMetadataAsync' in app.metadataCache).toBe(false);
  });
});
