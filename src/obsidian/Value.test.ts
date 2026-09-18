import type { Value as ValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { castTo } from '../internal/castTo.ts';
import { App } from './App.ts';
import { BooleanValue } from './BooleanValue.ts';
import { DateValue } from './DateValue.ts';
import { DurationValue } from './DurationValue.ts';
import { FileValue } from './FileValue.ts';
import { HTMLValue } from './HTMLValue.ts';
import { IconValue } from './IconValue.ts';
import { ImageValue } from './ImageValue.ts';
import { LinkValue } from './LinkValue.ts';
import { ListValue } from './ListValue.ts';
import { NotNullValue } from './NotNullValue.ts';
import { NullValue } from './NullValue.ts';
import { NumberValue } from './NumberValue.ts';
import { ObjectValue } from './ObjectValue.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';
import { RegExpValue } from './RegExpValue.ts';
import { RelativeDateValue } from './RelativeDateValue.ts';
import { RenderContext } from './RenderContext.ts';
import { StringValue } from './StringValue.ts';
import { TagValue } from './TagValue.ts';
import { UrlValue } from './UrlValue.ts';
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

  describe('static type', () => {
    it.each([
      { expected: 'Any', name: 'Value', valueClass: Value },
      { expected: 'Null', name: 'NullValue', valueClass: NullValue },
      { expected: 'String', name: 'StringValue', valueClass: StringValue },
      { expected: 'Number', name: 'NumberValue', valueClass: NumberValue },
      { expected: 'Boolean', name: 'BooleanValue', valueClass: BooleanValue },
      { expected: 'List', name: 'ListValue', valueClass: ListValue },
      { expected: 'Object', name: 'ObjectValue', valueClass: ObjectValue },
      { expected: 'RegExp', name: 'RegExpValue', valueClass: RegExpValue },
      { expected: 'Date', name: 'DateValue', valueClass: DateValue },
      { expected: 'Duration', name: 'DurationValue', valueClass: DurationValue },
      { expected: 'File', name: 'FileValue', valueClass: FileValue },
      { expected: 'URL', name: 'UrlValue', valueClass: UrlValue },
      { expected: 'Link', name: 'LinkValue', valueClass: LinkValue },
      { expected: 'Image', name: 'ImageValue', valueClass: ImageValue },
      { expected: 'HTML', name: 'HTMLValue', valueClass: HTMLValue }
    ])('should name $name $expected, as Obsidian does', ({ expected, valueClass }) => {
      expect(valueClass.type).toBe(expected);
    });

    it.each([
      { expected: 'Any', name: 'NotNullValue', valueClass: NotNullValue },
      { expected: 'Any', name: 'PrimitiveValue', valueClass: PrimitiveValue },
      { expected: 'Date', name: 'RelativeDateValue', valueClass: RelativeDateValue },
      { expected: 'String', name: 'IconValue', valueClass: IconValue },
      { expected: 'String', name: 'TagValue', valueClass: TagValue }
    ])('should leave $name on the inherited $expected, which Obsidian never overwrites', ({ expected, valueClass }) => {
      expect(valueClass.type).toBe(expected);
    });
  });

  describe('static toString', () => {
    it('should answer the type name of the class it is called on', () => {
      expect(StringValue.toString()).toBe('String');
    });

    it('should be what String() reads off a value class', () => {
      expect(String(Value)).toBe('Any');
      expect(String(NullValue)).toBe('Null');
      expect(String(UrlValue)).toBe('URL');
    });

    it('should answer the inherited name for a class that declares none', () => {
      expect(String(TagValue)).toBe('String');
    });
  });

  describe('type', () => {
    it('should answer the CONSTRUCTOR rather than the type name, as Obsidian does', () => {
      const value = new StringValue('hello');
      expect(value.type).toBe(StringValue);
      expect(value.type).not.toBe(StringValue.type);
    });

    it('should answer the class of the instance, not the one declaring the accessor', () => {
      expect(NullValue.value.type).toBe(NullValue);
      expect(new BareValue().type).toBe(BareValue);
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
      expect($string.toString()).toBe($number.toString());
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

    // Only a pair whose two directions DISAGREE can reach this branch: a number never loosely equals a
    // list, while a ONE-element list unwraps against the value it holds.
    it('should try the second value as well when the first direction says no', () => {
      const $number = new NumberValue(1);
      const list = new ListValue([1]);
      expect($number.looseEquals(list)).toBe(false);
      expect(list.looseEquals($number)).toBe(true);
      expect(Value.looseEquals($number, list)).toBe(true);
    });

    it('should return false when neither direction answers', () => {
      expect(Value.looseEquals(new StringValue('a'), new ListValue([1, 2]))).toBe(false);
    });
  });

  describe('equals', () => {
    it('should answer false on the base value, however the two print', () => {
      const a = new BareValue();
      const b = new BareValue();
      expect(a.toString()).toBe(b.toString());
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('looseEquals', () => {
    it('should answer false on the base value, however the two print', () => {
      const a = new BareValue();
      expect(a.looseEquals(new BareValue())).toBe(false);
      expect(a.looseEquals(new StringValue('bare'))).toBe(false);
    });
  });

  describe('isTruthy', () => {
    it('should delegate to subclass implementation', () => {
      expect(NullValue.value.isTruthy()).toBe(false);
    });
  });

  describe('toString', () => {
    it('should delegate to subclass implementation', () => {
      const value = new StringValue('hello');
      expect(String(value)).toBe('hello');
    });
  });

  describe('renderTo', () => {
    it('should write the value string form into the element, as Obsidian base does', () => {
      const el = createDiv();
      new BareValue().renderTo(el, RenderContext.create__(App.createConfigured__()));
      expect(el.textContent).toBe('bare');
    });

    it('should be what the value types Obsidian gives no override of their own render with', () => {
      const context = RenderContext.create__(App.createConfigured__());

      const objectValue = new ObjectValue({ a: 1 });
      const objectEl = createDiv();
      objectValue.renderTo(objectEl, context);
      expect(objectEl.textContent).toBe(objectValue.toString());

      const regExpEl = createDiv();
      new RegExpValue(/ab+c/giu).renderTo(regExpEl, context);
      expect(regExpEl.textContent).toBe('/ab+c/giu');

      const duration = new DurationValue(0, 0, 2, 0, 0, 0, 0);
      const durationEl = createDiv();
      duration.renderTo(durationEl, context);
      expect(durationEl.textContent).toBe(duration.toString());
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
