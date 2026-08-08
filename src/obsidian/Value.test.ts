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
      const $string = new StringValue(String(testNumber));
      const $number = new NumberValue(testNumber);
      expect($string.looseEquals($number)).toBe(true);
    });

    it('should return true for same toString output', () => {
      const a = new StringValue('x');
      const b = new StringValue('x');
      expect(a.looseEquals(b)).toBe(true);
    });
  });

  describe('isTruthy', () => {
    it('should delegate to subclass implementation', () => {
      const value = new NullValue();
      expect(value.isTruthy()).toBe(false);
    });
  });

  describe('toString', () => {
    it('should delegate to subclass implementation', () => {
      const value = new StringValue('hello');
      expect(String(value)).toBe('hello');
    });
  });

  describe('renderTo', () => {
    it('should not throw', () => {
      const app = App.createConfigured__();
      const value = new StringValue('test');
      expect(() => {
        value.renderTo(createDiv(), RenderContext.create__(app));
      }).not.toThrow();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const value = new StringValue('test');
      expect(value.asOriginalType__()).toBe(value);
    });

    it('should return the same instance via Value base class', () => {
      const value = new BareValue();
      const original: ValueOriginal = value.asOriginalType__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = new StringValue('test');
      const mock = Value.fromOriginalType__(value.asOriginalType__());
      expect(mock).toBe(value);
    });
  });

  describe('constructor__', () => {
    it('should be callable without throwing', () => {
      const value = new StringValue('test');
      expect(() => {
        value.constructor__();
      }).not.toThrow();
    });
  });
});
