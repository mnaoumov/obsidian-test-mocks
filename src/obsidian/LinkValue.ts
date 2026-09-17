/**
 * @file
 *
 * Mock of Obsidian's `LinkValue`, the Bases value wrapping an internal wikilink.
 */

import type { LinkValue as LinkValueOriginal } from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { StringValue } from './StringValue.ts';

/**
 * Mock of Obsidian's `LinkValue`: a string value holding a link target.
 *
 * Only the link target is stored, as the string value; the app, source path and display text are not kept.
 */
export class LinkValue extends StringValue {
  /**
   * Creates a link value.
   *
   * @param app - The app used to resolve the link.
   * @param value - The link target.
   * @param sourcePath - The path of the note the link is in, used to resolve relative targets.
   * @param display - The display text, or `null`/omitted to show the target.
   */
  public constructor(app: App, value: string, sourcePath: string, display?: null | string) {
    super(value);
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
  public static create2__(app: App, value: string, sourcePath: string, display?: null | string): LinkValue {
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
   * Creates a link value from wikilink syntax, such as `[[Welcome|Example Link]]`.
   *
   * The mock only accepts a string that is entirely one wikilink, and it drops the `|` display text, keeping just
   * the target.
   *
   * @param app - The app used to resolve the link.
   * @param input - The wikilink text to parse.
   * @param sourcePath - The path of the note the link is in.
   * @returns The link value, or `null` when `input` is not a wikilink.
   */
  public static parseFromString(app: App, input: string, sourcePath: string): LinkValue | null {
    const match = /^\[\[(?<inner>[^\]]+)\]\]$/.exec(input);
    if (!match) {
      return null;
    }
    const inner = ensureNonNullable(match.groups?.['inner']);
    const pipeIndex = inner.indexOf('|');
    const linkValue = LinkValue.create2__(app, pipeIndex === -1 ? inner : inner.slice(0, pipeIndex), sourcePath);
    return linkValue;
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
  public constructor5__(_app: App, _value: string, _sourcePath: string, _display?: null | string): void {
    noop();
  }
}
