import {
  describe,
  expect,
  it
} from 'vitest';

import { ensureNonNullable } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { DateValue } from './DateValue.ts';
import { FileValue } from './FileValue.ts';
import { NumberValue } from './NumberValue.ts';

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

    it('should answer null for the five keys whose accessors stay unmocked', () => {
      const value = createFileValue();
      for (const key of ['links', 'embeds', 'backlinks', 'tags', 'properties']) {
        expect(value.objectAccess(key), key).toBeNull();
      }
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
