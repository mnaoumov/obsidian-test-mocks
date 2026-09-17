/**
 * @file
 *
 * Mock of Obsidian's `LinkValue`, the Bases value wrapping an internal wikilink.
 */

import type { LinkValue as LinkValueOriginal } from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

const WIKILINK_OPEN = '[[';
const WIKILINK_CLOSE = ']]';

/**
 * Mock of Obsidian's `LinkValue`: a string value holding a link target, with the note it is in and optional display
 * text.
 */
export class LinkValue extends StringValue {
  /**
   * The app used to resolve the link.
   */
  public app: App;

  /**
   * The display text, or `null` to show the target.
   */
  public display: null | StringValue;

  /**
   * The path of the note the link is in, used to resolve relative targets.
   */
  public sourcePath: string;

  /**
   * Creates a link value.
   *
   * @param app - The app used to resolve the link.
   * @param value - The link target.
   * @param sourcePath - The path of the note the link is in, used to resolve relative targets.
   * @param display - The display text, or `null`/omitted to show the target. Obsidian passes a `StringValue`; the
   * mock also accepts a plain string and wraps it.
   */
  public constructor(app: App, value: string, sourcePath: string, display?: null | string | StringValue) {
    super(value);
    this.app = app;
    this.sourcePath = sourcePath;
    this.display = typeof display === 'string' ? StringValue.create__(display) : display ?? null;
    const self = strictProxy(this);
    self.constructor5__(app, value, sourcePath, display);
    return self;
  }

  /**
   * Mock-only factory: creates a link value, spyable via `vi.spyOn(LinkValue, 'create2__')`. The subclass variant
   * of {@link StringValue.create__}.
   *
   * @param app - The app used to resolve the link.
   * @param value - The link target.
   * @param sourcePath - The path of the note the link is in.
   * @param display - The display text, if any.
   * @returns The new link value.
   */
  public static create2__(app: App, value: string, sourcePath: string, display?: null | string | StringValue): LinkValue {
    return new LinkValue(app, value, sourcePath, display);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `LinkValue` as this mock.
   *
   * @param value - The value typed as the original `LinkValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType5__(value: LinkValueOriginal): LinkValue {
    return strictProxy(value, LinkValue);
  }

  /**
   * Creates a link value from wikilink syntax, such as `[[Welcome|Example Link]]`, as Obsidian does.
   *
   * The string must start with `[[` and end with `]]`. The text after the LAST `|` becomes the display text, and
   * the text before it the target.
   *
   * @param app - The app used to resolve the link.
   * @param input - The wikilink text to parse.
   * @param sourcePath - The path of the note the link is in.
   * @returns The link value, or `null` when `input` is not wrapped in `[[` and `]]`.
   */
  public static parseFromString(app: App, input: string, sourcePath: string): LinkValue | null {
    if (!input.startsWith(WIKILINK_OPEN) || !input.endsWith(WIKILINK_CLOSE)) {
      return null;
    }
    let target = input.slice(WIKILINK_OPEN.length, -WIKILINK_CLOSE.length);
    let display: null | StringValue = null;
    const pipeIndex = target.lastIndexOf('|');
    if (pipeIndex !== -1) {
      display = StringValue.create__(target.slice(pipeIndex + 1));
      target = target.slice(0, pipeIndex);
    }
    return LinkValue.create2__(app, target, sourcePath, display);
  }

  /**
   * Mock-only: views this mock as Obsidian's `LinkValue` type.
   *
   * @returns The same object, typed as the original `LinkValue`.
   */
  public asOriginalType5__(): LinkValueOriginal {
    return strictProxy<LinkValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(LinkValue.prototype, 'constructor5__')`.
   *
   * @param _app - The app the value was created with.
   * @param _value - The link target the value was created with.
   * @param _sourcePath - The source path the value was created with.
   * @param _display - The display text the value was created with.
   */
  public constructor5__(_app: App, _value: string, _sourcePath: string, _display?: null | string | StringValue): void {
    noop();
  }

  /**
   * Tells whether the value counts as true in a Bases formula.
   *
   * @returns Always `true`, even for an empty target.
   */
  public override isTruthy(): boolean {
    return true;
  }

  /**
   * Renders the link as wikilink syntax.
   *
   * @returns `[[target]]`, or `[[target|display]]` when the link has display text.
   */
  public override toString(): string {
    const displaySuffix = this.display ? `|${this.display.toString()}` : '';
    return `${WIKILINK_OPEN}${this.value__}${displaySuffix}${WIKILINK_CLOSE}`;
  }
}
