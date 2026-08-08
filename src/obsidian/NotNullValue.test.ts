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
      const value = ObjectValue.create__({});
      const original: NotNullValueOriginal = value.asOriginalType2__();
      expect(original).toBe(value);
    });

    it('should return the same instance via NotNullValue base class', () => {
      const value = new BareNotNullValue();
      const original: NotNullValueOriginal = value.asOriginalType2__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = ObjectValue.create__({});
      const mock = NotNullValue.fromOriginalType2__(value.asOriginalType2__());
      expect(mock).toBe(value);
    });
  });

  describe('constructor2__', () => {
    it('should be callable without throwing', () => {
      const value = ObjectValue.create__({});
      expect(() => {
        value.constructor2__();
      }).not.toThrow();
    });
  });
});
