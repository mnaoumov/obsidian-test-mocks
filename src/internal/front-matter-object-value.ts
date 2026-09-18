/**
 * @file
 *
 * The `ObjectValue` behind `FileValue.getProps`: a note's frontmatter wrapped for a Bases formula.
 *
 * Obsidian spells it `ObjectValue.fromFrontMatter`, a static that NEITHER `obsidian.d.ts` NOR
 * `obsidian-typings` declares. L1 binds an exported class's surface to those two and L4 forbids a `__`
 * suffix on something Obsidian really has, so it lives here instead — the same call
 * `link-value-from-reference.ts` makes.
 *
 * What makes it more than a constructor call is its evaluator: frontmatter is the one place where a
 * plain string may stand for a wikilink, a URL or a date, and where a `tags` property is a list of tags
 * rather than a list of strings. The evaluator REINSTALLS itself on every nested list and object it
 * produces, so those readings reach arbitrarily deep into the frontmatter rather than only its top level.
 */

import type { App } from '../obsidian/App.ts';
import type { TFile } from '../obsidian/TFile.ts';
import type { Value } from '../obsidian/Value.ts';

import { DateValue } from '../obsidian/DateValue.ts';
import { LinkValue } from '../obsidian/LinkValue.ts';
import { ListValue } from '../obsidian/ListValue.ts';
import { ObjectValue } from '../obsidian/ObjectValue.ts';
import { TagValue } from '../obsidian/TagValue.ts';
import { UrlValue } from '../obsidian/UrlValue.ts';
import { castTo } from './castTo.ts';
import { lazyEvaluate } from './lazy-evaluator.ts';

const TAGS_KEY = 'tags';

/**
 * Wraps a note's frontmatter as an `ObjectValue`, as Obsidian's `ObjectValue.fromFrontMatter` does.
 *
 * @param app - The app used to resolve a wikilink found in the frontmatter.
 * @param file - The note the frontmatter belongs to; its path is the source path of every link.
 * @param frontMatter - The parsed frontmatter.
 * @returns An object value over a SHALLOW COPY of `frontMatter`, so evaluating a property never writes
 * back into the metadata cache, carrying the frontmatter evaluator described in this file's notes.
 */
export function createFrontMatterObjectValue(app: App, file: TFile, frontMatter: Record<string, unknown>): ObjectValue {
  const objectValue = ObjectValue.create__({ ...frontMatter });

  function evaluate(keyOrIndex: number | string, raw: unknown): Value {
    if (typeof keyOrIndex === 'string' && keyOrIndex.toLowerCase() === TAGS_KEY) {
      if (isStringArray(raw)) {
        // Every element is wrapped, including a `null` the emptiness test above skipped, which is
        // Obsidian's own arithmetic rather than a gap here.
        return ListValue.create__(raw.map((tag) => TagValue.create2__(castTo<string>(tag))));
      }
      if (typeof raw === 'string') {
        return ListValue.create__([TagValue.create2__(raw)]);
      }
    }

    if (typeof raw === 'string') {
      const link = LinkValue.parseFromString(app, raw, file.path);
      if (link) {
        return link;
      }
      if (isUrl(raw)) {
        return UrlValue.create2__(raw);
      }
      const date = DateValue.parseFromString(raw);
      if (date) {
        return date;
      }
    }

    const value = lazyEvaluate(raw);
    if (value instanceof ListValue || value instanceof ObjectValue) {
      value.lazyEvaluator = evaluate;
    }
    return value;
  }

  objectValue.lazyEvaluator = evaluate;
  return objectValue;
}

/**
 * Tells whether a raw property is the array of tag names the `tags` key may hold, as Obsidian's own test
 * does: an array whose elements are all strings once `null` and `undefined` are set aside. An EMPTY array
 * passes, and so does one that holds nothing but `null`.
 *
 * @param raw - The raw property.
 * @returns Whether it is such an array.
 */
function isStringArray(raw: unknown): raw is unknown[] {
  return Array.isArray(raw) && raw.every((element) => element === null || element === undefined || typeof element === 'string');
}

/**
 * Tells whether a string is the URL Obsidian would show as one: parseable by `URL` and free of spaces,
 * which is what keeps a sentence beginning with a word and a colon from being read as a URL.
 *
 * @param raw - The string to test.
 * @returns Whether it is a URL.
 */
function isUrl(raw: string): boolean {
  if (raw.includes(' ')) {
    return false;
  }
  try {
    // The constructor is the test: it throws for anything that is not a URL.
    new URL(raw);
    return true;
  } catch {
    return false;
  }
}
