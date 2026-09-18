import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ListValue } from '../obsidian/ListValue.ts';
import { NumberValue } from '../obsidian/NumberValue.ts';
import { StringValue } from '../obsidian/StringValue.ts';
import { TagValue } from '../obsidian/TagValue.ts';
import { TagsListValue } from './tags-list-value.ts';

describe('TagsListValue', () => {
  it('should be a list value', () => {
    expect(TagsListValue.create2__([])).toBeInstanceOf(ListValue);
  });

  it('should carry the tags icon where a plain list carries the list one', () => {
    expect(TagsListValue.create2__([]).icon).toBe('lucide-tags');
    expect(ListValue.create__([]).icon).toBe('lucide-list');
  });

  it('should wrap every element as a tag eagerly, before anything reads it', () => {
    const tags = TagsListValue.create2__(['alpha', '#beta']);
    expect(tags.data[0]).toBeInstanceOf(TagValue);
    expect(tags.data[1]).toBeInstanceOf(TagValue);
  });

  it('should call the construction hook', () => {
    const spy = vi.spyOn(TagsListValue.prototype, 'constructor4__');
    TagsListValue.create2__(['alpha']);
    expect(spy).toHaveBeenCalledWith(['alpha']);
  });

  describe('includes', () => {
    it('should find a tag the list holds', () => {
      expect(TagsListValue.create2__(['alpha', 'beta']).includes(new TagValue('#beta'))).toBe(true);
    });

    it('should find a PARENT of a tag the list holds, which a plain list does not', () => {
      const raw = ['parent/child'];
      expect(TagsListValue.create2__(raw).includes(new TagValue('#parent'))).toBe(true);
      expect(ListValue.create__(raw.map((tag) => TagValue.create2__(tag))).includes(new TagValue('#parent'))).toBe(false);
    });

    it('should accept a plain string value as the tag to look for', () => {
      expect(TagsListValue.create2__(['parent/child']).includes(new StringValue('parent'))).toBe(true);
    });

    it('should answer false when nothing matches', () => {
      expect(TagsListValue.create2__(['alpha']).includes(new TagValue('#beta'))).toBe(false);
      expect(TagsListValue.create2__(['alpha']).includes(new NumberValue(1))).toBe(false);
      expect(TagsListValue.create2__([]).includes(new TagValue('#alpha'))).toBe(false);
    });
  });
});
