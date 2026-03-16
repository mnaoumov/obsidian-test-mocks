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
        'test.md': ''
      }
    });
    const file = ensureNonNullable(app.vault.getFileByPath('test.md'));
    return new FileValue(app, file);
  }

  it('should always be truthy', () => {
    const val = createFileValue();
    expect(val.isTruthy()).toBe(true);
  });

  it('should return empty string for toString', () => {
    const val = createFileValue();
    expect(String(val)).toBe('');
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const app = App.createConfigured__({
        files: {
          'test.md': ''
        }
      });
      const file = ensureNonNullable(app.vault.getFileByPath('test.md'));
      const val = FileValue.create__(app, file);
      expect(val).toBeInstanceOf(FileValue);
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance', () => {
      const val = createFileValue();
      const original = val.asOriginalType3__();
      expect(original).toBe(val);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const val = createFileValue();
      const mock = FileValue.fromOriginalType3__(val.asOriginalType3__());
      expect(mock).toBe(val);
    });
  });
});
