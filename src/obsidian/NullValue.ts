/**
 * @file
 *
 * Mock of Obsidian's `NullValue`, the Bases value that represents null.
 */

import type { NullValue as NullValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Value } from './Value.ts';

/**
 * Mock of Obsidian's `NullValue`, the Bases value that represents null.
 *
 * A REAL singleton, as Obsidian's is: {@link NullValue.value} is the only way in, and a second construction
 * throws with Obsidian's own message. The one call that gets through is the static initializer below, which
 * runs while `NullValue.value` is still unset - exactly how Obsidian's `NullValue.value = new NullValue()`
 * passes its own guard.
 *
 * One consequence worth knowing before writing a test against it: because every null is the same object,
 * {@link Value.equals} and {@link Value.looseEquals} answer from their identity check and never reach
 * {@link NullValue.equals}. That is Obsidian's shape too, not a shortcut here.
 */
export class NullValue extends Value {
  /**
   * The one null value. Obsidian's `NullValue` is a singleton and this is it; the constructor refuses
   * anything else.
   */
  public static value: NullValue = NullValue.create__();

  /**
   * Creates the one null value, and refuses every later attempt, as Obsidian does.
   *
   * The guard sits AFTER `super()` because Obsidian's does: its constructor calls the base, and only then
   * tests `NullValue.value`. So a refused construction still fires {@link Value.constructor__} and still
   * assigns {@link Value.icon} before it throws, and a spy on the base hook observes the same thing it
   * observes in the app.
   *
   * @throws When {@link NullValue.value} already holds the singleton.
   */
  public constructor() {
    super();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- `NullValue.value` is declared non-nullable because it always is by the time any consumer can read it, and this is the one moment it is not: the static initializer below is still evaluating its own right-hand side. Obsidian's guard reads the same not-yet-assigned field, and widening the declaration to satisfy the rule would push an `undefined` onto every consumer that can never see one.
    if (NullValue.value) {
      throw new Error('Use NullValue.value instead of creating a new NullValue.');
    }

    const self = strictProxy(this);
    self.constructor2__();
    return self;
  }

  /**
   * Mock-only factory: creates the null value, spyable via `vi.spyOn(NullValue, 'create__')`.
   *
   * Called exactly once, by the {@link NullValue.value} initializer at class-initialization time. Every later
   * call throws, because the constructor it delegates to refuses a second instance - so a spy installed from
   * a test can observe the factory, never make it answer.
   *
   * @returns The one null value.
   * @throws When {@link NullValue.value} already holds the singleton.
   */
  public static create__(): NullValue {
    return new NullValue();
  }

  /**
   * Mock-only: views a value typed as Obsidian's `NullValue` as this mock.
   *
   * @param value - The value typed as the original `NullValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: NullValueOriginal): NullValue {
    return strictProxy(value, NullValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `NullValue` type.
   *
   * @returns The same object, typed as the original `NullValue`.
   */
  public asOriginalType2__(): NullValueOriginal {
    return strictProxy<NullValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(NullValue.prototype, 'constructor2__')`.
   */
  public constructor2__(): void {
    noop();
  }

  /**
   * Compares this value with another null value, as Obsidian does.
   *
   * @param _other - The value to compare with; only the singleton itself ever reaches here, and only on a
   * direct call, because {@link Value.equals} answers from its identity check before its class test.
   * @returns Always `true`: one null is every other null - which, since there is only ever one, is a claim
   * about Obsidian's shape rather than about a comparison a consumer can arrange.
   */
  public override equals(_other: this): boolean {
    return true;
  }

  /**
   * Reports whether the value counts as true in a condition; null never does.
   *
   * @returns Always `false`.
   */
  public isTruthy(): boolean {
    return false;
  }

  /**
   * Converts the value to its display string.
   *
   * @returns Always `'null'`, the literal Obsidian prints. It is read further than it looks:
   * {@link ListValue.join} - and through it `ListValue.toString` - writes it into the joined text, and
   * {@link ListValue.unique} buckets by it, so a list holding a null shows and de-duplicates by this word.
   */
  public toString(): string {
    return 'null';
  }
}
