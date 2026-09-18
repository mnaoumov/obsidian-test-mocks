import {
  describe,
  expect,
  it
} from 'vitest';

import type { Value } from '../obsidian/Value.ts';

import { App } from '../obsidian/App.ts';
import { DateValue } from '../obsidian/DateValue.ts';
import { LinkValue } from '../obsidian/LinkValue.ts';
import { ListValue } from '../obsidian/ListValue.ts';
import { NumberValue } from '../obsidian/NumberValue.ts';
import { ObjectValue } from '../obsidian/ObjectValue.ts';
import { StringValue } from '../obsidian/StringValue.ts';
import { TagValue } from '../obsidian/TagValue.ts';
import { UrlValue } from '../obsidian/UrlValue.ts';
import { createFrontMatterObjectValue } from './front-matter-object-value.ts';
import { TagsListValue } from './tags-list-value.ts';
import { ensureNonNullable } from './type-guards.ts';

describe('createFrontMatterObjectValue', () => {
  function createObjectValue(frontMatter: Record<string, unknown>): ObjectValue {
    const app = App.createConfigured__({
      files: {
        'folder/note.md': ''
      }
    });
    const file = ensureNonNullable(app.vault.getFileByPath('folder/note.md'));
    return createFrontMatterObjectValue(app, file, frontMatter);
  }

  function evaluate(frontMatter: Record<string, unknown>, key: string): Value {
    return createObjectValue(frontMatter).get(key);
  }

  it('should copy the frontmatter rather than wrap it', () => {
    const frontMatter = { title: 'Note' };
    createObjectValue(frontMatter).get('title');
    expect(frontMatter.title).toBe('Note');
  });

  describe('the tags key', () => {
    it('should read a list of strings as a list of tags, each #-prefixed by the tag constructor', () => {
      const tags = evaluate({ tags: ['alpha', '#beta'] }, 'tags');
      expect(tags).toBeInstanceOf(ListValue);
      expect((tags as ListValue).get(0)).toBeInstanceOf(TagValue);
      expect((tags as ListValue).toString()).toBe('#alpha, #beta');
    });

    it('should read a single string as a one-element list of tags', () => {
      const tags = evaluate({ tags: 'alpha' }, 'tags');
      expect(tags).toBeInstanceOf(ListValue);
      expect((tags as ListValue).toString()).toBe('#alpha');
    });

    it('should read it as the tag list, not a plain one, so a nested tag answers for its parent', () => {
      const tags = evaluate({ tags: ['parent/child'] }, 'tags');
      expect(tags).toBeInstanceOf(TagsListValue);
      expect((tags as TagsListValue).includes(new TagValue('#parent'))).toBe(true);
    });

    it('should ignore the key\'s case', () => {
      expect(evaluate({ Tags: ['alpha'] }, 'Tags')).toBeInstanceOf(ListValue);
    });

    it('should throw on a null element, which the emptiness test skipped but the wrapping does not', () => {
      expect(() => evaluate({ tags: [null, 'alpha'] }, 'tags')).toThrow(TypeError);
    });

    it('should fall back to the ordinary reading when the value is neither a string nor a string list', () => {
      expect(evaluate({ tags: 42 }, 'tags')).toBeInstanceOf(NumberValue);
      expect(evaluate({ tags: 42 }, 'tags').toString()).toBe('42');
    });
  });

  describe('a string property', () => {
    it('should be read as a link when it is wikilink syntax', () => {
      const link = evaluate({ homepage: '[[Target|Shown]]' }, 'homepage');
      expect(link).toBeInstanceOf(LinkValue);
      expect((link as LinkValue).sourcePath).toBe('folder/note.md');
    });

    it('should be read as a URL when it parses as one', () => {
      expect(evaluate({ site: 'https://example.com' }, 'site')).toBeInstanceOf(UrlValue);
    });

    it('should NOT be read as a URL when it holds a space', () => {
      expect(evaluate({ note: 'https://example.com and more' }, 'note')).toBeInstanceOf(StringValue);
    });

    it('should be read as a date when it parses as one', () => {
      expect(evaluate({ due: '2024-01-15' }, 'due')).toBeInstanceOf(DateValue);
    });

    it('should stay a string when it is none of the three', () => {
      expect(evaluate({ title: 'Just a title' }, 'title')).toBeInstanceOf(StringValue);
    });
  });

  it('should reinstall itself on a nested list, so its elements get the same readings', () => {
    const list = evaluate({ related: ['[[Target]]', 'https://example.com'] }, 'related');
    expect(list).toBeInstanceOf(ListValue);
    expect((list as ListValue).get(0)).toBeInstanceOf(LinkValue);
    expect((list as ListValue).get(1)).toBeInstanceOf(UrlValue);
  });

  it('should not read a nested list\'s element as a tag list, since its key is an index', () => {
    const list = evaluate({ tags: [['alpha']] }, 'tags');
    expect(list).toBeInstanceOf(ListValue);
    expect((list as ListValue).get(0)).toBeInstanceOf(ListValue);
  });

  it('should reinstall itself on a nested object, so its properties get the same readings', () => {
    const nested = evaluate({ meta: { homepage: '[[Target]]' } }, 'meta');
    expect(nested).toBeInstanceOf(ObjectValue);
    expect((nested as ObjectValue).get('homepage')).toBeInstanceOf(LinkValue);
  });

  it('should read a non-string property the ordinary way', () => {
    expect(evaluate({ count: 3 }, 'count').toString()).toBe('3');
  });
});
