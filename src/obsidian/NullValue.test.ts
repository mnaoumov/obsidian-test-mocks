import type { NullValue as NullValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { NullValue } from './NullValue.ts';
import { RenderContext } from './RenderContext.ts';
import { StringValue } from './StringValue.ts';
import { Value } from './Value.ts';

describe('NullValue', () => {
  it('should refuse a second instance, as Obsidian does', () => {
    expect(() => new NullValue()).toThrow('Use NullValue.value instead of creating a new NullValue.');
  });

  it('should refuse create__ too, since it delegates to the constructor', () => {
    expect(() => NullValue.create__()).toThrow('Use NullValue.value instead of creating a new NullValue.');
  });

  it('should return false for isTruthy', () => {
    expect(NullValue.value.isTruthy()).toBe(false);
  });

  it('should print null, the literal Obsidian prints, rather than an empty string', () => {
    expect(String(NullValue.value)).toBe('null');
  });

  describe('equals', () => {
    it('should treat one null as every other null', () => {
      // Called directly on purpose. Now that the constructor refuses a second instance, both sides of any
      // comparison are necessarily the one object, so `Value.equals` answers from its identity check and
      // this override is unreachable through it. That is Obsidian's shape, not a gap: the override still
      // exists there and still answers `true`, and this is the only way to observe it.
      expect(NullValue.value.equals(NullValue.value)).toBe(true);
      expect(Value.equals(NullValue.value, NullValue.value)).toBe(true);
    });
  });

  describe('looseEquals', () => {
    it('should answer nothing but another null, which is the base answer', () => {
      expect(NullValue.value.looseEquals(new StringValue(''))).toBe(false);
      expect(Value.looseEquals(NullValue.value, NullValue.value)).toBe(true);
    });
  });

  describe('value', () => {
    it('should expose the one NullValue instance', () => {
      expect(NullValue.value).toBeInstanceOf(NullValue);
    });
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const original: NullValueOriginal = NullValue.value.asOriginalType2__();
      expect(original).toBe(NullValue.value);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const mock = NullValue.fromOriginalType2__(NullValue.value.asOriginalType2__());
      expect(mock).toBe(NullValue.value);
    });
  });

  describe('renderTo', () => {
    it('should render nothing at all, overriding the base back to empty', () => {
      const el = createDiv();
      NullValue.value.renderTo(el, RenderContext.create__(App.createConfigured__()));
      expect(el.childNodes).toHaveLength(0);
      expect(el.textContent).toBe('');
    });
  });
});
