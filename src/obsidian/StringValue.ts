/**
 * @file
 *
 * Mock of Obsidian's `StringValue`, the Bases value wrapping a string.
 */

import type { StringValue as StringValueOriginal } from 'obsidian';

import type { Value } from './Value.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { NumberValue } from './NumberValue.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

/**
 * Mock of Obsidian's `StringValue`: a primitive value holding a string.
 */
export class StringValue extends PrimitiveValue<string> {
  /**
   * The lucide icon name standing for this value's type.
   */
  public override icon = 'lucide-text';

  /**
   * Creates a string value.
   *
   * @param value - The wrapped string.
   */
  public constructor(value = '') {
    super(value);
    const self = strictProxy(this);
    self.constructor4__(value);
    return self;
  }

  /**
   * Mock-only factory: creates a string value, spyable via `vi.spyOn(StringValue, 'create__')`.
   *
   * @param value - The wrapped string.
   * @returns The new string value.
   */
  public static create__(value = ''): StringValue {
    return new StringValue(value);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `StringValue` as this mock.
   *
   * @param value - The value typed as the original `StringValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: StringValueOriginal): StringValue {
    return strictProxy(value, StringValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `StringValue` type.
   *
   * @returns The same object, typed as the original `StringValue`.
   */
  public asOriginalType4__(): StringValueOriginal {
    return strictProxy<StringValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(StringValue.prototype, 'constructor4__')`.
   *
   * @param _value - The string the value was created with.
   */
  public constructor4__(_value = ''): void {
    noop();
  }

  /**
   * Lists the property keys {@link StringValue.objectAccess} answers for.
   *
   * @returns The inherited keys followed by `length`.
   */
  public override keys(): string[] {
    return [...super.keys(), 'length'];
  }

  /**
   * Reads a named sub-property of this value.
   *
   * @param key - The property key, matched without regard to case.
   * @returns The string's length as a `NumberValue` for `length`, and otherwise whatever the base answers.
   */
  public override objectAccess(key: string): null | Value {
    return key.toLowerCase() === 'length' ? NumberValue.create__(this.data.length) : super.objectAccess(key);
  }
}
