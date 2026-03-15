import type { NotNullValue as NotNullValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { NotNullValue } from './NotNullValue.ts';
import { ObjectValue } from './ObjectValue.ts';

class BareNotNullValue extends NotNullValue {
  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return 'bare';
  }
}

describe('NotNullValue', () => {
  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      // ObjectValue extends NotNullValue, so we test via ObjectValue
      const val = ObjectValue.create__({});
      const original: NotNullValueOriginal = val.asOriginalType2__();
      expect(original).toBe(val);
    });

    it('should return the same instance via NotNullValue base class', () => {
      const val = new BareNotNullValue();
      const original: NotNullValueOriginal = val.asOriginalType2__();
      expect(original).toBe(val);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const val = ObjectValue.create__({});
      const mock = NotNullValue.fromOriginalType2__(val.asOriginalType2__());
      expect(mock).toBe(val);
    });
  });

  describe('constructor2__', () => {
    it('should be callable without throwing', () => {
      const val = ObjectValue.create__({});
      expect(() => {
        val.constructor2__();
      }).not.toThrow();
    });
  });
});
