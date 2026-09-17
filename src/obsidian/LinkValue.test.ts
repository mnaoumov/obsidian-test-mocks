import {
  describe,
  expect,
  it
} from 'vitest';

import type { App } from './App.ts';

import { strictProxy } from '../internal/strict-proxy.ts';
import { LinkValue } from './LinkValue.ts';
import { StringValue } from './StringValue.ts';

describe('LinkValue', () => {
  const mockApp = strictProxy<App>({});

  describe('parseFromString', () => {
    it('should parse a simple wiki link', () => {
      const result = LinkValue.parseFromString(mockApp, '[[note]]', 'source.md');
      expect(result).toBeInstanceOf(LinkValue);
      expect(result?.value__).toBe('note');
      expect(result?.display).toBeNull();
      expect(result?.app).toBe(mockApp);
      expect(result?.sourcePath).toBe('source.md');
    });

    it('should pass the display text on as a string value', () => {
      const result = LinkValue.parseFromString(mockApp, '[[note|display]]', '');
      expect(result?.value__).toBe('note');
      expect(result?.display).toBeInstanceOf(StringValue);
      expect(result?.display?.value__).toBe('display');
    });

    it('should split on the last pipe', () => {
      const result = LinkValue.parseFromString(mockApp, '[[a|b|c]]', '');
      expect(result?.value__).toBe('a|b');
      expect(result?.display?.value__).toBe('c');
    });

    it('should accept an empty link and closing brackets inside the link', () => {
      expect(LinkValue.parseFromString(mockApp, '[[]]', '')?.value__).toBe('');
      expect(LinkValue.parseFromString(mockApp, '[[a]]b]]', '')?.value__).toBe('a]]b');
    });

    it('should return null for text not wrapped in double brackets', () => {
      for (const input of ['plain text', '[[incomplete', 'incomplete]]', ' [[note]]']) {
        expect(LinkValue.parseFromString(mockApp, input, '')).toBeNull();
      }
    });
  });

  describe('toString', () => {
    it('should render the link as wikilink syntax', () => {
      expect(LinkValue.create2__(mockApp, 'note', '').toString()).toBe('[[note]]');
      expect(LinkValue.create2__(mockApp, 'note', '', StringValue.create__('shown')).toString()).toBe('[[note|shown]]');
    });

    it('should wrap a plain string display', () => {
      const value = LinkValue.create2__(mockApp, 'note', '', 'shown');
      expect(value.display?.value__).toBe('shown');
      expect(String(value)).toBe('[[note|shown]]');
    });

    it('should keep an empty display text', () => {
      expect(String(LinkValue.create2__(mockApp, 'note', '', ''))).toBe('[[note|]]');
    });
  });

  describe('isTruthy', () => {
    it('should always be truthy', () => {
      expect(LinkValue.create2__(mockApp, '', '').isTruthy()).toBe(true);
    });
  });

  describe('create2__', () => {
    it('should create an instance via factory method', () => {
      const value = LinkValue.create2__(mockApp, 'note', '');
      expect(value).toBeInstanceOf(LinkValue);
      expect(value.display).toBeNull();
    });
  });

  describe('asOriginalType5__', () => {
    it('should return the same instance', () => {
      const value = LinkValue.create2__(mockApp, 'note', '');
      const original = value.asOriginalType5__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType5__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = LinkValue.create2__(mockApp, 'note', '');
      const mock = LinkValue.fromOriginalType5__(value.asOriginalType5__());
      expect(mock).toBe(value);
    });
  });
});
