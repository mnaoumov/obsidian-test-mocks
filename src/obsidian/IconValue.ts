/**
 * @file
 *
 * Mock of Obsidian's `IconValue`, the Bases value wrapping a renderable icon.
 */

import type { IconValue as IconValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

/**
 * Mock of Obsidian's `IconValue`: a string value holding an icon id. The mock never renders the icon.
 */
export class IconValue extends StringValue {
  /**
   * Creates an icon value.
   *
   * @param value - The icon id.
   */
  public constructor(value = '') {
    super(value);
    const self = strictProxy(this);
    self.constructor5__(value);
    return self;
  }

  /**
   * Mock-only factory: creates an icon value, spyable via `vi.spyOn(IconValue, 'create2__')`. The subclass variant
   * of {@link StringValue.create__}.
   *
   * @param value - The icon id.
   * @returns The new icon value.
   */
  public static create2__(value = ''): IconValue {
    return new IconValue(value);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `IconValue` as this mock.
   *
   * @param value - The value typed as the original `IconValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType5__(value: IconValueOriginal): IconValue {
    return strictProxy(value, IconValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `IconValue` type.
   *
   * @returns The same object, typed as the original `IconValue`.
   */
  public asOriginalType5__(): IconValueOriginal {
    return strictProxy<IconValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(IconValue.prototype, 'constructor5__')`.
   *
   * @param _value - The icon id the value was created with.
   */
  public constructor5__(_value: string): void {
    noop();
  }
}
