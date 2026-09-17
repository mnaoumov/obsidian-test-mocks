/**
 * @file
 *
 * Mock of Obsidian's `UrlValue`, the Bases value wrapping a URL.
 */

import type { UrlValue as UrlValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

/**
 * Mock of Obsidian's `UrlValue`: a string value holding a URL. The mock stores only the URL; the display text is
 * passed to the construction hook and otherwise ignored.
 */
export class UrlValue extends StringValue {
  /**
   * The lucide icon name standing for this value's type.
   */
  public override icon = 'lucide-link';

  /**
   * Creates a URL value.
   *
   * @param value - The URL.
   * @param display - Text to show instead of the URL; ignored by the mock.
   */
  public constructor(value: string, display?: null | string) {
    super(value);
    const self = strictProxy(this);
    self.constructor5__(value, display);
    return self;
  }

  /**
   * Mock-only factory: creates a URL value, spyable via `vi.spyOn(UrlValue, 'create2__')`. It is the subclass variant
   * of {@link StringValue.create__}, numbered because its signature is incompatible with the base factory.
   *
   * @param value - The URL.
   * @param display - Text to show instead of the URL; ignored by the mock.
   * @returns The new URL value.
   */
  public static create2__(value: string, display?: null | string): UrlValue {
    return new UrlValue(value, display);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `UrlValue` as this mock.
   *
   * @param value - The value typed as the original `UrlValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType5__(value: UrlValueOriginal): UrlValue {
    return strictProxy(value, UrlValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `UrlValue` type.
   *
   * @returns The same object, typed as the original `UrlValue`.
   */
  public asOriginalType5__(): UrlValueOriginal {
    return strictProxy<UrlValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(UrlValue.prototype, 'constructor5__')`.
   *
   * @param _value - The URL the value was created with.
   * @param _display - The display text the value was created with.
   */
  public constructor5__(_value: string, _display?: null | string): void {
    noop();
  }
}
