/**
 * @file
 *
 * Mock of Obsidian's `HTMLValue`, the Bases value wrapping raw HTML.
 */

import type { HTMLValue as HTMLValueOriginal } from 'obsidian';

import type { RenderContext } from './RenderContext.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { sanitizeHTMLToDom } from './functions/sanitizeHTMLToDom.ts';
import { StringValue } from './StringValue.ts';

/**
 * Mock of Obsidian's `HTMLValue`: a string value whose string is raw HTML.
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

  /**
   * Renders the raw HTML into an element, as Obsidian does: the string is SANITIZED first and the result
   * appended, then every media source under the element is rewritten to load from the vault.
   *
   * Both halves are Obsidian's. The sanitizer is the same one behind `sanitizeHTMLToDom`, so a `<script>` or
   * an `onclick` never reaches the element; the rewrite is `App.fixFileLinks`, called with an EMPTY source
   * path exactly as Obsidian calls it here, so a relative `src` resolves against the vault root rather than
   * against a note.
   *
   * @param el - The element to render into.
   * @param context - The rendering context, whose app owns the link rewrite.
   */
  public override renderTo(el: HTMLElement, context: RenderContext): void {
    el.append(sanitizeHTMLToDom(this.data));
    context.app.fixFileLinks(el, '');
  }
}
