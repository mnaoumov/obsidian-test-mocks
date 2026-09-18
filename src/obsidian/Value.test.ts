import type { Value as ValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { castTo } from '../internal/castTo.ts';
import { App } from './App.ts';
import { ListValue } from './ListValue.ts';
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
  describe('icon', () => {
    it('should default to the unknown-type icon', () => {
      expect(new BareValue().icon).toBe('lucide-file-question');
    });

    it('should be inherited by a value type that declares none', () => {
      expect(NullValue.value.icon).toBe('lucide-file-question');
    });
  });

  describe('keys', () => {
    it('should expose no keys on the base value', () => {
      expect(new BareValue().keys()).toEqual([]);
    });
  });

  describe('objectAccess', () => {
    it('should answer null for every key on the base value', () => {
      expect(new BareValue().objectAccess('anything')).toBeNull();
    });
  });

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

    it('should return true for the same instance without consulting instance equals', () => {
      const value = new StringValue('hello');
      const equalsSpy = vi.spyOn(value, 'equals');
      expect(Value.equals(value, value)).toBe(true);
      expect(equalsSpy).not.toHaveBeenCalled();
    });

    it('should return false for an undefined a JavaScript consumer can still pass', () => {
      const a = castTo<null>(undefined);
      expect(Value.equals(a, new StringValue('a'))).toBe(false);
      expect(Value.equals(new StringValue('a'), a)).toBe(false);
      expect(Value.equals(a, a)).toBe(true);
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

    it('should return false for two classes that print the same, without consulting instance equals', () => {
      const testNumber = 1;
      const $string = new StringValue(String(testNumber));
      const $number = new NumberValue(testNumber);
      const equalsSpy = vi.spyOn($string, 'equals');
      expect($string.equals(castTo<StringValue>($number))).toBe(true);
      equalsSpy.mockClear();
      expect(Value.equals($string, $number)).toBe(false);
      expect(equalsSpy).not.toHaveBeenCalled();
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

    it('should return true for the same instance without consulting either comparison', () => {
      const value = new StringValue('hello');
      const equalsSpy = vi.spyOn(value, 'equals');
      const looseEqualsSpy = vi.spyOn(value, 'looseEquals');
      expect(Value.looseEquals(value, value)).toBe(true);
      expect(equalsSpy).not.toHaveBeenCalled();
      expect(looseEqualsSpy).not.toHaveBeenCalled();
    });

    it('should return false for an undefined a JavaScript consumer can still pass', () => {
      const a = castTo<null>(undefined);
      expect(Value.looseEquals(a, new StringValue('a'))).toBe(false);
      expect(Value.looseEquals(new StringValue('a'), a)).toBe(false);
      expect(Value.looseEquals(a, a)).toBe(true);
    });

    it('should answer from strict equality when both are of the same class', () => {
      const a = new StringValue('hello');
      const b = new StringValue('hello');
      const looseEqualsSpy = vi.spyOn(a, 'looseEquals');
      expect(Value.looseEquals(a, b)).toBe(true);
      expect(looseEqualsSpy).not.toHaveBeenCalled();
    });

    it('should fall back to the loose comparison when two of the same class are not strictly equal', () => {
      const a = new ListValue([1]);
      const b = new ListValue(['1']);
      expect(Value.equals(a, b)).toBe(false);
      expect(Value.looseEquals(a, b)).toBe(true);
    });

    // The direction that answers here is the mock's string-form comparison rather than Obsidian's, which
    // would answer `false` both ways - but the branch under test is the static's, and only a pair whose two
    // directions DISAGREE can reach it. `ListValue` is the one class that overrides `looseEquals`, so it is
    // also the only source of such a pair.
    it('should try the second value as well when the first direction says no', () => {
      const list = new ListValue([1, 2]);
      const $string = new StringValue('1, 2');
      expect(list.looseEquals($string)).toBe(false);
      expect($string.looseEquals(list)).toBe(true);
      expect(Value.looseEquals(list, $string)).toBe(true);
    });

    it('should return false when neither direction answers', () => {
      expect(Value.looseEquals(new StringValue('a'), new ListValue([1, 2]))).toBe(false);
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
