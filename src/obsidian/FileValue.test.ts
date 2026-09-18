import {
  describe,
  expect,
  it
} from 'vitest';

import { TagsListValue } from '../internal/tags-list-value.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { DateValue } from './DateValue.ts';
import { FileValue } from './FileValue.ts';
import { LinkValue } from './LinkValue.ts';
import { ListValue } from './ListValue.ts';
import { NumberValue } from './NumberValue.ts';
import { ObjectValue } from './ObjectValue.ts';
import { StringValue } from './StringValue.ts';
import { TagValue } from './TagValue.ts';
import { UrlValue } from './UrlValue.ts';

const NOTE_WITH_EVERYTHING = `---
tags:
  - alpha
  - "#beta"
homepage: "[[Target]]"
site: https://example.com
due: "2024-01-15"
---

#alpha #gamma

[[Target|Shown]] and [[Missing]]

![[Target]]
`;

describe('FileValue', () => {
  function createFileValue(): FileValue {
    const app = App.createConfigured__({
      files: {
        'folder/test.md': ''
      }
    });
    const file = ensureNonNullable(app.vault.getFileByPath('folder/test.md'));
    return new FileValue(app, file);
  }

  // `Target.md` is seeded on its own, BEFORE the notes linking to it, because the mock resolves a link
  // at index time: a link to a file that does not exist yet lands in `unresolvedLinks` for good, and a
  // single seeded map would order the three by name rather than by that dependency.
  function createLinkedVault(): App {
    const app = App.createConfigured__({
      files: {
        'Target.md': ''
      }
    });
    app.vault.createFolderSync__('folder');
    app.vault.createSync__('folder/test.md', NOTE_WITH_EVERYTHING);
    app.vault.createFolderSync__('notes');
    app.vault.createSync__('notes/Other.md', '[[Target]]');
    return app;
  }

  function createNoteValue(app: App, path: string): FileValue {
    return FileValue.create__(app, ensureNonNullable(app.vault.getFileByPath(path)));
  }

  it('should carry the file icon', () => {
    expect(createFileValue().icon).toBe('lucide-file');
  });

  it('should always be truthy', () => {
    const value = createFileValue();
    expect(value.isTruthy()).toBe(true);
  });

  describe('keys', () => {
    it('should add Obsidian\'s fifteen file keys to the inherited ones', () => {
      expect(createFileValue().keys()).toEqual([
        'file',
        'name',
        'basename',
        'fullname',
        'path',
        'folder',
        'ext',
        'ctime',
        'mtime',
        'size',
        'links',
        'embeds',
        'backlinks',
        'tags',
        'properties'
      ]);
    });
  });

  describe('getLinks', () => {
    it('should list the frontmatter links, then the body links, then the embeds', () => {
      const value = createNoteValue(createLinkedVault(), 'folder/test.md');
      const links = value.getLinks();
      expect(links).toBeInstanceOf(ListValue);
      // Every wikilink carries display text in the cache even with no `|` — its own target, or the target
      // with each `#` shown as a ` > ` — so a plain `[[Target]]` round-trips as `[[Target|Target]]`
      // wherever it was written, frontmatter included.
      expect(links.data.map(String)).toEqual([
        '[[Target|Target]]',
        '[[Target|Shown]]',
        '[[Missing|Missing]]',
        '[[Target|Target]]'
      ]);
    });

    it('should carry each link\'s source path so a relative target resolves', () => {
      const value = createNoteValue(createLinkedVault(), 'folder/test.md');
      const link = value.getLinks().get(0);
      expect(link).toBeInstanceOf(LinkValue);
      expect((link as LinkValue).sourcePath).toBe('folder/test.md');
    });

    it('should list a link that resolves to nothing, unlike getBacklinks', () => {
      const value = createNoteValue(createLinkedVault(), 'folder/test.md');
      expect(value.getLinks().data.map(String)).toContain('[[Missing|Missing]]');
    });

    it('should give a file with no references an empty list', () => {
      expect(createFileValue().getLinks().data).toEqual([]);
    });

    it('should answer the same list every time', () => {
      const value = createNoteValue(createLinkedVault(), 'folder/test.md');
      expect(value.getLinks()).toBe(value.getLinks());
    });

    it('should print a reference carrying no display text bare', () => {
      // Nothing the parser produces lacks display text any more, so a reference without it reaches
      // `getLinks` only through a hand-supplied cache — which is what `setCache__` is for.
      const app = App.createConfigured__({
        files: {
          'Target.md': ''
        }
      });
      app.vault.createFolderSync__('folder');
      app.vault.createSync__('folder/test.md', '');
      app.metadataCache.setCache__('folder/test.md', {
        frontmatterLinks: [{ key: 'related', link: 'Target', original: '[[Target]]' }]
      });

      expect(createNoteValue(app, 'folder/test.md').getLinks().data.map(String)).toEqual(['[[Target]]']);
    });
  });

  describe('getEmbeds', () => {
    it('should list only the embeds', () => {
      const value = createNoteValue(createLinkedVault(), 'folder/test.md');
      const embeds = value.getEmbeds();
      expect(embeds).toBeInstanceOf(ListValue);
      expect(embeds.data.map(String)).toEqual(['[[Target|Target]]']);
    });

    it('should give a file with no embeds an empty list', () => {
      expect(createFileValue().getEmbeds().data).toEqual([]);
    });

    it('should answer the same list every time', () => {
      const value = createNoteValue(createLinkedVault(), 'folder/test.md');
      expect(value.getEmbeds()).toBe(value.getEmbeds());
    });
  });

  describe('getBacklinks', () => {
    it('should list one link per note linking here, shown by its short name', () => {
      const value = createNoteValue(createLinkedVault(), 'Target.md');
      const backlinks = value.getBacklinks();
      expect(backlinks).toBeInstanceOf(ListValue);
      expect(backlinks.data.map(String)).toEqual([
        '[[folder/test.md|test]]',
        '[[notes/Other.md|Other]]'
      ]);
    });

    it('should target the source note\'s path with an empty source path', () => {
      const value = createNoteValue(createLinkedVault(), 'Target.md');
      const backlink = value.getBacklinks().get(0) as LinkValue;
      expect(backlink.data).toBe('folder/test.md');
      expect(backlink.sourcePath).toBe('');
    });

    it('should keep a non-markdown source\'s extension in the display text', () => {
      const app = App.createConfigured__({
        files: {
          'Target.md': ''
        }
      });
      app.metadataCache.resolvedLinks['drawing.canvas'] = { 'Target.md': 1 };
      expect(createNoteValue(app, 'Target.md').getBacklinks().data.map(String)).toEqual([
        '[[drawing.canvas|drawing.canvas]]'
      ]);
    });

    it('should list a note linking here twice only once', () => {
      const app = App.createConfigured__({
        files: {
          'Target.md': '',
          'Twice.md': '[[Target]] and [[Target]] again'
        }
      });
      expect(createNoteValue(app, 'Target.md').getBacklinks().data.map(String)).toEqual(['[[Twice.md|Twice]]']);
    });

    it('should give a file nothing links to an empty list', () => {
      expect(createFileValue().getBacklinks().data).toEqual([]);
    });

    it('should answer the same list every time', () => {
      const value = createNoteValue(createLinkedVault(), 'Target.md');
      expect(value.getBacklinks()).toBe(value.getBacklinks());
    });
  });

  describe('getTags', () => {
    it('should list the body tags then the frontmatter tags, without duplicates', () => {
      const value = createNoteValue(createLinkedVault(), 'folder/test.md');
      const tags = value.getTags();
      expect(tags).toBeInstanceOf(ListValue);
      expect(tags.data.map(String)).toEqual(['#alpha', '#gamma', '#beta']);
      expect(tags.get(0)).toBeInstanceOf(TagValue);
    });

    it('should give a file with no tags an empty list', () => {
      expect(createFileValue().getTags().data).toEqual([]);
    });

    it('should give a file whose frontmatter is not an object an empty list', () => {
      const app = App.createConfigured__({
        files: {
          'scalar.md': '---\njust a string\n---\nBody'
        }
      });
      expect(createNoteValue(app, 'scalar.md').getTags().data).toEqual([]);
    });

    it('should answer the tag list, not a plain one, so a nested tag answers for its parent', () => {
      const app = App.createConfigured__({
        files: {
          'nested.md': '---\ntags: [parent/child]\n---\nBody'
        }
      });
      const tags = createNoteValue(app, 'nested.md').getTags();
      expect(tags).toBeInstanceOf(TagsListValue);
      expect(tags.includes(new TagValue('#parent'))).toBe(true);
    });

    it('should answer the same list every time', () => {
      const value = createNoteValue(createLinkedVault(), 'folder/test.md');
      expect(value.getTags()).toBe(value.getTags());
    });
  });

  describe('getProps', () => {
    it('should wrap the frontmatter, reading its strings as links, URLs and dates', () => {
      const value = createNoteValue(createLinkedVault(), 'folder/test.md');
      const props = value.getProps();
      expect(props).toBeInstanceOf(ObjectValue);
      expect(props.get('homepage')).toBeInstanceOf(LinkValue);
      expect(props.get('site')).toBeInstanceOf(UrlValue);
      expect(props.get('due')).toBeInstanceOf(DateValue);
      expect(props.get('tags').toString()).toBe('#alpha, #beta');
    });

    it('should copy the frontmatter, so evaluating a property never writes into the metadata cache', () => {
      const app = createLinkedVault();
      const value = createNoteValue(app, 'folder/test.md');
      value.getProps().get('site');
      const cached = ensureNonNullable(app.metadataCache.getFileCache(value.file));
      expect(ensureNonNullable(cached.frontmatter)['site']).toBe('https://example.com');
    });

    it('should give a file with no frontmatter an empty object', () => {
      expect(createFileValue().getProps().isEmpty()).toBe(true);
    });

    it('should answer the same object every time', () => {
      const value = createNoteValue(createLinkedVault(), 'folder/test.md');
      expect(value.getProps()).toBe(value.getProps());
    });
  });

  describe('equals', () => {
    it('should compare the wrapped file by identity', () => {
      const app = App.createConfigured__({
        files: {
          'a.md': '',
          'b.md': ''
        }
      });
      const value = createNoteValue(app, 'a.md');
      expect(value.equals(createNoteValue(app, 'a.md'))).toBe(true);
      expect(value.equals(createNoteValue(app, 'b.md'))).toBe(false);
    });
  });

  describe('looseEquals', () => {
    it('should answer a string value holding the full path of the file', () => {
      const value = createFileValue();
      expect(value.looseEquals(new StringValue('folder/test.md'))).toBe(true);
      expect(value.looseEquals(new StringValue('test.md'))).toBe(false);
    });

    it('should answer nothing else from this side', () => {
      expect(createFileValue().looseEquals(NumberValue.create__(0))).toBe(false);
    });
  });

  describe('objectAccess', () => {
    it('should answer itself for file', () => {
      const value = createFileValue();
      expect(value.objectAccess('file')).toBe(value);
    });

    it('should answer the file\'s names, path, folder and extension', () => {
      const value = createFileValue();
      expect(value.objectAccess('name')?.toString()).toBe('test');
      expect(value.objectAccess('basename')?.toString()).toBe('test');
      expect(value.objectAccess('fullname')?.toString()).toBe('test.md');
      expect(value.objectAccess('path')?.toString()).toBe('folder/test.md');
      expect(value.objectAccess('folder')?.toString()).toBe('folder');
      expect(value.objectAccess('ext')?.toString()).toBe('md');
    });

    it('should answer the file\'s stats as dates and a number', () => {
      const value = createFileValue();
      const stat = { ctime: 1_700_000_000_000, mtime: 1_800_000_000_000, size: 42 };
      value.file.stat = stat;
      expect(value.objectAccess('ctime')).toBeInstanceOf(DateValue);
      expect(value.objectAccess('ctime')?.toString()).toBe(DateValue.create__(new Date(stat.ctime)).toString());
      expect(value.objectAccess('mtime')?.toString()).toBe(DateValue.create__(new Date(stat.mtime)).toString());
      expect(value.objectAccess('size')).toBeInstanceOf(NumberValue);
      expect(value.objectAccess('size')?.toString()).toBe('42');
    });

    it('should ignore the key\'s case', () => {
      expect(createFileValue().objectAccess('BASENAME')?.toString()).toBe('test');
    });

    it('should route the five link, tag and property keys to their accessors', () => {
      const value = createNoteValue(createLinkedVault(), 'folder/test.md');
      expect(value.objectAccess('links')).toBe(value.getLinks());
      expect(value.objectAccess('embeds')).toBe(value.getEmbeds());
      expect(value.objectAccess('backlinks')).toBe(value.getBacklinks());
      expect(value.objectAccess('tags')).toBe(value.getTags());
      expect(value.objectAccess('properties')).toBe(value.getProps());
    });

    it('should answer null for any other key', () => {
      expect(createFileValue().objectAccess('created')).toBeNull();
    });

    it('should throw for folder when the file has no parent', () => {
      const value = createFileValue();
      value.file.parent = null;
      expect(() => value.objectAccess('folder')).toThrow('The file has no parent folder.');
    });
  });

  it('should render as the file path', () => {
    const value = createFileValue();
    expect(String(value)).toBe('folder/test.md');
  });

  describe('create__', () => {
    it('should create an instance that keeps the app and the file', () => {
      const app = App.createConfigured__({
        files: {
          'test.md': ''
        }
      });
      const file = ensureNonNullable(app.vault.getFileByPath('test.md'));
      const value = FileValue.create__(app, file);
      expect(value).toBeInstanceOf(FileValue);
      expect(value.app).toBe(app);
      expect(value.file).toBe(file);
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance', () => {
      const value = createFileValue();
      const original = value.asOriginalType3__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = createFileValue();
      const mock = FileValue.fromOriginalType3__(value.asOriginalType3__());
      expect(mock).toBe(value);
    });
  });
});
