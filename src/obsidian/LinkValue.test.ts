import {
  describe,
  expect,
  it
} from 'vitest';

import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { FileValue } from './FileValue.ts';
import { LinkValue } from './LinkValue.ts';
import { NumberValue } from './NumberValue.ts';
import { StringValue } from './StringValue.ts';

describe('LinkValue', () => {
  const mockApp = strictProxy<App>({});

  function createVault(): App {
    return App.createConfigured__({
      files: {
        'notes/Other.md': '',
        'Target.md': ''
      }
    });
  }

  it('should carry the link icon', () => {
    expect(LinkValue.create2__(mockApp, 'note', 'source.md').icon).toBe('lucide-link');
  });

  describe('parseFromString', () => {
    it('should parse a simple wiki link', () => {
      const result = LinkValue.parseFromString(mockApp, '[[note]]', 'source.md');
      expect(result).toBeInstanceOf(LinkValue);
      expect(result?.data).toBe('note');
      expect(result?.display).toBeNull();
      expect(result?.app).toBe(mockApp);
      expect(result?.sourcePath).toBe('source.md');
    });

    it('should pass the display text on as a string value', () => {
      const result = LinkValue.parseFromString(mockApp, '[[note|display]]', '');
      expect(result?.data).toBe('note');
      expect(result?.display).toBeInstanceOf(StringValue);
      expect(result?.display?.data).toBe('display');
    });

    it('should split on the last pipe', () => {
      const result = LinkValue.parseFromString(mockApp, '[[a|b|c]]', '');
      expect(result?.data).toBe('a|b');
      expect(result?.display?.data).toBe('c');
    });

    it('should accept an empty link and closing brackets inside the link', () => {
      expect(LinkValue.parseFromString(mockApp, '[[]]', '')?.data).toBe('');
      expect(LinkValue.parseFromString(mockApp, '[[a]]b]]', '')?.data).toBe('a]]b');
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
      expect(value.display?.data).toBe('shown');
      expect(String(value)).toBe('[[note|shown]]');
    });

    it('should keep an empty display text', () => {
      expect(String(LinkValue.create2__(mockApp, 'note', '', ''))).toBe('[[note|]]');
    });
  });

  describe('resolve', () => {
    it('should resolve the target, ignoring a subpath', () => {
      const app = createVault();
      const target = ensureNonNullable(app.vault.getFileByPath('Target.md'));
      expect(LinkValue.create2__(app, 'Target', '').resolve()).toBe(target);
      expect(LinkValue.create2__(app, 'Target.md', '').resolve()).toBe(target);
      expect(LinkValue.create2__(app, 'Target#heading', '').resolve()).toBe(target);
    });

    it('should answer null when nothing answers to the target', () => {
      expect(LinkValue.create2__(createVault(), 'Missing', '').resolve()).toBeNull();
    });
  });

  describe('equals', () => {
    it('should compare the target, the source path and the display text', () => {
      const link = LinkValue.create2__(mockApp, 'note', 'source.md', 'shown');
      expect(link.equals(LinkValue.create2__(mockApp, 'note', 'source.md', 'shown'))).toBe(true);
      expect(link.equals(LinkValue.create2__(mockApp, 'other', 'source.md', 'shown'))).toBe(false);
      expect(link.equals(LinkValue.create2__(mockApp, 'note', 'other.md', 'shown'))).toBe(false);
      expect(link.equals(LinkValue.create2__(mockApp, 'note', 'source.md', 'other'))).toBe(false);
      expect(link.equals(LinkValue.create2__(mockApp, 'note', 'source.md'))).toBe(false);
    });
  });

  describe('looseEquals', () => {
    it('should compare two links by what they resolve to, ignoring source path and display', () => {
      const app = createVault();
      const fromRoot = LinkValue.create2__(app, 'Target', '');
      const fromNote = LinkValue.create2__(app, 'Target.md', 'notes/Other.md', 'Shown');
      expect(fromRoot.equals(fromNote)).toBe(false);
      expect(fromRoot.looseEquals(fromNote)).toBe(true);
    });

    it('should fall back to the target text when either side resolves to nothing', () => {
      const app = createVault();
      expect(LinkValue.create2__(app, 'Missing', '').looseEquals(LinkValue.create2__(app, 'Missing', 'notes/Other.md'))).toBe(true);
      expect(LinkValue.create2__(app, 'Missing', '').looseEquals(LinkValue.create2__(app, 'Absent', ''))).toBe(false);
    });

    it('should read a string value as wikilink syntax', () => {
      const app = createVault();
      expect(LinkValue.create2__(app, 'Target', '').looseEquals(new StringValue('[[Target]]'))).toBe(true);
      expect(LinkValue.create2__(app, 'Target', '').looseEquals(new StringValue('[[Missing]]'))).toBe(false);
      expect(LinkValue.create2__(app, 'Target', '').looseEquals(new StringValue('Target'))).toBe(false);
    });

    it('should answer the file value it resolves to', () => {
      const app = createVault();
      const target = ensureNonNullable(app.vault.getFileByPath('Target.md'));
      const other = ensureNonNullable(app.vault.getFileByPath('notes/Other.md'));
      expect(LinkValue.create2__(app, 'Target', '').looseEquals(FileValue.create__(app, target))).toBe(true);
      expect(LinkValue.create2__(app, 'Target', '').looseEquals(FileValue.create__(app, other))).toBe(false);
    });

    it('should answer nothing of another type', () => {
      expect(LinkValue.create2__(createVault(), 'Target', '').looseEquals(NumberValue.create__(0))).toBe(false);
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
