import type { MetadataCache as MetadataCacheOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { noopAsync } from '../internal/noop.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { MetadataCache } from './MetadataCache.ts';

const MICROTASK_FLUSH_COUNT = 5;
const HEADING_COUNT_2 = 2;
const EVENT_ARG_INDEX_CACHE = 2;
const ZERO_POSITION = { end: { col: 0, line: 0, offset: 0 }, start: { col: 0, line: 0, offset: 0 } };

/**
 * Flushes multiple microtask ticks to allow async event handlers to complete.
 * The vault event triggers an async read + parse chain that needs several ticks.
 */
async function flushMicrotasks(): Promise<void> {
  for (let index = 0; index < MICROTASK_FLUSH_COUNT; index++) {
    await noopAsync();
  }
}

describe('MetadataCache', () => {
  describe('auto-parse on vault create', () => {
    it('should populate cache when a markdown file is created', async () => {
      const app = App.createConfigured__();
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
      const app = App.createConfigured__();
      const file = await app.vault.create('data.json', '{"key": "value"}');

      await flushMicrotasks();

      const cache = app.metadataCache.getFileCache(file);
      expect(cache).toBeNull();
    });

    it('should populate cache when the frontmatter is invalid YAML', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('bad.md', '---\nkey: [unclosed\n---\n# Heading');

      const cache = app.metadataCache.getFileCache(file);
      expect(cache).not.toBeNull();
      expect(cache?.frontmatter).toBeUndefined();
      expect(cache?.frontmatterPosition).toBeUndefined();
      expect(cache?.headings?.[0]?.heading).toBe('Heading');
    });

    it('should populate cache synchronously (no tick needed)', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('sync.md', '# Sync');

      const cache = app.metadataCache.getFileCache(file);
      expect(cache?.headings?.[0]?.heading).toBe('Sync');
    });
  });

  describe('auto-parse on vault modify', () => {
    it('should update cache when a markdown file is modified', async () => {
      const app = App.createConfigured__();
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
      const app = App.createConfigured__();
      let isEventFired = false;
      let receivedFile: unknown = null;
      let receivedContent: unknown = null;
      let receivedCache: unknown = null;

      app.metadataCache.on('changed', (...$arguments: unknown[]) => {
        isEventFired = true;
        receivedFile = $arguments[0];
        receivedContent = $arguments[1];
        receivedCache = $arguments[EVENT_ARG_INDEX_CACHE];
      });

      const file = await app.vault.create('test.md', '# Test');
      await flushMicrotasks();

      expect(isEventFired).toBe(true);
      expect(receivedFile).toBe(file);
      expect(receivedContent).toBe('# Test');
      expect(receivedCache).toBeDefined();
    });
  });

  describe('setCache__', () => {
    it('should allow manual cache override', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('note.md', '# Auto');

      const manualCache = {
        headings: [{ heading: 'Manual', level: 1, position: ZERO_POSITION }]
      };
      app.metadataCache.setCache__(file.path, manualCache);

      const cache = app.metadataCache.getCache(file.path);
      expect(cache?.headings?.[0]?.heading).toBe('Manual');
    });

    it('should fire changed with the file, its content, and the cache', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('note.md', '# Auto');

      let receivedFile: unknown = null;
      let receivedContent: unknown = null;
      let receivedCache: unknown = null;
      app.metadataCache.on('changed', (...$arguments: unknown[]) => {
        receivedFile = $arguments[0];
        receivedContent = $arguments[1];
        receivedCache = $arguments[EVENT_ARG_INDEX_CACHE];
      });

      const manualCache = { headings: [{ heading: 'Manual', level: 1, position: ZERO_POSITION }] };
      app.metadataCache.setCache__(file.path, manualCache);

      expect(receivedFile).toBe(file);
      expect(receivedContent).toBe('# Auto');
      expect(receivedCache).toBe(manualCache);
    });

    it('should refresh the link graph from the overridden cache', () => {
      const app = App.createConfigured__();
      app.vault.createSync__('target.md', '# Target');
      const source = app.vault.createSync__('source.md', 'No links here');

      expect(app.metadataCache.resolvedLinks['source.md']).toEqual({});

      app.metadataCache.setCache__(source.path, {
        links: [
          { link: 'target', original: '[[target]]', position: ZERO_POSITION },
          { link: 'missing', original: '[[missing]]', position: ZERO_POSITION }
        ]
      });

      expect(app.metadataCache.resolvedLinks['source.md']).toEqual({ 'target.md': 1 });
      expect(app.metadataCache.unresolvedLinks['source.md']).toEqual({ missing: 1 });
    });

    it('should refresh the content-hash lookup so getCacheSafe sees the override', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('note.md', '# Auto');

      const manualCache = { headings: [{ heading: 'Manual', level: 1, position: ZERO_POSITION }] };
      app.metadataCache.setCache__(file.path, manualCache);

      const hash = app.metadataCache.fileCache[file.path]?.hash ?? '';
      expect(app.metadataCache.metadataCache[hash]).toBe(manualCache);
    });

    it('should throw when no file exists at the path', () => {
      const app = App.createConfigured__();

      expect(() => {
        app.metadataCache.setCache__('nonexistent.md', {});
      }).toThrow(new TypeError('setCache__ requires a file in the vault at "nonexistent.md"'));
    });
  });

  describe('frontmatter parsing', () => {
    it('should parse frontmatter on file creation', async () => {
      const app = App.createConfigured__();
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
      const app = App.createConfigured__();
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
    it('should omit the md extension by default', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('note.md', '');
      await flushMicrotasks();
      expect(app.metadataCache.fileToLinktext(file, '')).toBe('note');
    });

    it('should keep the md extension when omitMdExtension is false', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('note.md', '');
      await flushMicrotasks();
      expect(app.metadataCache.fileToLinktext(file, '', false)).toBe('note.md');
    });

    it('should fall back to the full path when the name is not unique', () => {
      const app = App.createConfigured__({ files: { 'a/note.md': '', 'b/note.md': '' } });
      const file = ensureNonNullable(app.vault.getFileByPath('a/note.md'));
      expect(app.metadataCache.fileToLinktext(file, '')).toBe('a/note');
      expect(app.metadataCache.fileToLinktext(file, '', false)).toBe('a/note.md');
    });

    it('should match names case-insensitively when checking uniqueness', () => {
      const app = App.createConfigured__({ files: { 'a/Note.md': '', 'b/note.md': '' } });
      const file = ensureNonNullable(app.vault.getFileByPath('a/Note.md'));
      expect(app.metadataCache.fileToLinktext(file, '')).toBe('a/Note');
    });

    it('should use the name of a root-level file even when the name is not unique', () => {
      const app = App.createConfigured__({ files: { 'folder/note.md': '', 'note.md': '' } });
      const rootFile = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const nestedFile = ensureNonNullable(app.vault.getFileByPath('folder/note.md'));
      expect(app.metadataCache.fileToLinktext(rootFile, '')).toBe('note');
      expect(app.metadataCache.fileToLinktext(nestedFile, '')).toBe('folder/note');
    });

    it('should use the full path of a non-markdown file whose name is not unique', () => {
      const app = App.createConfigured__({ files: { 'a/data.json': '{}', 'b/data.json': '{}' } });
      const file = ensureNonNullable(app.vault.getFileByPath('a/data.json'));
      expect(app.metadataCache.fileToLinktext(file, '')).toBe('a/data.json');
    });

    it('should resolve a dotted markdown basename through its md name', () => {
      const app = App.createConfigured__({ files: { 'folder/v1.2.md': '' } });
      const file = ensureNonNullable(app.vault.getFileByPath('folder/v1.2.md'));
      expect(app.metadataCache.fileToLinktext(file, '')).toBe('v1.2');
    });

    it('should use the full path when the name holds a subpath marker', () => {
      const app = App.createConfigured__({ files: { 'folder/a#b.md': '' } });
      const file = ensureNonNullable(app.vault.getFileByPath('folder/a#b.md'));
      expect(app.metadataCache.fileToLinktext(file, '')).toBe('folder/a#b');
    });

    it('should return the full path when newLinkFormat is absolute', () => {
      const app = App.createConfigured__({ files: { 'folder/note.md': '' } });
      app.vault.setConfig('newLinkFormat', 'absolute');
      const file = ensureNonNullable(app.vault.getFileByPath('folder/note.md'));
      expect(app.metadataCache.fileToLinktext(file, 'other.md')).toBe('folder/note');
    });

    it('should return a path relative to the source note when newLinkFormat is relative', () => {
      const app = App.createConfigured__({ files: { 'a/b/note.md': '', 'a/c/source.md': '', 'root.md': '' } });
      app.vault.setConfig('newLinkFormat', 'relative');
      const note = ensureNonNullable(app.vault.getFileByPath('a/b/note.md'));
      const root = ensureNonNullable(app.vault.getFileByPath('root.md'));
      expect(app.metadataCache.fileToLinktext(note, 'a/c/source.md')).toBe('../b/note');
      expect(app.metadataCache.fileToLinktext(note, 'a/b/source.md')).toBe('note');
      expect(app.metadataCache.fileToLinktext(root, 'a/c/source.md')).toBe('../../root');
      expect(app.metadataCache.fileToLinktext(note, 'source.md')).toBe('a/b/note');
    });

    it('should return basename when omitMdExtension is true for md files', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('note.md', '');
      await flushMicrotasks();
      expect(app.metadataCache.fileToLinktext(file, '', true)).toBe('note');
    });

    it('should return file name when omitMdExtension is true for non-md files', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('data.json', '{}');
      await flushMicrotasks();
      expect(app.metadataCache.fileToLinktext(file, '', true)).toBe('data.json');
    });
  });

  describe('getFirstLinkpathDest', () => {
    it('should find file by exact path', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('note.md', '');
      await flushMicrotasks();
      const found = app.metadataCache.getFirstLinkpathDest('note.md', '');
      expect(found).toBe(file);
    });

    it('should find file by path with .md appended', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('note.md', '');
      await flushMicrotasks();
      const found = app.metadataCache.getFirstLinkpathDest('note', '');
      expect(found).toBe(file);
    });

    it('should find file by basename', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('folder/note.md', '');
      await flushMicrotasks();
      const found = app.metadataCache.getFirstLinkpathDest('note', '');
      expect(found).toBe(file);
    });

    it('should return null when file is not found', () => {
      const app = App.createConfigured__();
      const found = app.metadataCache.getFirstLinkpathDest('nonexistent', '');
      expect(found).toBeNull();
    });
  });

  describe('getCache', () => {
    it('should return null for unknown path', () => {
      const app = App.createConfigured__();
      expect(app.metadataCache.getCache('unknown.md')).toBeNull();
    });
  });

  describe('getFileCache', () => {
    it('should return null for file with no cache', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('data.txt', 'hello');
      await flushMicrotasks();
      expect(app.metadataCache.getFileCache(file)).toBeNull();
    });
  });

  describe('isSupportedFile', () => {
    it('should support a file whose extension opens in a registered view', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('note.md', '');
      expect(app.metadataCache.isSupportedFile(file)).toBe(true);
    });

    it('should not support a file whose extension no view is registered for', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('board.canvas', '{}');
      expect(app.metadataCache.isSupportedFile(file)).toBe(false);
    });

    it('should support a file once a view is registered for its extension', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('board.canvas', '{}');
      app.viewRegistry.registerExtensions(['canvas'], 'markdown');
      expect(app.metadataCache.isSupportedFile(file)).toBe(true);
    });

    it('should support every file when showUnsupportedFiles is on', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('data.xyz', '');
      app.vault.setConfig('showUnsupportedFiles', true);
      expect(app.metadataCache.isSupportedFile(file)).toBe(true);
    });
  });

  describe('iterateRefsForFile', () => {
    const NOTE_WITH_EVERY_REFERENCE_KIND = `---
homepage: "[[Fm]]"
---

[[Body]]

![[Embed]]
`;

    function createIndexedApp(): App {
      const app = App.createConfigured__();
      app.vault.createSync__('note.md', NOTE_WITH_EVERY_REFERENCE_KIND);
      return app;
    }

    function collectLinks(app: App, stopAt?: string): string[] {
      const links: string[] = [];
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      app.metadataCache.iterateRefsForFile(file, (reference) => {
        links.push(reference.link);
        return reference.link === stopAt;
      });
      return links;
    }

    it('should walk the frontmatter links, then the body links, then the embeds', () => {
      expect(collectLinks(createIndexedApp())).toEqual(['Fm', 'Body', 'Embed']);
    });

    it('should stop inside the frontmatter links when the callback answers true', () => {
      expect(collectLinks(createIndexedApp(), 'Fm')).toEqual(['Fm']);
    });

    it('should stop inside the body links when the callback answers true', () => {
      expect(collectLinks(createIndexedApp(), 'Body')).toEqual(['Fm', 'Body']);
    });

    it('should keep walking when the callback answers nothing', () => {
      const app = createIndexedApp();
      const links: string[] = [];
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      app.metadataCache.iterateRefsForFile(file, (reference) => {
        links.push(reference.link);
      });
      expect(links).toEqual(['Fm', 'Body', 'Embed']);
    });

    it('should walk a cache carrying only one of the three groups', () => {
      const app = App.createConfigured__();
      app.vault.createSync__('note.md', '');
      app.metadataCache.setCache__('note.md', {
        links: [{ displayText: 'Only', link: 'Only', original: '[[Only]]', position: ZERO_POSITION }]
      });
      expect(collectLinks(app)).toEqual(['Only']);
    });

    it('should yield nothing for an unindexed file', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('data.txt', 'hello');
      const links: string[] = [];
      app.metadataCache.iterateRefsForFile(file, (reference) => {
        links.push(reference.link);
      });
      expect(links).toEqual([]);
    });
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const original: MetadataCacheOriginal = app.metadataCache.asOriginalType2__();
      expect(original).toBe(app.metadataCache);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const mock = MetadataCache.fromOriginalType2__(app.metadataCache.asOriginalType2__());
      expect(mock).toBe(app.metadataCache);
    });
  });

  describe('parseFileMetadata', () => {
    it('should not parse non-TFile objects', async () => {
      const app = App.createConfigured__();
      // Trigger the vault create event with a non-TFile object
      app.vault.trigger('create', { path: 'fake.md' });
      await flushMicrotasks();
      expect(app.metadataCache.getCache('fake.md')).toBeNull();
    });

    it('should skip indexing when the file was removed before parsing', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('will-remove.md', '# Title');

      // Remove the file from the adapter so a synchronous read fails.
      await app.vault.adapter.remove(file.path);

      // Re-triggering modify must not throw; indexing is skipped gracefully.
      expect(() => {
        app.vault.trigger('modify', file);
      }).not.toThrow();
    });
  });

  describe('resolvedLinks / unresolvedLinks', () => {
    it('should populate resolvedLinks for a resolvable wikilink', () => {
      const app = App.createConfigured__();
      app.vault.createSync__('target.md', '# Target');
      app.vault.createSync__('source.md', 'See [[target]]');

      expect(app.metadataCache.resolvedLinks['source.md']).toEqual({ 'target.md': 1 });
      expect(app.metadataCache.unresolvedLinks['source.md']).toEqual({});
    });

    it('should populate unresolvedLinks for a missing target', () => {
      const app = App.createConfigured__();
      app.vault.createSync__('source.md', 'See [[missing]]');

      expect(app.metadataCache.resolvedLinks['source.md']).toEqual({});
      expect(app.metadataCache.unresolvedLinks['source.md']).toEqual({ missing: 1 });
    });

    it('should count duplicate links', () => {
      const app = App.createConfigured__();
      app.vault.createSync__('target.md', '# Target');
      app.vault.createSync__('source.md', '[[target]] and [[target]] again');

      expect(app.metadataCache.resolvedLinks['source.md']).toEqual({ 'target.md': 2 });
    });

    it('should ignore pure heading links', () => {
      const app = App.createConfigured__();
      app.vault.createSync__('source.md', 'Jump to [[#Section]]');

      expect(app.metadataCache.resolvedLinks['source.md']).toEqual({});
      expect(app.metadataCache.unresolvedLinks['source.md']).toEqual({});
    });

    it('should resolve embeds', () => {
      const app = App.createConfigured__();
      app.vault.createSync__('img.md', '# Img');
      app.vault.createSync__('source.md', '![[img]]');

      expect(app.metadataCache.resolvedLinks['source.md']).toEqual({ 'img.md': 1 });
    });

    it('should resolve frontmatter links', () => {
      const app = App.createConfigured__();
      app.vault.createSync__('target.md', '# Target');
      app.vault.createSync__('source.md', '---\nrel: "[[target]]"\n---\nBody');

      expect(app.metadataCache.resolvedLinks['source.md']).toEqual({ 'target.md': 1 });
    });
  });

  describe('constructor2__', () => {
    it('should be callable without throwing', () => {
      const app = App.createConfigured__();
      expect(() => {
        app.metadataCache.constructor2__(app, app.vault);
      }).not.toThrow();
    });
  });

  describe('getFirstLinkpathDest by file name', () => {
    it('should find file by its full name including extension', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('folder/report.txt', '');
      await flushMicrotasks();
      const found = app.metadataCache.getFirstLinkpathDest('report.txt', '');
      expect(found).toBe(file);
    });

    it('should find file by f.name when basename does not match', async () => {
      const app = App.createConfigured__();
      await app.vault.create('folder/other.md', '');
      const file = await app.vault.create('folder/test.md', '');
      await flushMicrotasks();
      // Skips 'other.md' (neither basename nor name match),
      // then matches via f.name (basename is 'test', not 'test.md')
      const found = app.metadataCache.getFirstLinkpathDest('test.md', '');
      expect(found).toBe(file);
    });
  });
  describe('computeMetadataAsync', () => {
    it('should resolve rather than reject when the frontmatter is invalid YAML', async () => {
      const app = App.createConfigured__();
      const arrayBuffer = new TextEncoder().encode('---\nkey: [unclosed\n---\nBody').buffer;

      const cache = await app.metadataCache.computeMetadataAsync(arrayBuffer);

      expect(cache.frontmatter).toBeUndefined();
      expect(cache.sections?.find((section) => section.type === 'yaml')).toBeDefined();
    });

    it('should parse metadata from an ArrayBuffer', async () => {
      const app = App.createConfigured__();
      const arrayBuffer = new TextEncoder().encode('# Heading').buffer;

      const cache = await app.metadataCache.computeMetadataAsync(arrayBuffer);

      expect(cache.headings?.[0]?.heading).toBe('Heading');
    });
  });
});
