/**
 * @file
 *
 * Mock of Obsidian's `HTMLValue`, the Bases value wrapping raw HTML.
 */

import type { HTMLValue as HTMLValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

/**
 * Mock of Obsidian's `HTMLValue`: a string value whose string is raw HTML. The mock never renders it.
 */
export class HTMLValue extends StringValue {
  /**
   * The value type's identifier, `'HTML'` - Obsidian's own name for this class of value.
   */
  public static override type = 'HTML';

  /**
   * The lucide icon name standing for this value's type.
   */
  public override icon = 'lucide-code-2';

  /**
   * Creates an HTML value.
   *
   * @param value - The raw HTML string.
   */
  public constructor(value = '') {
    super(value);
    const self = strictProxy(this);
    self.constructor5__(value);
    return self;
  }

  /**
   * Mock-only factory: creates an HTML value, spyable via `vi.spyOn(HTMLValue, 'create2__')`. The subclass variant
   * of {@link StringValue.create__}.
   *
   * @param value - The raw HTML string.
   * @returns The new HTML value.
   */
  public static create2__(value = ''): HTMLValue {
    return new HTMLValue(value);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `HTMLValue` as this mock.
   *
   * @param value - The value typed as the original `HTMLValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType5__(value: HTMLValueOriginal): HTMLValue {
    return strictProxy(value, HTMLValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `HTMLValue` type.
   *
   * @returns The same object, typed as the original `HTMLValue`.
   */
  public asOriginalType5__(): HTMLValueOriginal {
    return strictProxy<HTMLValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(HTMLValue.prototype, 'constructor5__')`.
   *
   * @param _value - The HTML string the value was created with.
   */
  public constructor5__(_value: string): void {
    noop();
  }
}
