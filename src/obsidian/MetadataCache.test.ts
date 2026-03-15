import type { MetadataCache as MetadataCacheOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from './App.ts';
import { MetadataCache } from './MetadataCache.ts';

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
      const app = await App.createConfigured__();
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
      const app = await App.createConfigured__();
      const file = await app.vault.create('data.json', '{"key": "value"}');

      await flushMicrotasks();

      const cache = app.metadataCache.getFileCache(file);
      expect(cache).toBeNull();
    });
  });

  describe('auto-parse on vault modify', () => {
    it('should update cache when a markdown file is modified', async () => {
      const app = await App.createConfigured__();
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
      const app = await App.createConfigured__();
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
      const app = await App.createConfigured__();
      const file = await app.vault.create('note.md', '# Auto');
      await flushMicrotasks();

      const manualCache = {
        headings: [{ heading: 'Manual', level: 1, position: { end: { col: 0, line: 0, offset: 0 }, start: { col: 0, line: 0, offset: 0 } } }]
      };
      app.metadataCache.setCache__(file.path, manualCache);

      const cache = app.metadataCache.getCache(file.path);
      expect(cache?.headings?.[0]?.heading).toBe('Manual');
    });
  });

  describe('frontmatter parsing', () => {
    it('should parse frontmatter on file creation', async () => {
      const app = await App.createConfigured__();
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
      const app = await App.createConfigured__();
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

  describe('fileToLinktext', () => {
    it('should return file name by default', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.create('note.md', '');
      await flushMicrotasks();
      expect(app.metadataCache.fileToLinktext(file, '')).toBe('note.md');
    });

    it('should return basename when omitMdExtension is true for md files', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.create('note.md', '');
      await flushMicrotasks();
      expect(app.metadataCache.fileToLinktext(file, '', true)).toBe('note');
    });

    it('should return file name when omitMdExtension is true for non-md files', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.create('data.json', '{}');
      await flushMicrotasks();
      expect(app.metadataCache.fileToLinktext(file, '', true)).toBe('data.json');
    });
  });

  describe('getFirstLinkpathDest', () => {
    it('should find file by exact path', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.create('note.md', '');
      await flushMicrotasks();
      const found = app.metadataCache.getFirstLinkpathDest('note.md', '');
      expect(found).toBe(file);
    });

    it('should find file by path with .md appended', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.create('note.md', '');
      await flushMicrotasks();
      const found = app.metadataCache.getFirstLinkpathDest('note', '');
      expect(found).toBe(file);
    });

    it('should find file by basename', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.create('folder/note.md', '');
      await flushMicrotasks();
      const found = app.metadataCache.getFirstLinkpathDest('note', '');
      expect(found).toBe(file);
    });

    it('should return null when file is not found', async () => {
      const app = await App.createConfigured__();
      const found = app.metadataCache.getFirstLinkpathDest('nonexistent', '');
      expect(found).toBeNull();
    });
  });

  describe('getCache', () => {
    it('should return null for unknown path', async () => {
      const app = await App.createConfigured__();
      expect(app.metadataCache.getCache('unknown.md')).toBeNull();
    });
  });

  describe('getFileCache', () => {
    it('should return null for file with no cache', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.create('data.txt', 'hello');
      await flushMicrotasks();
      expect(app.metadataCache.getFileCache(file)).toBeNull();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const original: MetadataCacheOriginal = app.metadataCache.asOriginalType__();
      expect(original).toBe(app.metadataCache);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const app = await App.createConfigured__();
      const mock = MetadataCache.fromOriginalType__(app.metadataCache.asOriginalType__());
      expect(mock).toBe(app.metadataCache);
    });
  });

  describe('parseFileMetadata', () => {
    it('should not parse non-TFile objects', async () => {
      const app = await App.createConfigured__();
      // Trigger the vault create event with a non-TFile object
      app.vault.trigger('create', { path: 'fake.md' });
      await flushMicrotasks();
      expect(app.metadataCache.getCache('fake.md')).toBeNull();
    });

    it('should catch error when file is removed before parsing', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.create('will-remove.md', '# Title');
      await flushMicrotasks();

      // Remove the file from the adapter so cachedRead will fail
      await app.vault.adapter.remove(file.path);

      // Spy on console.error to verify the catch path is hit
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- Suppressing console.error output during test.
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Trigger modify event which calls parseFileMetadata
      app.vault.trigger('modify', file);
      await flushMicrotasks();

      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe('constructor2__', () => {
    it('should be callable without throwing', async () => {
      const app = await App.createConfigured__();
      expect(() => {
        app.metadataCache.constructor2__(app, app.vault);
      }).not.toThrow();
    });
  });

  describe('getFirstLinkpathDest by file name', () => {
    it('should find file by its full name including extension', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.create('folder/report.txt', '');
      await flushMicrotasks();
      const found = app.metadataCache.getFirstLinkpathDest('report.txt', '');
      expect(found).toBe(file);
    });

    it('should find file by f.name when basename does not match', async () => {
      const app = await App.createConfigured__();
      await app.vault.create('folder/other.md', '');
      const file = await app.vault.create('folder/test.md', '');
      await flushMicrotasks();
      // Skips 'other.md' (neither basename nor name match),
      // Then matches via f.name (basename is 'test', not 'test.md')
      const found = app.metadataCache.getFirstLinkpathDest('test.md', '');
      expect(found).toBe(file);
    });
  });
});
