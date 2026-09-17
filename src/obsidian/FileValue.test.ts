import {
  describe,
  expect,
  it
} from 'vitest';

import { ensureNonNullable } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { FileValue } from './FileValue.ts';

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

  it('should always be truthy', () => {
    const value = createFileValue();
    expect(value.isTruthy()).toBe(true);
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
