import {
  describe,
  expect,
  it
} from 'vitest';

import { createMockApp } from '../../src/helpers/createMockApp.ts';
import { NullValue } from '../../src/obsidian/NullValue.ts';
import { NumberValue } from '../../src/obsidian/NumberValue.ts';
import { RenderContext } from '../../src/obsidian/RenderContext.ts';
import { StringValue } from '../../src/obsidian/StringValue.ts';
import { Value } from '../../src/obsidian/Value.ts';

describe('Value', () => {
  describe('static equals', () => {
    it('should return true when both are null', () => {
      expect(Value.equals(null, null)).toBe(true);
    });

    it('should return false when only first is null', () => {
      expect(Value.equals(null, new StringValue('a'))).toBe(false);
    });

    it('should return false when only second is null', () => {
      expect(Value.equals(new StringValue('a'), null)).toBe(false);
    });

    it('should delegate to instance equals when both are non-null', () => {
      const a = new StringValue('hello');
      const b = new StringValue('hello');
      expect(Value.equals(a, b)).toBe(true);
    });

    it('should return false for different values', () => {
      const a = new StringValue('hello');
      const b = new StringValue('world');
      expect(Value.equals(a, b)).toBe(false);
    });
  });

  describe('static looseEquals', () => {
    it('should return true when both are null', () => {
      expect(Value.looseEquals(null, null)).toBe(true);
    });

    it('should return false when only first is null', () => {
      expect(Value.looseEquals(null, new StringValue('a'))).toBe(false);
    });

    it('should return false when only second is null', () => {
      expect(Value.looseEquals(new StringValue('a'), null)).toBe(false);
    });

    it('should delegate to instance looseEquals when both are non-null', () => {
      const a = new StringValue('hello');
      const b = new StringValue('hello');
      expect(Value.looseEquals(a, b)).toBe(true);
    });
  });

  describe('equals', () => {
    it('should compare by toString output', () => {
      const a = new StringValue('test');
      const b = new StringValue('test');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different toString outputs', () => {
      const a = new StringValue('test');
      const b = new StringValue('other');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('looseEquals', () => {
    it('should return true when toString outputs match across types', () => {
      const testNumber = 5;
      const str = new StringValue(String(testNumber));
      const num = new NumberValue(testNumber);
      expect(str.looseEquals(num)).toBe(true);
    });

    it('should return true for same toString output', () => {
      const a = new StringValue('x');
      const b = new StringValue('x');
      expect(a.looseEquals(b)).toBe(true);
    });
  });

  describe('isTruthy', () => {
    it('should delegate to isTruthy__', () => {
      const val = new NullValue();
      expect(val.isTruthy()).toBe(false);
    });
  });

  describe('toString', () => {
    it('should delegate to toString__', () => {
      const val = new StringValue('hello');
      expect(String(val)).toBe('hello');
    });
  });

  describe('renderTo', () => {
    it('should not throw', async () => {
      const app = await createMockApp();
      const val = new StringValue('test');
      expect(() => {
        val.renderTo({} as HTMLElement, RenderContext.create__(app));
      }).not.toThrow();
    });
  });
});
