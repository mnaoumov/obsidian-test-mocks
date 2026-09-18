import type { TagValue as TagValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from './App.ts';
import { NumberValue } from './NumberValue.ts';
import { RenderContext } from './RenderContext.ts';
import { StringValue } from './StringValue.ts';
import { TagValue } from './TagValue.ts';

describe('TagValue', () => {
  it('should inherit the string icon, as a tag does in Obsidian', () => {
    expect(new TagValue('#test').icon).toBe('lucide-text');
  });

  it('should create an instance via create2__', () => {
    const value = TagValue.create2__('#test');
    expect(value).toBeInstanceOf(TagValue);
  });

  it('should store the tag value', () => {
    const value = new TagValue('#test');
    expect(value.data).toBe('#test');
  });

  it('should return the tag for toString', () => {
    const value = new TagValue('#example');
    expect(String(value)).toBe('#example');
  });

  it('should overwrite the stored text with its #-prefixed form, as Obsidian does', () => {
    const value = new TagValue('bare');
    expect(value.data).toBe('#bare');
    expect(String(value)).toBe('#bare');
  });

  it('should hand the construction hook the text as passed, which the prefixing runs after', () => {
    const constructorSpy = vi.spyOn(TagValue.prototype, 'constructor5__');
    const value = new TagValue('bare');
    expect(constructorSpy).toHaveBeenCalledWith('bare');
    expect(value.data).toBe('#bare');
  });

  it('should equal the same tag written the other way round, because both store one form', () => {
    expect(new TagValue('bare').equals(new TagValue('#bare'))).toBe(true);
  });

  it('should be truthy for non-empty tags', () => {
    const value = new TagValue('#tag');
    expect(value.isTruthy()).toBe(true);
  });

  describe('tagMatches', () => {
    it('should match the same tag', () => {
      expect(new TagValue('#alpha').tagMatches(new TagValue('#alpha'))).toBe(true);
    });

    it('should match a parent tag, which is what makes a nested tag answer for it', () => {
      expect(new TagValue('#parent/child').tagMatches(new TagValue('#parent'))).toBe(true);
      expect(new TagValue('#parent/child/grandchild').tagMatches(new TagValue('#parent'))).toBe(true);
    });

    it('should not match in the other direction', () => {
      expect(new TagValue('#parent').tagMatches(new TagValue('#parent/child'))).toBe(false);
    });

    it('should require the next character to open a nesting level, not merely share a prefix', () => {
      expect(new TagValue('#parenthesis').tagMatches(new TagValue('#parent'))).toBe(false);
    });

    it('should ignore case on both sides', () => {
      expect(new TagValue('#Parent/Child').tagMatches(new TagValue('#PARENT'))).toBe(true);
    });

    it('should read a bare tag as a #-prefixed one on both sides', () => {
      expect(new TagValue('parent/child').tagMatches(new TagValue('parent'))).toBe(true);
      expect(new TagValue('#parent/child').tagMatches(new TagValue('parent'))).toBe(true);
      expect(new TagValue('parent/child').tagMatches(new TagValue('#parent'))).toBe(true);
    });

    it('should read a plain string value as a tag too', () => {
      expect(new TagValue('#parent/child').tagMatches(new StringValue('#parent'))).toBe(true);
      expect(new TagValue('#parent/child').tagMatches(new StringValue('parent'))).toBe(true);
      expect(new TagValue('#parent/child').tagMatches(new StringValue('other'))).toBe(false);
    });

    it('should never match a value that is not a string', () => {
      expect(new TagValue('#alpha').tagMatches(new NumberValue(1))).toBe(false);
    });
  });

  describe('asOriginalType5__', () => {
    it('should return the same instance typed as the original', () => {
      const value = TagValue.create2__('#tag');
      const original: TagValueOriginal = value.asOriginalType5__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType5__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = TagValue.create2__('#tag');
      const mock = TagValue.fromOriginalType5__(value.asOriginalType5__());
      expect(mock).toBe(value);
    });
  });

  describe('renderTo', () => {
    it('should render the tag through the context, as an anchor without the leading hash', () => {
      const context = RenderContext.create__(App.createConfigured__());
      const renderTagSpy = vi.spyOn(context, 'renderTag');

      const el = createDiv();
      new TagValue('parent/child').renderTo(el, context);

      expect(renderTagSpy).toHaveBeenCalledWith('#parent/child', el);
      const anchorEl = el.find('a');
      expect(anchorEl.className).toBe('tag');
      expect(anchorEl.textContent).toBe('parent/child');
    });
  });
});
