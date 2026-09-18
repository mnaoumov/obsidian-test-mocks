/**
 * @file
 *
 * Mock of Obsidian's `BooleanValue`, the Bases value wrapping a boolean.
 */

import type { BooleanValue as BooleanValueOriginal } from 'obsidian';

import type { RenderContext } from './RenderContext.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

/**
 * Mock of Obsidian's `BooleanValue`, a Bases `Value` wrapping a boolean.
 */
export class BooleanValue extends PrimitiveValue<boolean> {
  /**
   * The value type's identifier, `'Boolean'` - Obsidian's own name for this class of value.
   */
  public static override type = 'Boolean';

  /**
   * The lucide icon name standing for this value's type.
   */
  public override icon = 'lucide-check-square';

  /**
   * Creates a value wrapping a boolean.
   *
   * @param value - The wrapped boolean; `false` when omitted.
   */
  public constructor(value = false) {
    super(value);
    const self = strictProxy(this);
    self.constructor4__(value);
    return self;
  }

  /**
   * Mock-only factory: creates a boolean value, spyable via `vi.spyOn(BooleanValue, 'create__')`.
   *
   * @param value - The wrapped boolean; `false` when omitted.
   * @returns The new boolean value.
   */
  public static create__(value = false): BooleanValue {
    return new BooleanValue(value);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `BooleanValue` as this mock. Numbered to avoid clashing with the
   * variants its base classes declare.
   *
   * @param value - The value typed as the original `BooleanValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: BooleanValueOriginal): BooleanValue {
    return strictProxy(value, BooleanValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `BooleanValue` type. Numbered to avoid clashing with the variants its
   * base classes declare.
   *
   * @returns The same object, typed as the original `BooleanValue`.
   */
  public asOriginalType4__(): BooleanValueOriginal {
    return strictProxy<BooleanValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(BooleanValue.prototype, 'constructor4__')`.
   *
   * @param _value - The boolean the value was created with.
   */
  public constructor4__(_value = false): void {
    noop();
  }

  /**
   * Renders the value into an element, as Obsidian does: a DISABLED checkbox whose `checked` is the wrapped
   * boolean, rather than the text `true` or `false` its base would write.
   *
   * Obsidian sets `checked` as a PROPERTY after creating the input, not as an attribute, so the rendered
   * element's `checked` attribute is absent either way and only `inputEl.checked` answers - which is what a
   * consumer asserting on it has to read.
   *
   * @param el - The element to render into.
   * @param _context - The rendering context; unused.
   */
  public override renderTo(el: HTMLElement, _context: RenderContext): void {
    el.createEl('input', {
      attr: { disabled: true },
      type: 'checkbox'
    }).checked = this.data;
  }
}
