/**
 * @file
 *
 * The conversion behind `FileValue.getLinks` and `FileValue.getEmbeds`: a cached reference turned into a
 * `LinkValue`.
 *
 * Obsidian spells it `LinkValue.fromReference`, a static that NEITHER `obsidian.d.ts` NOR
 * `obsidian-typings` declares. L1 binds an exported class's surface to those two and L4 forbids a `__`
 * suffix on something Obsidian really has, so it lives here instead — the same call `lazy-evaluator.ts`
 * makes for the one function Obsidian installs on two classes.
 */

import type { Reference as ReferenceOriginal } from 'obsidian';

import type { App } from '../obsidian/App.ts';

import { LinkValue } from '../obsidian/LinkValue.ts';
import { StringValue } from '../obsidian/StringValue.ts';

/**
 * Wraps a cached link, embed or frontmatter-link reference as a `LinkValue`, as Obsidian's
 * `LinkValue.fromReference` does.
 *
 * @param app - The app used to resolve the link.
 * @param sourcePath - The path of the note the reference was found in.
 * @param reference - The cached reference.
 * @returns A link value over the reference's `link`, with its `displayText` as the display text when the
 * reference has one and no display text otherwise. An empty `displayText` counts as none, which is
 * Obsidian's own truthiness test rather than a presence test.
 */
export function linkValueFromReference(app: App, sourcePath: string, reference: ReferenceOriginal): LinkValue {
  return LinkValue.create2__(app, reference.link, sourcePath, reference.displayText ? StringValue.create__(reference.displayText) : null);
}
