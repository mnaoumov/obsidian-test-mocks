import type { Value as ValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { NullValue } from './NullValue.ts';
import { NumberValue } from './NumberValue.ts';
import { RenderContext } from './RenderContext.ts';
import { StringValue } from './StringValue.ts';
import { Value } from './Value.ts';

class BareValue extends Value {
  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return 'bare';
  }
}

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
    it('should delegate to subclass implementation', () => {
      const val = new NullValue();
      expect(val.isTruthy()).toBe(false);
    });
  });

  describe('toString', () => {
    it('should delegate to subclass implementation', () => {
      const val = new StringValue('hello');
      expect(String(val)).toBe('hello');
    });
  });

  describe('renderTo', () => {
    it('should not throw', async () => {
      const app = await App.createConfigured__();
      const val = new StringValue('test');
      expect(() => {
        val.renderTo({} as HTMLElement, RenderContext.create__(app));
      }).not.toThrow();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const val = new StringValue('test');
      expect(val.asOriginalType__()).toBe(val);
    });

    it('should return the same instance via Value base class', () => {
      const val = new BareValue();
      const original: ValueOriginal = val.asOriginalType__();
      expect(original).toBe(val);
    });
  });

  describe('constructor__', () => {
    it('should be callable without throwing', () => {
      const val = new StringValue('test');
      expect(() => {
        val.constructor__();
      }).not.toThrow();
    });
  });
});
