/**
 * @file
 *
 * Mock of Obsidian's `IconValue`, the Bases value wrapping a renderable icon.
 */

import type { IconValue as IconValueOriginal } from 'obsidian';

import type { RenderContext } from './RenderContext.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { getIcon } from './functions/getIcon.ts';
import { StringValue } from './StringValue.ts';

/**
 * The icon Obsidian falls back to when the value's own id resolves to nothing.
 */
const UNKNOWN_ICON_ID = 'question-mark-glyph';

/**
 * Mock of Obsidian's `IconValue`: a string value holding an icon id.
 */
export class IconValue extends StringValue {
  /**
   * The lucide icon name standing for this value's type.
   */
  public override icon = 'lucide-image';

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

  /**
   * Renders the icon into an element, as Obsidian does: the SVG the icon id resolves to, falling back to
   * `question-mark-glyph` when the id is unknown, and rendering NOTHING when even that does not resolve.
   *
   * In practice the mock takes that last branch: `src/internal/icon-registry.ts` starts EMPTY on purpose -
   * Obsidian's Lucide set and its own glyphs are deliberately not bundled - so both lookups answer `null`
   * unless a test has registered the id with `addIcon`. That is a property of the registry rather than of
   * this method: register `question-mark-glyph` and every unknown icon renders it, exactly as in the app.
   *
   * @param el - The element to render into.
   * @param _context - The rendering context; unused.
   */
  public override renderTo(el: HTMLElement, _context: RenderContext): void {
    const iconEl = getIcon(this.data) ?? getIcon(UNKNOWN_ICON_ID);
    if (iconEl) {
      el.append(iconEl);
    }
  }
}
