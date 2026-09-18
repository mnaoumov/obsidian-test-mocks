/**
 * @file
 *
 * Mock of Obsidian's `RegExpValue`, the Bases value wrapping a regular expression.
 */

import type { RegExpValue as RegExpValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';

/**
 * Mock of Obsidian's `RegExpValue`, a Bases value wrapping a regular expression.
 */
export class RegExpValue extends NotNullValue {
  /**
   * The value type's identifier, `'RegExp'` - Obsidian's own name for this class of value.
   */
  public static override type = 'RegExp';

  /**
   * The lucide icon name standing for this value's type.
   */
  public override icon = 'lucide-regex';

  /**
   * The wrapped regular expression. Obsidian's own name for it, which is why it carries no `__` suffix (L4).
   */
  public regexp: RegExp;

  /**
   * Creates a value wrapping `regexp`.
   *
   * @param regexp - The regular expression to wrap.
   */
  public constructor(regexp: RegExp) {
    super();
    this.regexp = regexp;
    const self = strictProxy(this);
    self.constructor3__(regexp);
    return self;
  }

  /**
   * Mock-only factory: creates a regular expression value, spyable via `vi.spyOn(RegExpValue, 'create__')`.
   *
   * @param regexp - The regular expression to wrap.
   * @returns The new regular expression value.
   */
  public static create__(regexp: RegExp): RegExpValue {
    return new RegExpValue(regexp);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `RegExpValue` as this mock.
   *
   * @param value - The value typed as the original `RegExpValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: RegExpValueOriginal): RegExpValue {
    return strictProxy(value, RegExpValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `RegExpValue` type.
   *
   * @returns The same object, typed as the original `RegExpValue`.
   */
  public asOriginalType3__(): RegExpValueOriginal {
    return strictProxy<RegExpValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(RegExpValue.prototype, 'constructor3__')`.
   *
   * @param _regexp - The regular expression the value was created with.
   */
  public constructor3__(_regexp: RegExp): void {
    noop();
  }

  /**
   * Reports whether the value counts as true in a condition; a regular expression always does.
   *
   * @returns Always `true`.
   */
  public isTruthy(): boolean {
    return true;
  }

  /**
   * Converts the value to its display string: the wrapped pattern's own `toString()`, as Obsidian does.
   *
   * @returns The wrapped regular expression's string form, such as `/abc/gi`.
   */
  public toString(): string {
    return this.regexp.toString();
  }
}
