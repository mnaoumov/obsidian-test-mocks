import {
  describe,
  expect,
  it
} from 'vitest';

import { createMockApp } from '../../src/helpers/createMockApp.ts';

const MICROTASK_FLUSH_COUNT = 5;
const HEADING_COUNT_2 = 2;
const EVENT_ARG_INDEX_CACHE = 2;

/**
 * Flushes multiple microtask ticks to allow async event handlers to complete.
 * The vault event triggers an async read + parse chain that needs several ticks.
 */
async function flushMicrotasks(): Promise<void> {
  for (let i = 0; i < MICROTASK_FLUSH_COUNT; i++) {
    await Promise.resolve();
  }
}

describe('MetadataCache', () => {
  describe('auto-parse on vault create', () => {
    it('should populate cache when a markdown file is created', async () => {
      const app = await createMockApp();
      const file = await app.vault.create('note.md', '# Hello\n\nSome text with #tag1');

      // Wait for the async cache population
      await flushMicrotasks();

      const cache = app.metadataCache.getFileCache(file);
      expect(cache).not.toBeNull();
      expect(cache?.headings).toHaveLength(1);
      expect(cache?.headings?.[0]?.heading).toBe('Hello');
      expect(cache?.tags).toHaveLength(1);
      expect(cache?.tags?.[0]?.tag).toBe('#tag1');
    });

    it('should not populate cache for non-markdown files', async () => {
      const app = await createMockApp();
      const file = await app.vault.create('data.json', '{"key": "value"}');

      await flushMicrotasks();

      const cache = app.metadataCache.getFileCache(file);
      expect(cache).toBeNull();
    });
  });

  describe('auto-parse on vault modify', () => {
    it('should update cache when a markdown file is modified', async () => {
      const app = await createMockApp();
      const file = await app.vault.create('note.md', '# Old Title');
      await flushMicrotasks();

      await app.vault.modify(file, '# New Title\n## Subtitle');
      await flushMicrotasks();

      const cache = app.metadataCache.getFileCache(file);
      expect(cache?.headings).toHaveLength(HEADING_COUNT_2);
      expect(cache?.headings?.[0]?.heading).toBe('New Title');
      expect(cache?.headings?.[1]?.heading).toBe('Subtitle');
    });
  });

  describe('changed event', () => {
    it('should fire changed event with file, content, and cache', async () => {
      const app = await createMockApp();
      let eventFired = false;
      let receivedFile: unknown = null;
      let receivedContent: unknown = null;
      let receivedCache: unknown = null;

      app.metadataCache.on('changed', (...args: unknown[]) => {
        eventFired = true;
        receivedFile = args[0];
        receivedContent = args[1];
        receivedCache = args[EVENT_ARG_INDEX_CACHE];
      });

      const file = await app.vault.create('test.md', '# Test');
      await flushMicrotasks();

      expect(eventFired).toBe(true);
      expect(receivedFile).toBe(file);
      expect(receivedContent).toBe('# Test');
      expect(receivedCache).toBeDefined();
    });
  });

  describe('_setCache', () => {
    it('should allow manual cache override', async () => {
      const app = await createMockApp();
      const file = await app.vault.create('note.md', '# Auto');
      await flushMicrotasks();

      const manualCache = {
        headings: [{ heading: 'Manual', level: 1, position: { end: { col: 0, line: 0, offset: 0 }, start: { col: 0, line: 0, offset: 0 } } }]
      };
      app.metadataCache._setCache(file.path, manualCache);

      const cache = app.metadataCache.getCache(file.path);
      expect(cache?.headings?.[0]?.heading).toBe('Manual');
    });
  });

  describe('frontmatter parsing', () => {
    it('should parse frontmatter on file creation', async () => {
      const app = await createMockApp();
      const content = '---\ntitle: My Note\ntags: [a, b]\n---\n\nBody';
      const file = await app.vault.create('note.md', content);
      await flushMicrotasks();

      const cache = app.metadataCache.getFileCache(file);
      expect(cache?.frontmatter?.['title']).toBe('My Note');
      expect(cache?.frontmatter?.['tags']).toEqual(['a', 'b']);
      expect(cache?.frontmatterPosition).toBeDefined();
    });
  });

  describe('links and embeds', () => {
    it('should parse wikilinks and embeds', async () => {
      const app = await createMockApp();
      const content = 'See [[Page]] and ![[image.png]]';
      const file = await app.vault.create('note.md', content);
      await flushMicrotasks();

      const cache = app.metadataCache.getFileCache(file);
      expect(cache?.links).toHaveLength(1);
      expect(cache?.links?.[0]?.link).toBe('Page');
      expect(cache?.embeds).toHaveLength(1);
      expect(cache?.embeds?.[0]?.link).toBe('image.png');
    });
  });
});
