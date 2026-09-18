/**
 * @file
 *
 * Mock of Obsidian's `UrlValue`, the Bases value wrapping a URL.
 */

import type { UrlValue as UrlValueOriginal } from 'obsidian';

import type { RenderContext } from './RenderContext.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';
import { Value } from './Value.ts';

/**
 * Mock of Obsidian's `UrlValue`: a string value holding a URL, with optional display text.
 */
export class UrlValue extends StringValue {
  /**
   * The value type's identifier, `'URL'` - Obsidian's own name for this class of value.
   */
  public static override type = 'URL';

  /**
   * The display text, or `null` to show the URL itself.
   */
  public display: null | StringValue;

  /**
   * The lucide icon name standing for this value's type.
   */
  public override icon = 'lucide-link';

  /**
   * Creates a URL value.
   *
   * @param value - The URL.
   * @param display - Text to show instead of the URL, or `null`/omitted to show the URL. Obsidian passes a
   * `Value`; the mock takes the `StringValue` its typings declare, and also accepts a plain string and wraps it.
   */
  public constructor(value: string, display?: null | string | StringValue) {
    super(value);
    this.display = typeof display === 'string' ? StringValue.create__(display) : display ?? null;
    const self = strictProxy(this);
    self.constructor5__(value, display);
    return self;
  }

  /**
   * Mock-only factory: creates a URL value, spyable via `vi.spyOn(UrlValue, 'create2__')`. It is the subclass variant
   * of {@link StringValue.create__}, numbered because its signature is incompatible with the base factory.
   *
   * @param value - The URL.
   * @param display - The display text, if any.
   * @returns The new URL value.
   */
  public static create2__(value: string, display?: null | string | StringValue): UrlValue {
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
  public constructor5__(_value: string, _display?: null | string | StringValue): void {
    noop();
  }

  /**
   * Compares this URL with another, as Obsidian does: the two URLs, then the two display texts.
   *
   * The displays are compared with the static `Value.equals`, so a missing display equals only another
   * missing one - `[url](https://example.com)` and a bare `https://example.com` are NOT equal.
   *
   * @param other - The URL value to compare with.
   * @returns Whether both the URL and the display text match.
   */
  public override equals(other: this): boolean {
    return this.data === other.data && Value.equals(this.display, other.display);
  }

  /**
   * Renders the URL into an element, as Obsidian does: through {@link RenderContext.renderExternalLink},
   * which builds the external link the app shows.
   *
   * The display value is passed on as it is, so a URL with one renders that value INSIDE the anchor - through
   * the display's own `renderTo` - and a URL without one renders its own text.
   *
   * @param el - The element to render into.
   * @param context - The rendering context, which owns the link markup.
   */
  public override renderTo(el: HTMLElement, context: RenderContext): void {
    context.renderExternalLink(this.data, this.display, el);
  }
}
