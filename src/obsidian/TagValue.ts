/**
 * @file
 *
 * Mock of Obsidian's `TagValue`, the Bases value wrapping a tag.
 */

import type { TagValue as TagValueOriginal } from 'obsidian';

import type { Value } from './Value.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

const TAG_PREFIX = '#';
const NESTED_TAG_SEPARATOR = '/';

/**
 * Mock of Obsidian's `TagValue`: a string value holding a tag.
 *
 * ONE known departure, tracked separately: Obsidian's constructor overwrites the wrapped text with its
 * `#`-prefixed form, so `new TagValue('alpha').toString()` is `#alpha` there and `alpha` here. It is not
 * what {@link TagValue.tagMatches} compares on — {@link TagValue.lowerTag} normalizes on its own — so the
 * matching below is faithful either way.
 */
export class TagValue extends StringValue {
  /**
   * The tag `#`-prefixed and lower-cased, the form {@link TagValue.tagMatches} compares on. Obsidian keeps
   * the same field, computed once in the constructor, and the mock computes it the same way — from the text
   * the value was CREATED with, so a later write to `data` does not move it.
   *
   * Private because Obsidian's own name is the only honest one for it (L4) and neither `obsidian.d.ts` nor
   * `obsidian-typings` declares it, which would make a public `lowerTag` a member `conformance.test.ts`'s
   * reverse rule rejects. Nothing outside the class reads it, so L8 settles it as an implementation detail.
   */
  private readonly lowerTag: string;

  /**
   * Creates a tag value.
   *
   * @param value - The tag text.
   */
  public constructor(value: string) {
    super(value);
    this.lowerTag = normalizeTag(value).toLowerCase();
    const self = strictProxy(this);
    self.constructor5__(value);
    return self;
  }

  /**
   * Mock-only factory: creates a tag value, spyable via `vi.spyOn(TagValue, 'create2__')`. It is the subclass variant
   * of {@link StringValue.create__}, numbered because its required `value` makes the signature incompatible with the base factory.
   *
   * @param value - The tag text.
   * @returns The new tag value.
   */
  public static create2__(value: string): TagValue {
    return new TagValue(value);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `TagValue` as this mock.
   *
   * @param value - The value typed as the original `TagValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType5__(value: TagValueOriginal): TagValue {
    return strictProxy(value, TagValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `TagValue` type.
   *
   * @returns The same object, typed as the original `TagValue`.
   */
  public asOriginalType5__(): TagValueOriginal {
    return strictProxy<TagValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(TagValue.prototype, 'constructor5__')`.
   *
   * @param _value - The tag text the value was created with.
   */
  public constructor5__(_value: string): void {
    noop();
  }

  /**
   * Tells whether this tag is `value`, or nests under it.
   *
   * The test runs on the `#`-prefixed, lower-cased forms of both sides, so `#Parent` matches `parent` and
   * `#parent/child` matches `#parent` — but `#parenthesis` does not, because the character following the
   * shorter tag has to be the `/` that opens a nesting level.
   *
   * The direction matters: THIS value is the nested one and `value` the parent it is tested against, which
   * is what makes `TagsListValue.includes` answer a formula's `tags.contains("#parent")`.
   *
   * @param value - The tag to match against. Any non-string value never matches; a plain `StringValue` is
   * read as a tag, `#`-prefix and all, exactly as another `TagValue` would be.
   * @returns Whether this tag matches.
   */
  public tagMatches(value: Value): boolean {
    if (!(value instanceof StringValue)) {
      return false;
    }
    const otherLowerTag = value instanceof TagValue ? value.lowerTag : normalizeTag(value.data).toLowerCase();
    return this.lowerTag.startsWith(otherLowerTag)
      && (this.lowerTag.length === otherLowerTag.length || this.lowerTag.charAt(otherLowerTag.length) === NESTED_TAG_SEPARATOR);
  }
}

/**
 * Prefixes a tag with `#` unless it already carries one, as Obsidian's own helper does.
 *
 * @param tag - The tag text.
 * @returns The `#`-prefixed tag.
 */
function normalizeTag(tag: string): string {
  return tag.startsWith(TAG_PREFIX) ? tag : `${TAG_PREFIX}${tag}`;
}
