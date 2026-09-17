/**
 * @file
 *
 * Mock of Obsidian's `TagValue`, the Bases value wrapping a tag.
 */

import type { TagValue as TagValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

/**
 * Mock of Obsidian's `TagValue`: a string value holding a tag. The mock stores the tag text as given.
 */
export class TagValue extends StringValue {
  /**
   * Creates a tag value.
   *
   * @param value - The tag text.
   */
  public constructor(value: string) {
    super(value);
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
}
