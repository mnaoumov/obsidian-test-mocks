/**
 * @file
 *
 * Mock of Obsidian's `LinkValue`, the Bases value wrapping an internal wikilink.
 */

import type { LinkValue as LinkValueOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { RenderContext } from './RenderContext.ts';
import type { TFile } from './TFile.ts';

import { isFileValue } from '../internal/file-value-registry.ts';
import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { getLinkpath } from './functions/getLinkpath.ts';
import { StringValue } from './StringValue.ts';
import { Value } from './Value.ts';

const WIKILINK_OPEN = '[[';
const WIKILINK_CLOSE = ']]';

/**
 * Mock of Obsidian's `LinkValue`: a string value holding a link target, with the note it is in and optional display
 * text.
 */
export class LinkValue extends StringValue {
  /**
   * The value type's identifier, `'Link'` - Obsidian's own name for this class of value.
   */
  public static override type = 'Link';

  /**
   * The app used to resolve the link.
   */
  public app: App;

  /**
   * The display text, or `null` to show the target.
   */
  public display: null | StringValue;

  /**
   * The lucide icon name standing for this value's type.
   */
  public override icon = 'lucide-link';

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
   * Compares this link with another, as Obsidian does: by target TEXT, source path and display text - never
   * by what the two resolve to. {@link LinkValue.looseEquals} is the comparison that resolves.
   *
   * `sourcePath` is part of it, so the same target written in two different notes gives two unequal links;
   * the displays are compared with the static `Value.equals`, so a missing display equals only another
   * missing one.
   *
   * @param other - The link to compare with.
   * @returns Whether the target, the source path and the display text all match.
   */
  public override equals(other: this): boolean {
    return this.data === other.data
      && this.sourcePath === other.sourcePath
      && Value.equals(this.display, other.display);
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
   * Loosely compares this link with a value of any type, as Obsidian does, in three branches:
   *
   * - Another link: whether both RESOLVE to the same file. When either side resolves to nothing, the two
   *   target texts are compared instead - so the source paths and the display texts are both ignored here,
   *   where {@link LinkValue.equals} weighs them.
   * - A `StringValue`: it is parsed as wikilink syntax against an EMPTY source path, and this comparison is
   *   retried against the result. A string that is not wrapped in `[[` and `]]` matches nothing.
   * - A `FileValue`: whether this link resolves to that file. Obsidian decides that with an `instanceof`;
   *   the mock asks `file-value-registry.ts`, whose file says why.
   *
   * @param other - The value to compare with.
   * @returns Whether the two name the same target under one of those readings.
   */
  public override looseEquals(other: Value): boolean {
    if (other instanceof LinkValue) {
      const resolved = this.resolve();
      const otherResolved = other.resolve();
      return resolved && otherResolved ? resolved === otherResolved : this.data === other.data;
    }
    if (other instanceof StringValue) {
      const parsed = LinkValue.parseFromString(this.app, other.data, '');
      if (parsed) {
        return this.looseEquals(parsed);
      }
    }
    return isFileValue(other) && this.resolve() === other.file;
  }

  /**
   * Renders the link into an element, as Obsidian does: through {@link RenderContext.renderFileLink}, which
   * builds the internal link the app shows.
   *
   * The link's TARGET TEXT is handed over rather than the file it resolves to, so the context resolves it
   * itself - and marks the link `is-unresolved` when nothing answers. Note that it resolves from the VAULT
   * ROOT, not from {@link LinkValue.sourcePath}: Obsidian's `renderFileLink` passes an empty source path, so
   * a rendered link and {@link LinkValue.resolve} can disagree about a relative target.
   *
   * @param el - The element to render into.
   * @param context - The rendering context, which owns the link markup.
   */
  public override renderTo(el: HTMLElement, context: RenderContext): void {
    context.renderFileLink(this.data, this.display, el);
  }

  /**
   * Resolves the link to the file it points at, as Obsidian does: the target's link path - its text up to
   * any `#` subpath - looked up from {@link LinkValue.sourcePath}.
   *
   * @returns The target file, or `null` when nothing in the vault answers to the target.
   */
  public resolve(): null | TFile {
    return this.app.metadataCache.getFirstLinkpathDest(getLinkpath(this.data), this.sourcePath);
  }

  /**
   * Renders the link as wikilink syntax.
   *
   * @returns `[[target]]`, or `[[target|display]]` when the link has display text.
   */
  public override toString(): string {
    const displaySuffix = this.display ? `|${this.display.toString()}` : '';
    return `${WIKILINK_OPEN}${this.data}${displaySuffix}${WIKILINK_CLOSE}`;
  }
}
