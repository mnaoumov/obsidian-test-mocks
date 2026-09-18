/**
 * @file
 *
 * The `ListValue` subclass behind `FileValue.getTags` and a frontmatter `tags` property.
 *
 * Obsidian does NOT answer either of those with a plain `ListValue`: it answers with a subclass of one
 * that carries the `lucide-tags` icon and an `includes` built on `TagValue.tagMatches`, so a formula's
 * `tags.contains("#parent")` is true of a note tagged `#parent/child`. The subclass is anonymous in the
 * shipped bundle and declared in NEITHER `obsidian.d.ts` NOR `obsidian-typings`, which both type those two
 * accessors as a plain `ListValue` — so L1 keeps it out of `src/obsidian/` and L4 forbids the `__` suffix
 * that would claim Obsidian lacks it. That is the same pair of reasons `front-matter-object-value.ts` and
 * `link-value-from-reference.ts` give, and this file sits beside them for it.
 */

import type { Value } from '../obsidian/Value.ts';

import { ListValue } from '../obsidian/ListValue.ts';
import { TagValue } from '../obsidian/TagValue.ts';
import { castTo } from './castTo.ts';
import { noop } from './noop.ts';
import { strictProxy } from './strict-proxy.ts';

/**
 * A list of tags, as Obsidian builds one for `file.tags` and for a frontmatter `tags` property.
 *
 * It wraps its elements EAGERLY — the constructor takes tag TEXT and builds a `TagValue` per entry — where
 * the base list converts an element only when something reads it. That is Obsidian's own arithmetic, and it
 * is what lets {@link TagsListValue.includes} read `data` directly.
 */
export class TagsListValue extends ListValue {
  /**
   * The lucide icon name standing for this value's type, `lucide-tags` where a plain list carries
   * `lucide-list`.
   */
  public override icon = 'lucide-tags';

  /**
   * Creates a tag list.
   *
   * @param value - The tag texts, one per element.
   */
  public constructor(value: string[]) {
    super(value.map((tag) => TagValue.create2__(tag)));
    const self = strictProxy(this);
    self.constructor4__(value);
    return self;
  }

  /**
   * Mock-only factory: creates a tag list, spyable via `vi.spyOn(TagsListValue, 'create2__')`. Numbered
   * because its `string[]` makes the signature incompatible with {@link ListValue.create__}.
   *
   * @param value - The tag texts, one per element.
   * @returns The new tag list.
   */
  public static create2__(value: string[]): TagsListValue {
    return new TagsListValue(value);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(TagsListValue.prototype, 'constructor4__')`.
   *
   * @param _value - The tag texts the list was created with.
   */
  public constructor4__(_value: string[]): void {
    noop();
  }

  /**
   * Tells whether the list contains a tag.
   *
   * @param value - The tag to look for, as a `TagValue` or a plain `StringValue`.
   * @returns Whether any element's {@link TagValue.tagMatches} accepts it — so a nested tag answers for its
   * parent, and `#parent` is found in a list holding only `#parent/child`.
   *
   * It reads the RAW elements rather than going through `ListValue.get`, exactly as Obsidian does, which is
   * safe because the constructor wrapped every one of them. An element written into `data` afterwards is
   * NOT a `TagValue` and throws here, which is Obsidian's behavior too.
   */
  public override includes(value: Value): boolean {
    for (const element of this.data) {
      if (castTo<TagValue>(element).tagMatches(value)) {
        return true;
      }
    }
    return false;
  }
}
